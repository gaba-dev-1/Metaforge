import { Pool, QueryResult, QueryResultRow } from 'pg';
import { LogSeverity, logMessage } from '../logger';
import { sanitizeForDatabase } from './sanitizeData';

/**
 * Improved database connection pool with robust error handling
 */
class DbPool {
  private static instance: Pool | null = null;
  private static connectionAttempts = 0;
  private static readonly MAX_ATTEMPTS = 3;
  
  /**
   * Get the database pool instance with proper initialization
   */
  public static getPool(): Pool {
    if (!DbPool.instance) {
      // Check environment variables
      if (!process.env.NEON_DATABASE_URL) {
        logMessage(LogSeverity.ERROR, 'NEON_DATABASE_URL environment variable not set');
        throw new Error('Database connection string not found in environment');
      }
      
      try {
        DbPool.instance = new Pool({
          connectionString: process.env.NEON_DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          },
          max: 10, // Maximum connections in pool
          idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
          connectionTimeoutMillis: 10000, // Connection timeout after 10 seconds
        });
        
        // Set up event listeners
        DbPool.instance.on('error', (err) => {
          logMessage(LogSeverity.ERROR, 'Unexpected database pool error', err);
          
          // Reset pool on fatal error
          if (DbPool.connectionAttempts < DbPool.MAX_ATTEMPTS) {
            DbPool.instance = null;
            DbPool.connectionAttempts++;
            logMessage(LogSeverity.WARN, 
              `Attempting to recover pool (attempt ${DbPool.connectionAttempts}/${DbPool.MAX_ATTEMPTS})`);
          }
        });
        
        // Reset connection attempts on success
        DbPool.connectionAttempts = 0;
        
        logMessage(LogSeverity.INFO, 'Database pool created successfully');
      } catch (err) {
        logMessage(LogSeverity.ERROR, 'Failed to create database pool', err);
        throw err;
      }
    }
    
    return DbPool.instance;
  }
  
  /**
   * Cleanly end the pool
   */
  public static async end(): Promise<void> {
    if (DbPool.instance) {
      await DbPool.instance.end();
      DbPool.instance = null;
      logMessage(LogSeverity.INFO, 'Database pool has been closed');
    }
  }
}

/**
 * Execute a SQL query with enhanced logging and error handling
 */
export async function query<T extends QueryResultRow = any>(
  text: string, 
  params: any[] = [],
  label?: string
): Promise<QueryResult<T>> {
  const start = Date.now();
  const queryLabel = label || text.slice(0, 40).replace(/\s+/g, ' ');
  
  try {
    const pool = DbPool.getPool();
    const result = await pool.query<T>(text, params);
    
    // Performance logging for slow queries
    const duration = Date.now() - start;
    if (duration > 1000) {
      logMessage(
        LogSeverity.WARN, 
        `Slow query (${duration}ms): ${queryLabel}`, 
        { rowCount: result.rowCount }
      );
    }
    
    return result;
  } catch (error: any) {
    logMessage(
      LogSeverity.ERROR,
      `Database query failed: ${queryLabel}`,
      { error: error.message, params: params.slice(0, 3) }
    );
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      logMessage(LogSeverity.ERROR, 'Database connection failed, resetting pool');
      DbPool.getPool(); // This will reset the pool due to the error handling
    }
    
    throw error;
  }
}

/**
 * Initialize the database schema - completely rewritten
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    logMessage(LogSeverity.INFO, 'Initializing database schema');
    
    // Check if tables exist first
    const tablesExist = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'stats'
      )
    `);
    
    // If tables already exist, skip recreation
    if (tablesExist.rows[0].exists) {
      logMessage(LogSeverity.INFO, 'Database schema already exists, skipping initialization');
      return true;
    }
    
    // Create matches table
    await query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        match_id TEXT UNIQUE NOT NULL,
        region TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `, [], 'createMatchesTable');
    
    // Create stats table
    await query(`
      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        region TEXT NOT NULL,
        data JSONB NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `, [], 'createStatsTable');
    
    // Create region status table
    await query(`
      CREATE TABLE IF NOT EXISTS region_status (
        region TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'active',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        error_count INTEGER DEFAULT 0,
        last_error TEXT
      )
    `, [], 'createRegionStatusTable');
    
    // Create optimal indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_matches_region ON matches(region);
      CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_stats_type_region ON stats(type, region);
      CREATE INDEX IF NOT EXISTS idx_stats_created_at ON stats(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_stats_gin ON stats USING GIN (data jsonb_path_ops);
    `, [], 'createIndexes');
    
    logMessage(LogSeverity.INFO, 'Database schema initialized successfully');
    return true;
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Failed to initialize database schema', error);
    return false;
  }
}

/**
 * Save match data to the database
 */
export async function saveMatch(matchId: string, region: string, data: any): Promise<boolean> {
  try {
    await query(
      'INSERT INTO matches (match_id, region, data) VALUES ($1, $2, $3) ON CONFLICT (match_id) DO NOTHING',
      [matchId, region, JSON.stringify(data)],
      'saveMatch'
    );
    return true;
  } catch (error) {
    logMessage(LogSeverity.ERROR, `Failed to save match: ${matchId}`, error);
    return false;
  }
}

/**
 * Get all matches from the database, optionally filtered by region
 */
export async function getMatches(region?: string): Promise<any[]> {
  try {
    let result;
    if (region && region !== 'all') {
      result = await query(
        'SELECT data FROM matches WHERE region = $1 ORDER BY created_at DESC',
        [region],
        'getMatchesByRegion'
      );
    } else {
      result = await query(
        'SELECT data FROM matches ORDER BY created_at DESC',
        [],
        'getAllMatches'
      );
    }
    return result.rows.map(row => row.data);
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Failed to get matches', error);
    return [];
  }
}

/**
 * Save processed statistics to the database
 */
export async function saveStats(type: string, region: string, data: any): Promise<boolean> {
  try {
    // Log data statistics to help with debugging
    let dataSize = 0;
    let entityCount = 0;
    
    if (data) {
      dataSize = JSON.stringify(data).length;
      
      // Count entities based on type
      if (type === 'compositions' && data.compositions) {
        entityCount = data.compositions.length;
      } else if (type === 'units' && data.units) {
        entityCount = data.units.length;
      } else if (type === 'traits' && data.traits) {
        entityCount = data.traits.length;
      } else if (type === 'items' && data.items) {
        entityCount = data.items.length;
      }
    }
    
    logMessage(LogSeverity.INFO, 
      `Saving ${type} data for ${region}: ${entityCount} entities, ${Math.round(dataSize / 1024)}KB`
    );
    
    await query(
      'INSERT INTO stats (type, region, data) VALUES ($1, $2, $3)',
      [type, region, JSON.stringify(data)],
      'saveStats'
    );
    
    logMessage(LogSeverity.INFO, `Successfully saved ${type} data for ${region}`);
    return true;
  } catch (error) {
    logMessage(LogSeverity.ERROR, `Failed to save stats: ${type}/${region}`, error);
    return false;
  }
}

/**
 * Get the latest statistics from the database
 */
export async function getStats(type: string, region: string = 'all'): Promise<any> {
  try {
    const result = await query(
      'SELECT data FROM stats WHERE type = $1 AND region = $2 ORDER BY created_at DESC LIMIT 1',
      [type, region],
      'getStats'
    );
    
    if (result.rows.length === 0) {
      logMessage(LogSeverity.INFO, `No stats found for ${type}/${region}`);
      return null;
    }
    
    return result.rows[0].data;
  } catch (error) {
    logMessage(LogSeverity.ERROR, `Failed to get stats: ${type}/${region}`, error);
    return null;
  }
}

/**
 * Update region status
 */
export async function updateRegionStatus(
  region: string, 
  status: string, 
  errorMessage?: string
): Promise<boolean> {
  try {
    if (status === 'error' && errorMessage) {
      await query(
        `INSERT INTO region_status (region, status, updated_at, error_count, last_error) 
         VALUES ($1, $2, NOW(), 1, $3) 
         ON CONFLICT (region) DO UPDATE 
         SET status = $2, 
             updated_at = NOW(), 
             error_count = region_status.error_count + 1, 
             last_error = $3`,
        [region, status, errorMessage],
        'updateRegionStatusWithError'
      );
    } else {
      await query(
        `INSERT INTO region_status (region, status, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (region) DO UPDATE 
         SET status = $2, 
             updated_at = NOW()`,
        [region, status],
        'updateRegionStatus'
      );
    }
    return true;
  } catch (error) {
    logMessage(LogSeverity.ERROR, `Failed to update region status: ${region}`, error);
    return false;
  }
}

/**
 * Get all region statuses
 */
export async function getRegionStatuses(): Promise<any[]> {
  try {
    const result = await query(
      'SELECT * FROM region_status',
      [],
      'getRegionStatuses'
    );
    return result.rows;
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Failed to get region statuses', error);
    return [];
  }
}

/**
 * Clean up old data
 */
export async function cleanupOldData(daysToKeep: number = 7): Promise<boolean> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    await query(
      'DELETE FROM matches WHERE created_at < $1',
      [cutoffDate],
      'cleanupOldMatches'
    );
    
    // Keep only the latest stats for each type/region
    await query(`
      DELETE FROM stats WHERE id NOT IN (
        SELECT id FROM (
          SELECT id, 
                 ROW_NUMBER() OVER (PARTITION BY type, region ORDER BY created_at DESC) as row_num 
          FROM stats
        ) t 
        WHERE t.row_num <= 2
      )
    `, [], 'cleanupOldStats');
    
    return true;
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Failed to clean up old data', error);
    return false;
  }
}

/**
 * Insert sample data for initial setup
 */
export async function insertSampleData(): Promise<boolean> {
  try {
    logMessage(LogSeverity.INFO, 'Inserting sample data');
    
    const regions = ['all', 'NA', 'EUW', 'KR', 'BR', 'JP'];
    
    // Create minimal sample data for all entity types
    const sampleComposition = {
      id: 'sample-comp',
      name: 'Sample Composition',
      icon: '/assets/app/default.png',
      count: 1,
      avgPlacement: 4.5,
      winRate: 25,
      top4Rate: 50,
      traits: [],
      units: []
    };
    
    const sampleUnit = {
      id: 'sample-unit',
      name: 'Sample Unit',
      icon: '/assets/app/default.png',
      cost: 3,
      count: 1,
      avgPlacement: 4.5,
      winRate: 25,
      top4Rate: 50,
      stats: {
        count: 1,
        avgPlacement: 4.5,
        winRate: 25,
        top4Rate: 50
      }
    };
    
    const sampleTrait = {
      id: 'sample-trait',
      name: 'Sample Trait',
      icon: '/assets/app/default.png',
      tier: 2,
      numUnits: 4,
      count: 1,
      avgPlacement: 4.5,
      winRate: 25,
      top4Rate: 50,
      stats: {
        count: 1,
        avgPlacement: 4.5,
        winRate: 25,
        top4Rate: 50
      }
    };
    
    const sampleItem = {
      id: 'sample-item',
      name: 'Sample Item',
      icon: '/assets/app/default.png',
      category: 'completed',
      count: 1,
      avgPlacement: 4.5,
      winRate: 25,
      top4Rate: 50,
      stats: {
        count: 1,
        avgPlacement: 4.5,
        winRate: 25,
        top4Rate: 50
      }
    };
    
    // Sample data for each entity type
    const compositionsData = {
      compositions: [sampleComposition],
      summary: { 
        totalGames: 1, 
        avgPlacement: 4.5, 
        topComps: [sampleComposition]
      },
      region: 'all'
    };
    
    const unitsData = {
      units: [sampleUnit],
      summary: { 
        totalGames: 1, 
        avgPlacement: 4.5, 
        topUnits: [sampleUnit]
      },
      region: 'all'
    };
    
    const traitsData = {
      traits: [sampleTrait],
      summary: { 
        totalGames: 1, 
        avgPlacement: 4.5, 
        topTraits: [sampleTrait]
      },
      region: 'all'
    };
    
    const itemsData = {
      items: [sampleItem],
      summary: { 
        totalGames: 1, 
        avgPlacement: 4.5, 
        topItems: [sampleItem]
      },
      region: 'all'
    };
    
    // Insert data for all regions and entity types
    for (const region of regions) {
      compositionsData.region = region;
      unitsData.region = region;
      traitsData.region = region;
      itemsData.region = region;
      
      await saveStats('compositions', region, compositionsData);
      await saveStats('units', region, unitsData);
      await saveStats('traits', region, traitsData);
      await saveStats('items', region, itemsData);
      
      // Add region status
      await updateRegionStatus(region, 'active');
    }
    
    logMessage(LogSeverity.INFO, 'Sample data inserted successfully for all regions and entity types');
    return true;
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Failed to insert sample data', error);
    return false;
  }
}

// Export sanitizeForDatabase function
export { sanitizeForDatabase };
