// Function to safely sanitize data for database storage
export function sanitizeForDatabase(data: any): any {
  if (!data) return { compositions: [], units: [], traits: [], items: [] };
  
  try {
    // Create completely new objects instead of trying to sanitize existing ones
    const sanitized: any = {
      region: data.region || 'unknown',
      summary: {
        totalGames: data.summary?.totalGames || 0,
        avgPlacement: data.summary?.avgPlacement || 0
      },
      compositions: [],
      units: [],
      traits: [],
      items: []
    };
    
    // Add top entities to summary if they exist
    if (data.summary?.topComps) sanitized.summary.topComps = [];
    if (data.summary?.topUnits) sanitized.summary.topUnits = [];
    if (data.summary?.topTraits) sanitized.summary.topTraits = [];
    if (data.summary?.topItems) sanitized.summary.topItems = [];
    
    // Add compositions if they exist
    if (data.compositions && Array.isArray(data.compositions)) {
      sanitized.compositions = data.compositions.map((comp: any) => {
        if (!comp) return null;
        
        return {
          id: comp.id || 'unknown',
          name: comp.name || 'Unknown Composition',
          icon: comp.icon || '',
          count: comp.count || 0,
          avgPlacement: comp.avgPlacement || 0,
          winRate: comp.winRate || 0,
          top4Rate: comp.top4Rate || 0,
          playRate: comp.playRate || 0,
          stats: {
            count: comp.count || comp.stats?.count || 0,
            avgPlacement: comp.avgPlacement || comp.stats?.avgPlacement || 0,
            winRate: comp.winRate || comp.stats?.winRate || 0,
            top4Rate: comp.top4Rate || comp.stats?.top4Rate || 0
          },
          traits: Array.isArray(comp.traits) ? comp.traits.map((trait: any) => ({
            id: trait.id || 'unknown',
            name: trait.name || 'Unknown Trait',
            icon: trait.icon || '',
            tier: trait.tier || 0,
            numUnits: trait.numUnits || 0,
            tierIcon: trait.tierIcon || '',
            stats: {
              count: trait.count || trait.stats?.count || 0,
              avgPlacement: trait.avgPlacement || trait.stats?.avgPlacement || 0,
              winRate: trait.winRate || trait.stats?.winRate || 0,
              top4Rate: trait.top4Rate || trait.stats?.top4Rate || 0
            }
          })) : [],
          units: Array.isArray(comp.units) ? comp.units.map((unit: any) => ({
            id: unit.id || 'unknown',
            name: unit.name || 'Unknown Unit',
            icon: unit.icon || '',
            cost: unit.cost || 0,
            count: unit.count || 0,
            stats: {
              count: unit.count || unit.stats?.count || 0,
              avgPlacement: unit.avgPlacement || unit.stats?.avgPlacement || 0,
              winRate: unit.winRate || unit.stats?.winRate || 0,
              top4Rate: unit.top4Rate || unit.stats?.top4Rate || 0
            },
            items: Array.isArray(unit.items) ? unit.items.map((item: any) => ({
              id: item.id || 'unknown',
              name: item.name || 'Unknown Item',
              icon: item.icon || '',
              category: item.category || 'unknown',
              stats: {
                count: item.count || item.stats?.count || 0,
                avgPlacement: item.avgPlacement || item.stats?.avgPlacement || 0,
                winRate: item.winRate || item.stats?.winRate || 0,
                top4Rate: item.top4Rate || item.stats?.top4Rate || 0
              }
            })) : []
          })) : []
        };
      }).filter(Boolean);
    }
    
    // Add units if they exist
    if (data.units && Array.isArray(data.units)) {
      sanitized.units = data.units.map((unit: any) => {
        if (!unit) return null;
        
        return {
          id: unit.id || 'unknown',
          name: unit.name || 'Unknown Unit',
          icon: unit.icon || '',
          cost: unit.cost || 0,
          count: unit.count || 0,
          avgPlacement: unit.avgPlacement || 0,
          winRate: unit.winRate || 0,
          top4Rate: unit.top4Rate || 0,
          playRate: unit.playRate || 0,
          stats: {
            count: unit.count || unit.stats?.count || 0,
            avgPlacement: unit.avgPlacement || unit.stats?.avgPlacement || 0,
            winRate: unit.winRate || unit.stats?.winRate || 0,
            top4Rate: unit.top4Rate || unit.stats?.top4Rate || 0
          },
          traits: unit.traits ? { ...unit.traits } : {},
          bestItems: Array.isArray(unit.bestItems) ? unit.bestItems.map((item: any) => ({
            id: item.id || 'unknown',
            name: item.name || 'Unknown Item',
            icon: item.icon || '',
            stats: item.stats ? { ...item.stats } : {
              count: item.count || 0,
              avgPlacement: item.avgPlacement || 0,
              winRate: item.winRate || 0,
              top4Rate: item.top4Rate || 0
            }
          })) : [],
          relatedComps: Array.isArray(unit.relatedComps) ? unit.relatedComps.map((comp: any) => ({
            id: comp.id || 'unknown',
            name: comp.name || 'Unknown Composition',
            icon: comp.icon || '',
            count: comp.count || 0,
            avgPlacement: comp.avgPlacement || 0,
            winRate: comp.winRate || 0,
            top4Rate: comp.top4Rate || 0,
            traits: [],
            units: []
          })) : []
        };
      }).filter(Boolean);
    }
    
    // Add traits if they exist
    if (data.traits && Array.isArray(data.traits)) {
      sanitized.traits = data.traits.map((trait: any) => {
        if (!trait) return null;
        
        return {
          id: trait.id || 'unknown',
          name: trait.name || 'Unknown Trait',
          icon: trait.icon || '',
          tier: trait.tier || 0,
          numUnits: trait.numUnits || 0,
          tierIcon: trait.tierIcon || '',
          count: trait.count || 0,
          avgPlacement: trait.avgPlacement || 0,
          winRate: trait.winRate || 0,
          top4Rate: trait.top4Rate || 0,
          playRate: trait.playRate || 0,
          stats: {
            count: trait.count || trait.stats?.count || 0,
            avgPlacement: trait.avgPlacement || trait.stats?.avgPlacement || 0,
            winRate: trait.winRate || trait.stats?.winRate || 0,
            top4Rate: trait.top4Rate || trait.stats?.top4Rate || 0
          },
          relatedComps: Array.isArray(trait.relatedComps) ? trait.relatedComps.map((comp: any) => ({
            id: comp.id || 'unknown',
            name: comp.name || 'Unknown Composition',
            icon: comp.icon || '',
            count: comp.count || 0,
            avgPlacement: comp.avgPlacement || 0,
            winRate: comp.winRate || 0,
            top4Rate: comp.top4Rate || 0,
            traits: [],
            units: []
          })) : []
        };
      }).filter(Boolean);
    }
    
    // Add items if they exist - CRITICAL FIX FOR UNITS WITH ITEM RELATIONSHIP
    if (data.items && Array.isArray(data.items)) {
      sanitized.items = data.items.map((item: any) => {
        if (!item) return null;
        
        // Process unitsWithItem with complete stats structure
        let safeUnitsWithItem: any[] = [];
        if (item.unitsWithItem && Array.isArray(item.unitsWithItem)) {
          safeUnitsWithItem = item.unitsWithItem.map((unit: any) => {
            // Ensure proper stats structure
            return {
              id: unit.id || 'unknown',
              name: unit.name || 'Unknown Unit',
              icon: unit.icon || '',
              cost: unit.cost || 0,
              count: unit.count || 0,
              winRate: unit.winRate || 0,
              avgPlacement: unit.avgPlacement || 0,
              stats: {
                count: unit.count || unit.stats?.count || 0,
                avgPlacement: unit.avgPlacement || unit.stats?.avgPlacement || 0,
                winRate: unit.winRate || unit.stats?.winRate || 0,
                top4Rate: unit.top4Rate || unit.stats?.top4Rate || 0
              },
              relatedComps: Array.isArray(unit.relatedComps) ? 
                unit.relatedComps.map((comp: any) => ({
                  id: comp.id || 'unknown',
                  name: comp.name || 'Unknown Composition',
                  icon: comp.icon || '',
                  traits: [],
                  units: []
                })) : []
            };
          });
        }
        
        // Create clean item object with all required properties
        return {
          id: item.id || 'unknown',
          name: item.name || 'Unknown Item',
          icon: item.icon || '',
          category: item.category || 'unknown',
          count: item.count || 0,
          avgPlacement: item.avgPlacement || 0,
          winRate: item.winRate || 0,
          top4Rate: item.top4Rate || 0,
          playRate: item.playRate || 0,
          stats: {
            count: item.count || item.stats?.count || 0,
            avgPlacement: item.avgPlacement || item.stats?.avgPlacement || 0,
            winRate: item.winRate || item.stats?.winRate || 0,
            top4Rate: item.top4Rate || item.stats?.top4Rate || 0
          },
          // Use our properly structured unitsWithItem array
          unitsWithItem: safeUnitsWithItem,
          relatedComps: Array.isArray(item.relatedComps) ? item.relatedComps.map((comp: any) => ({
            id: comp.id || 'unknown',
            name: comp.name || 'Unknown Composition',
            icon: comp.icon || '',
            count: comp.count || 0,
            avgPlacement: comp.avgPlacement || 0,
            winRate: comp.winRate || 0,
            top4Rate: comp.top4Rate || 0,
            traits: [],
            units: []
          })) : [],
          combos: Array.isArray(item.combos) ? item.combos.map((combo: any) => ({
            mainItem: {
              id: combo.mainItem?.id || item.id || 'unknown',
              name: combo.mainItem?.name || item.name || 'Unknown Item',
              icon: combo.mainItem?.icon || item.icon || ''
            },
            items: Array.isArray(combo.items) ? combo.items.map((comboItem: any) => ({
              id: comboItem.id || 'unknown',
              name: comboItem.name || 'Unknown Item',
              icon: comboItem.icon || ''
            })) : [],
            winRate: combo.winRate || 0,
            frequency: combo.frequency || 0
          })) : []
        };
      }).filter(Boolean);
    }
    
    return sanitized;
  } catch (error) {
    console.error("Error during sanitization:", error);
    return { 
      region: data.region,
      summary: { 
        totalGames: data.summary?.totalGames || 0,
        avgPlacement: data.summary?.avgPlacement || 0
      },
      compositions: [],
      units: [],
      traits: [],
      items: []
    };
  }
}
