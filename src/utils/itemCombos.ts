import { ProcessedItem, ItemCombo } from '@/types';

/**
 * Generate item combinations data for all items
 */
export function generateAllItemCombos(items: ProcessedItem[]): Record<string, ItemCombo[]> {
  const combos: Record<string, ItemCombo[]> = {};
  
  if (!items || items.length === 0) {
    return combos;
  }
  
  // For each item, find its most common combinations
  items.forEach(mainItem => {
    if (!mainItem.id || !mainItem.unitsWithItem) return;
    
    const itemCombos: Record<string, {
      items: ProcessedItem[];
      appearances: number;
      winRateSum: number;
      totalGames: number;
    }> = {};
    
    // Look through units that use this item to find common combinations
    mainItem.unitsWithItem.forEach(unit => {
      if (!unit.relatedComps) return;
      
      // Look through related compositions to find item combinations
      unit.relatedComps.forEach(comp => {
        // Find the unit in this composition
        const compUnit = comp.units?.find(u => u.id === unit.id);
        if (!compUnit || !compUnit.items) return;
        
        // Get all items on this unit (should include our main item)
        const unitItems = compUnit.items.filter(item => item.id !== mainItem.id);
        
        if (unitItems.length === 0) return;
        
        // Create a key for this combination
        const comboKey = [mainItem.id, ...unitItems.map(i => i.id).sort()].join(',');
        
        if (!itemCombos[comboKey]) {
          itemCombos[comboKey] = {
            items: [mainItem, ...unitItems],
            appearances: 0,
            winRateSum: 0,
            totalGames: 0
          };
        }
        
        // Update combo stats
        const weight = comp.count || 1;
        itemCombos[comboKey].appearances++;
        itemCombos[comboKey].totalGames += weight;
        itemCombos[comboKey].winRateSum += (comp.winRate || 0) * weight;
      });
    });
    
    // Convert to final combo format and sort by win rate
    const finalCombos = Object.values(itemCombos)
      .filter(combo => combo.appearances >= 2) // Only include combos that appear multiple times
      .map(combo => ({
        mainItem,
        items: combo.items,
        winRate: combo.totalGames > 0 ? combo.winRateSum / combo.totalGames : 0,
        frequency: combo.appearances / (mainItem.unitsWithItem?.length || 1)
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5); // Keep top 5 combos
    
    if (finalCombos.length > 0) {
      combos[mainItem.id] = finalCombos;
    }
  });
  
  return combos;
}
