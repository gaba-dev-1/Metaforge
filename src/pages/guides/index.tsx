import React, { useState } from 'react';
import { Layout, Card } from '@/components/ui';
import { FeatureBanner, HeaderBanner } from '@/components/common';
import { 
  BookOpen, 
  Info, 
  Star, 
  ShoppingBag, 
  Layers, 
  Users, 
  Activity, 
  Shield,
  Swords,
  Calendar,
  Clock,
  Puzzle
} from 'lucide-react';

// Updated guides data for Set 14: Cyber City
const guidesData = {
  set_info: {
    name: "Cyber City",
    number: 14,
    current_patch: "14.4",
    patch_date: "May 14, 2025",
    next_patch: "14.5",
    next_patch_date: "May 28, 2025"
  },
  champion_tiers: {
    description: "Champions in TFT are divided into cost tiers from 1 to 5, with higher cost units being more powerful but rarer to find. The champion pool is shared among all players, making champion availability a strategic consideration.",
    tiers: [1, 2, 3, 4, 5],
    pool_size_per_champion: {
      "1": 29,
      "2": 22,
      "3": 18,
      "4": 12,
      "5": 10
    },
    drop_rates: {
      level_1: { "1": "100%", "2": "0%", "3": "0%", "4": "0%", "5": "0%" },
      level_2: { "1": "100%", "2": "0%", "3": "0%", "4": "0%", "5": "0%" },
      level_3: { "1": "75%", "2": "25%", "3": "0%", "4": "0%", "5": "0%" },
      level_4: { "1": "55%", "2": "30%", "3": "15%", "4": "0%", "5": "0%" },
      level_5: { "1": "45%", "2": "33%", "3": "20%", "4": "2%", "5": "0%" },
      level_6: { "1": "30%", "2": "40%", "3": "25%", "4": "5%", "5": "0%" },
      level_7: { "1": "19%", "2": "35%", "3": "35%", "4": "10%", "5": "1%" },
      level_8: { "1": "15%", "2": "25%", "3": "35%", "4": "20%", "5": "5%" },
      level_9: { "1": "10%", "2": "15%", "3": "30%", "4": "30%", "5": "15%" },
      level_10: { "1": "5%", "2": "10%", "3": "20%", "4": "40%", "5": "25%" },
      level_11: { "1": "1%", "2": "2%", "3": "12%", "4": "50%", "5": "35%" }
    }
  },
  champion_star_levels: {
    description: "Combining three copies of the same champion creates a stronger 2-star version. Combining three 2-star champions creates an even more powerful 3-star version, which is the maximum level a unit can reach.",
    combination_rules: "To upgrade a champion to 2-star, you need three 1-star copies. To upgrade to 3-star, you need three 2-star copies (a total of nine 1-star copies). Upgrading combines the champions automatically.",
    stat_scaling: {
      attack_damage: {
        "two_star": "180% of 1-star",
        "three_star": "324% of 1-star (180% of 2-star)"
      },
      health: {
        "two_star": "180% of 1-star",
        "three_star": "324% of 1-star (180% of 2-star)"
      },
      ability: "Ability power effects typically scale by approximately 180% at 2-star and 324% at 3-star, but can vary by champion."
    },
    costs: {
      "tier_1": {
        "1_star": 1,
        "2_star": 3,
        "3_star": 9,
        "4_star": "N/A"
      },
      "tier_2": {
        "1_star": 2,
        "2_star": 6,
        "3_star": 18,
        "4_star": "N/A"
      },
      "tier_3": {
        "1_star": 3,
        "2_star": 9,
        "3_star": 27,
        "4_star": "N/A"
      },
      "tier_4": {
        "1_star": 4,
        "2_star": 12,
        "3_star": 36,
        "4_star": "N/A"
      },
      "tier_5": {
        "1_star": 5,
        "2_star": 15,
        "3_star": 45,
        "4_star": "N/A"
      }
    },
    selling: "Selling a champion returns its full gold value. Selling a 2-star returns the equivalent of three 1-stars, and selling a 3-star returns the equivalent of nine 1-stars."
  },
  champion_store: {
    description: "The champion store refreshes automatically at the start of each round and can be manually refreshed for 2 gold. Each shop offers 5 champions based on your level and the current odds.",
    mechanics: [
      "Each shop refresh costs 2 gold",
      "Champions in the shop are drawn from the shared pool",
      "Higher level increases chances for higher-cost units",
      "The game tracks all champions offered to you in shop",
      "If you see a 3-cost champion at level 4, it has slightly increased odds to appear again",
      "This 'bad luck protection' helps you find specific champions",
      "There is also 'streak protection' for extremely unlucky streaks"
    ],
    special_mechanics: "In Set 14, shop odds can be altered by the Hacks mechanic. Some Hacks may allow two-star units to appear directly in your shop, significantly increasing your chances of upgrading key units."
  },
  champion_items: {
    inventory: "Champions can hold up to 3 items. Extra items can be stored on your bench or applied directly to champions on the board.",
    combination: "Basic items can be combined to create powerful completed items. Drag one item onto another to combine them, either in your item inventory or on a champion.",
    selling: "When you sell a champion, all items return to your item inventory. If your inventory is full, items will appear on the closest bench space.",
    source: "In Set 14, items can be obtained from PvE rounds, carousels, Hacked augments, and special encounters. Some Hacks may also provide additional item choices during component armories."
  },
  champion_traits: {
    description: "Champions have traits that provide bonuses when you field multiple champions with the same trait. The traits in Cyber City include class traits that define combat roles (Bruiser, Executioner) and origin traits that define faction affiliation (Anima Squad, Street Demon). Each trait has multiple activation thresholds with increasing power.",
    key_traits: {
      "anima_squad": "Champions gain weapons that fire periodically during combat. The more Anima Squad units you field, the more weapons they receive.",
      "street_demon": "Units gain damage amplification and omnivamp, allowing them to sustain through combat with lifesteal.",
      "golden_ox": "Champions gain attack damage, ability power, and omnivamp, making them powerful hybrids.",
      "cypher": "Collect intel through combat that can be cashed out for powerful combat stats.",
      "executioner": "Champions deal bonus damage with critical strikes and gain critical strike chance.",
      "bruiser": "Champions gain additional maximum health, making them tankier."
    }
  },
  champion_roles: {
    description: "Champions in TFT have specific roles based on their abilities and stats. Understanding these roles helps with positioning and team composition.",
    purpose: "While not explicitly labeled in-game, these roles help understand how champions function in combat and how to build teams around them.",
    types: {
      tank: "Champions with high health and resistances that can absorb damage for the team. They often have crowd control abilities. Example: Kobuko, Dr. Mundo.",
      carry: "Champions that deal high damage and are the primary damage source for your team. They need to be protected and itemized. Examples: Zeri, Kayle, Akali.",
      support: "Champions that provide utility, buffs, or debuffs rather than dealing damage directly. Examples: Aurora, Sona.",
      assassin: "Champions that target the backline and eliminate high-priority targets. They often have mobility or stealth. Examples: Rengar, Akali.",
      bruiser: "Champions that can both deal and take significant damage. They're versatile frontliners with offensive capabilities. Examples: Jax, Viego."
    },
    info: "In Cyber City, some champions can take on different roles depending on items and team composition. For instance, Morgana can be built as a tank or as a secondary carry with the right items."
  },
  game_mechanics: {
    true_damage: "True damage ignores armor and magic resistance, dealing its full value directly to health. Several champions in Cyber City deal true damage, including Zeri and Fiora.",
    dodge: "Dodge chance allows champions to completely avoid basic attacks. Most sources of dodge have been removed from the game, but a few specific augments and abilities still provide it.",
    stealth: "Stealth makes a unit untargetable and often grants other effects like movement or damage bonuses when coming out of stealth. Akali and Rengar use stealth mechanics.",
    burn: "Burn effects deal damage over time, typically as magic damage. Multiple sources of burn damage stack.",
    wound: "Wound effects reduce healing received by the target. In Cyber City, this effect is primarily found on Executioner champions.",
    chill: "Chill effects slow attack speed. Most sources of chill in Cyber City come from Nitro champions and their items.",
    item_disable: "Some effects can disable enemy items temporarily. This is a rare mechanic found on specific augments.",
    shred: "Armor shred reduces enemy armor. Multiple sources stack additively.",
    sunder: "Magic resist shred reduces enemy magic resistance. Multiple sources stack additively.",
    crowd_control: {
      stun: "Prevents the target from moving, attacking, or using abilities for the duration.",
      knockup: "Similar to stun, but explicitly cannot be reduced by tenacity.",
      silence: "Prevents casting abilities but allows movement and basic attacks.",
      disarm: "Prevents basic attacks but allows movement and ability casting.",
      root: "Prevents movement but allows attacking and ability casting."
    },
    bench: "Your bench can hold up to 9 units at a time. If your bench is full, you cannot buy new champions from the shop or receive champions from Hack rewards."
  },
  hacks_mechanic: {
    description: "Hacks are Set 14's core mechanic, transforming how systems like Augments, Shop, and Items function throughout the game.",
    frequency: "You'll see 2-5 Hacks per game, impacting various systems.",
    common_hacks: [
      {
        name: "Shop Hack",
        effect: "Two-star units can appear directly in your shop"
      },
      {
        name: "Augment Hack",
        effect: "Extra Augment round in stage 2 or 3"
      },
      {
        name: "Component Hack",
        effect: "Choose from multiple component options during armories"
      },
      {
        name: "Carousel Hack",
        effect: "Tome of Traits can appear in carousels"
      },
      {
        name: "Split-or-Take",
        effect: "After carousels, players choose to split a pot of gold or take a guaranteed amount"
      },
      {
        name: "Double PVE",
        effect: "After a PvE round, face an exact copy of it for duplicate rewards"
      }
    ]
  },
  emblem_mechanics: {
    description: "In Set 14, Emblems not only grant a trait but also provide bonus stats for the first time in TFT history.",
    types: [
      {
        trait: "Anima Squad",
        bonus: "+10% Attack Speed"
      },
      {
        trait: "Bruiser",
        bonus: "+150 Health"
      },
      {
        trait: "Executioner",
        bonus: "+10% Crit Chance"
      },
      {
        trait: "Cypher",
        bonus: "+10 Ability Power"
      },
      {
        trait: "Nitro",
        bonus: "+10% Attack Damage"
      },
      {
        trait: "Street Demon",
        bonus: "+8% Omnivamp"
      }
    ],
    source: "Emblems can be crafted through Spatula combinations, obtained from Tome of Traits, or received from certain augments and encounters."
  },
  meta_compositions: {
    golden_ox: {
      description: "A flexible composition centered around Golden Ox's powerful stat boosts. Can incorporate various carries depending on what you find.",
      core_champions: ["Viego", "Jax", "Sett", "Kayle"],
      key_traits: ["Golden Ox (4)", "Bruiser (2)"],
      carry_items: "Bloodthirster, Hand of Justice, and Titan's Resolve on Viego"
    },
    anima_executioners: {
      description: "Focuses on Anima Squad's weapon systems combined with Executioner's critical damage to create devastating backline carries.",
      core_champions: ["Zeri", "Vayne", "Jinx", "Kobuko"],
      key_traits: ["Anima Squad (3)", "Executioner (4)"],
      carry_items: "Guinsoo's Rageblade, Infinity Edge, and Giant Slayer on Zeri"
    },
    exotech_reroll: {
      description: "A reroll composition that focuses on three-starring key Exotech units to maximize their weapon effects.",
      core_champions: ["Varus", "Naafiri", "Morgana", "Aphelios"],
      key_traits: ["Exotech (3)", "Nitro (4)"],
      carry_items: "Spear of Shojin, Jeweled Gauntlet, and Holobow on Varus"
    }
  }
};

export default function GuidesPage() {
  const [activeSection, setActiveSection] = useState<string | null>('champion_tiers');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <Layout title="Guides">
      
      <div className="container mx-auto py-8">
        {/* Updated Patch Indicator Banner with Navigation - using homepage style background */}
        <div className="relative mb-8 overflow-hidden rounded-lg border border-gold/20 shadow-lg">
          {/* Gradient background layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-eclipse-shadow to-void-core opacity-90 z-0"></div>
          
          {/* Image background layer */}
          <div className="absolute inset-0 bg-[url('/assets/app/learn_banner.jpg')] bg-cover bg-center opacity-20 z-0 rounded-xl"></div>
          
          {/* Subtle border glow - optional, from homepage */}
          <div className="absolute inset-0 rounded-xl border border-solar-flare/30 z-10"></div>
          
          {/* Content container */}
          <div className="relative z-20 p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gold mb-1">
                  Set 14 <span className="text-gold-light">Cyber City</span> Guides
                </h1>
                <p className="text-cream">Master the core systems of Teamfight Tactics</p>
              </div>
              <div className="flex mt-3 md:mt-0 space-x-4">
                <div className="bg-void-core/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gold/30 flex items-center shadow-md">
                  <Clock size={16} className="text-gold mr-2" />
                  <span className="text-sm text-cream">Patch {guidesData.set_info.current_patch}</span>
                </div>
                <div className="bg-void-core/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gold/30 flex items-center shadow-md">
                  <Calendar size={16} className="text-gold mr-2" />
                  <span className="text-sm text-cream">{guidesData.set_info.patch_date}</span>
                </div>
              </div>
            </div>
            
            {/* Navigation inside the banner - centered */}
            <div className="overflow-x-auto">
              <div className="flex justify-center space-x-3 min-w-max">
                <NavCard 
                  title="Champion Tiers" 
                  icon={<Users />}
                  isActive={activeSection === 'champion_tiers'}
                  onClick={() => toggleSection('champion_tiers')}
                />
                <NavCard 
                  title="Star Levels" 
                  icon={<Star />}
                  isActive={activeSection === 'champion_star_levels'}
                  onClick={() => toggleSection('champion_star_levels')}
                />
                <NavCard 
                  title="Store" 
                  icon={<ShoppingBag />}
                  isActive={activeSection === 'champion_store'}
                  onClick={() => toggleSection('champion_store')}
                />
                <NavCard 
                  title="Items" 
                  icon={<Swords />}
                  isActive={activeSection === 'champion_items'}
                  onClick={() => toggleSection('champion_items')}
                />
                <NavCard 
                  title="Traits" 
                  icon={<Puzzle />}
                  isActive={activeSection === 'champion_traits'}
                  onClick={() => toggleSection('champion_traits')}
                />
                <NavCard 
                  title="Game Mechanics" 
                  icon={<BookOpen />}
                  isActive={activeSection === 'game_mechanics'}
                  onClick={() => toggleSection('game_mechanics')}
                />
                <NavCard 
                  title="Set Mechanics" 
                  icon={<Info />}
                  isActive={activeSection === 'set_mechanics'}
                  onClick={() => toggleSection('set_mechanics')}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Cards - REMOVED - now in banner */}

                  {/* Content Sections */}
        <div className="space-y-8">
          {/* Champion Tiers Section */}
          {activeSection === 'champion_tiers' && (
            <section>
              <SectionHeader 
                title="Champion Tiers" 
                subtitle="Understanding champion costs and pool distribution"
                icon={<Info size={24} />}
              />
              
              <Card className="p-6 border border-gold/20 shadow-lg bg-void-core/35 backdrop-filter backdrop-blur-md">
                <div className="space-y-6">
                  <div className="bg-void-core/25 p-4 rounded-lg text-cream backdrop-filter backdrop-blur-sm shadow-inner">
                    <p className="text-cream">{guidesData.champion_tiers.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-gold mb-4">Pool Size per Champion</h3>
                    <div className="overflow-x-auto bg-void-core/15 rounded-lg p-4 shadow-inner border border-gold/10 backdrop-filter backdrop-blur-sm">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-void-core/30 border-b border-gold/30">
                            <th className="px-6 py-3 text-left text-sm font-medium text-gold-light">Champion Tier</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gold-light">Pool Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(guidesData.champion_tiers.pool_size_per_champion).map(([tier, size], index) => (
                            <tr key={tier} className={index % 2 === 0 ? 'bg-void-core/10' : 'bg-void-core/20'}>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-cream">{tier}★ Cost</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-mono bg-void-core/25 rounded-lg inline-block ml-4 text-cream">{size}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gold mb-4">Champion Drop Rates</h3>
                    <div className="overflow-x-auto bg-void-core/15 rounded-lg p-4 shadow-inner border border-gold/10 backdrop-filter backdrop-blur-sm">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-void-core/30 border-b border-gold/30">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gold-light">Level</th>
                            {guidesData.champion_tiers.tiers.map(tier => (
                              <th key={tier} className="px-4 py-3 text-center text-sm font-medium text-gold-light">Tier {tier}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(guidesData.champion_tiers.drop_rates).map(([level, rates], index) => (
                            <tr key={level} className={index % 2 === 0 ? 'bg-void-core/10' : 'bg-void-core/20'}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cream">{level.replace('level_', '')}</td>
                              {guidesData.champion_tiers.tiers.map(tier => (
                                <td key={tier} className="px-4 py-3 text-center text-sm text-cream">
                                  {rates[tier.toString() as keyof typeof rates]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Champion Star Levels Section */}
          {activeSection === 'champion_star_levels' && (
            <section>
              <SectionHeader 
                title="Champion Star Levels" 
                subtitle="Champion upgrades and stat scaling"
                icon={<Star size={24} />}
              />
              
              <Card className="p-6 border border-gold/20 shadow-lg bg-void-core/35 backdrop-blur-md">
                <div className="space-y-6">
                  <p className="bg-void-core/25 p-4 rounded-lg text-cream">{guidesData.champion_star_levels.description}</p>
                  <p className="bg-void-core/25 p-4 rounded-lg text-cream">{guidesData.champion_star_levels.combination_rules}</p>
                  
                  <div>
                    <h3 className="text-xl font-medium text-gold mb-4">Stat Scaling</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-void-core/15 rounded-lg p-5 shadow-md border border-gold/10">
                        <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Attack Damage</h4>
                        <div className="space-y-3">
                          {Object.entries(guidesData.champion_star_levels.stat_scaling.attack_damage).map(([level, scaling]) => (
                            <div key={level} className="flex justify-between items-center p-3 bg-void-core/25 rounded-lg">
                              <span className="text-cream">{level.replace('_', ' ')}</span>
                              <span className="text-gold text-sm font-mono bg-void-core/35 px-3 py-1 rounded">{scaling}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-void-core/15 rounded-lg p-5 shadow-md border border-gold/10">
                        <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Health</h4>
                        <div className="space-y-3">
                          {Object.entries(guidesData.champion_star_levels.stat_scaling.health).map(([level, scaling]) => (
                            <div key={level} className="flex justify-between items-center p-3 bg-void-core/25 rounded-lg">
                              <span className="text-cream">{level.replace('_', ' ')}</span>
                              <span className="text-gold text-sm font-mono bg-void-core/35 px-3 py-1 rounded">{scaling}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm italic bg-void-core/25 p-4 rounded-lg text-cream">
                      {guidesData.champion_star_levels.stat_scaling.ability}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gold mb-4">Champion Upgrade Costs</h3>
                    <div className="overflow-x-auto bg-void-core/15 rounded-lg p-4 shadow-inner border border-gold/10">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-void-core/30 border-b border-gold/30">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gold-light">Tier</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gold-light">1★ Cost</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gold-light">2★ Cost</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gold-light">3★ Cost</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gold-light">4★ Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(guidesData.champion_star_levels.costs).map(([tier, costs], index) => (
                            <tr key={tier} className={index % 2 === 0 ? 'bg-void-core/10' : 'bg-void-core/20'}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cream">{tier.replace('tier_', '')}</td>
                              <td className="px-4 py-3 text-center text-sm text-cream">{costs['1_star']} 🪙</td>
                              <td className="px-4 py-3 text-center text-sm text-cream">{costs['2_star']} 🪙</td>
                              <td className="px-4 py-3 text-center text-sm text-cream">{costs['3_star']} 🪙</td>
                              <td className="px-4 py-3 text-center text-sm text-cream">{costs['4_star']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-void-core/15 rounded-lg p-5 shadow-md border border-gold/10">
                    <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Selling Champions</h4>
                    <p className="text-cream">{guidesData.champion_star_levels.selling}</p>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Champion Store Section */}
          {activeSection === 'champion_store' && (
            <section>
              <SectionHeader 
                title="Champion Store" 
                subtitle="Shop mechanics and refresh strategies"
                icon={<ShoppingBag size={24} />}
              />
              
              <Card className="p-6 border border-gold/20 shadow-lg bg-void-core/40">
                <div className="space-y-6">
                  <p className="bg-void-core/30 p-4 rounded-lg text-cream">{guidesData.champion_store.description}</p>
                  
                  <div>
                    <h3 className="text-xl font-medium text-gold mb-4">Store Mechanics</h3>
                    <div className="bg-void-core/20 rounded-lg p-5 shadow-md border border-gold/10">
                      <ul className="space-y-3">
                        {guidesData.champion_store.mechanics.map((mechanic, index) => (
                          <li key={index} className="flex items-start bg-void-core/30 p-4 rounded-lg group hover:bg-void-core/40 transition-colors">
                            <div className="w-6 h-6 flex-shrink-0 rounded-full bg-void-core/40 flex items-center justify-center mr-3 border border-gold/20 group-hover:border-gold/50 transition-colors">
                              <span className="text-sm font-bold text-gold">{index + 1}</span>
                            </div>
                            <div className="text-cream">{mechanic}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-void-core/20 rounded-lg p-5 shadow-md border border-gold/10">
                    <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Cyber City Special Mechanics</h4>
                    <p className="text-cream">{guidesData.champion_store.special_mechanics}</p>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Champion Items Section */}
          {activeSection === 'champion_items' && (
            <section>
              <SectionHeader 
                title="Champion Items" 
                subtitle="Item mechanics and combinations"
                icon={<Layers size={24} />}
              />
              
              <Card className="p-6 border border-gold/20 shadow-lg bg-void-core/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-void-core/20 rounded-lg p-5 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                    <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Inventory</h4>
                    <p className="text-cream">{guidesData.champion_items.inventory}</p>
                  </div>
                  
                  <div className="bg-void-core/20 rounded-lg p-5 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                    <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Combination</h4>
                    <p className="text-cream">{guidesData.champion_items.combination}</p>
                  </div>
                  
                  <div className="bg-void-core/20 rounded-lg p-5 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                    <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Selling</h4>
                    <p className="text-cream">{guidesData.champion_items.selling}</p>
                  </div>
                  
                  <div className="bg-void-core/20 rounded-lg p-5 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                    <h4 className="font-medium text-gold-light mb-3 pb-2 border-b border-gold/20">Source</h4>
                    <p className="text-cream">{guidesData.champion_items.source}</p>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Champion Traits Section */}
          {activeSection === 'champion_traits' && (
            <section>
              <SectionHeader 
                title="Champion Traits" 
                subtitle="Trait synergies and bonuses"
                icon={<Users size={24} />}
              />
              
              <Card className="p-5 border border-gold/20 shadow-lg">
                <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 mb-4">
                  <p className="text-sm">{guidesData.champion_traits.description}</p>
                </div>
                
                <h3 className="text-lg font-medium text-gold mb-3">Key Cyber City Traits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(guidesData.champion_traits.key_traits).map(([trait, description]) => (
                    <div key={trait} className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">{formatTraitName(trait)}</h4>
                      <p className="text-xs">{description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-void-core/10 rounded-lg p-4 mt-4 shadow-md border border-gold/20">
                  <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Emblem Bonuses (Set 14 Feature)</h4>
                  <p className="mb-3 text-xs">{guidesData.emblem_mechanics.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {guidesData.emblem_mechanics.types.map((emblem, index) => (
                      <div key={index} className="flex items-center justify-between bg-void-core/30 p-2 rounded-md">
                        <span className="font-medium text-xs">{emblem.trait}</span>
                        <span className="text-gold-light bg-void-core/50 px-2 py-0.5 rounded text-xs">{emblem.bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Game Mechanics Section */}
          {activeSection === 'game_mechanics' && (
            <section>
              <SectionHeader 
                title="Game Mechanics" 
                subtitle="Core systems and combat mechanics"
                icon={<Activity size={24} />}
              />
              
              <Card className="p-5 border border-gold/20 shadow-lg">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">True Damage</h4>
                      <p className="text-xs">{guidesData.game_mechanics.true_damage}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Dodge</h4>
                      <p className="text-xs">{guidesData.game_mechanics.dodge}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Stealth</h4>
                      <p className="text-xs">{guidesData.game_mechanics.stealth}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Burn</h4>
                      <p className="text-xs">{guidesData.game_mechanics.burn}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Wound</h4>
                      <p className="text-xs">{guidesData.game_mechanics.wound}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Chill</h4>
                      <p className="text-xs">{guidesData.game_mechanics.chill}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gold mb-3">Crowd Control Effects</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {Object.entries(guidesData.game_mechanics.crowd_control).map(([cc, description]) => (
                      <div key={cc} className="bg-void-core/20 rounded-lg p-3 shadow-md border border-gold/10">
                        <h4 className="font-medium text-gold-light text-xs mb-1 pb-1 border-b border-gold/20">{formatCCName(cc)}</h4>
                        <p className="text-xs">{description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Item Disable</h4>
                      <p className="text-xs">{guidesData.game_mechanics.item_disable}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Shred</h4>
                      <p className="text-xs">{guidesData.game_mechanics.shred}</p>
                    </div>
                    
                    <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                      <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Sunder</h4>
                      <p className="text-xs">{guidesData.game_mechanics.sunder}</p>
                    </div>
                  </div>
                  
                  <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10">
                    <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">Bench</h4>
                    <p className="text-xs">{guidesData.game_mechanics.bench}</p>
                  </div>
                </div>
              </Card>
            </section>
          )}
          
          {/* Set Mechanics Section */}
          {activeSection === 'set_mechanics' && (
            <section>
              <SectionHeader 
                title="Set Mechanics" 
                subtitle="Special features unique to Cyber City"
                icon={<Shield size={24} />}
              />
              
              <Card className="p-5 border border-gold/20 shadow-lg">
                <div className="space-y-4">
                  <div className="bg-void-core/20 rounded-lg p-4 shadow-md border border-gold/10">
                    <h3 className="text-lg font-medium text-gold mb-2">Hacks: The Core Mechanic</h3>
                    <p className="mb-3 text-sm">{guidesData.hacks_mechanic.description}</p>
                    <p className="mb-3 text-sm">
                      Hacks provide a dynamic element to each match, forcing players to adapt their strategies based on the specific 
                      changes to core systems. This creates a unique gameplay experience in every game.
                    </p>
                    <div className="bg-void-core/40 p-3 rounded-lg border border-gold/20 text-sm">
                      <div className="font-medium text-gold-light mb-1">Frequency</div>
                      <p className="text-xs">{guidesData.hacks_mechanic.frequency}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gold mb-3">Common Hack Types</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guidesData.hacks_mechanic.common_hacks.map((hack, index) => (
                      <div key={index} className="bg-void-core/20 rounded-lg p-3 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                        <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">{hack.name}</h4>
                        <p className="text-xs">{hack.effect}</p>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium text-gold mb-3">Meta Compositions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(guidesData.meta_compositions).map(([comp, details], index) => (
                      <div key={comp} className="bg-void-core/20 rounded-lg p-3 shadow-md border border-gold/10 hover:shadow-lg hover:border-gold/30 transition-all">
                        <h4 className="font-medium text-gold-light text-sm mb-2 pb-1 border-b border-gold/20">{formatCompName(comp)}</h4>
                        <p className="text-xs mb-2">{details.description}</p>
                        
                        <div className="bg-void-core/40 p-2 rounded-lg mb-2">
                          <div className="text-xs font-medium text-gold-light mb-1">Core Champions</div>
                          <div className="flex flex-wrap gap-1">
                            {details.core_champions.map((champ, i) => (
                              <span key={i} className="bg-void-core/60 px-1.5 py-0.5 rounded-md text-xs border border-gold/10">
                                {champ}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-void-core/40 p-2 rounded-lg mb-2">
                          <div className="text-xs font-medium text-gold-light mb-1">Key Traits</div>
                          <div className="flex flex-wrap gap-1">
                            {details.key_traits.map((trait, i) => (
                              <span key={i} className="bg-void-core/60 px-1.5 py-0.5 rounded-md text-xs border border-gold/10">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-void-core/40 p-2 rounded-lg">
                          <div className="text-xs font-medium text-gold-light mb-1">Carry Items</div>
                          <p className="text-xs">{details.carry_items}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gold/10 rounded-lg p-4 shadow-md border border-gold/20">
                    <h3 className="text-lg font-medium text-gold mb-2">Emblems with Stat Bonuses</h3>
                    <p className="mb-3 text-sm">
                      For the first time in TFT history, emblems not only grant a trait but also provide stat bonuses. 
                      This makes trait splashing more powerful and versatile than in previous sets.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {guidesData.emblem_mechanics.types.map((emblem, index) => (
                        <div key={index} className="flex items-center justify-between bg-void-core/30 p-2 rounded-md">
                          <span className="font-medium text-xs">{emblem.trait}</span>
                          <span className="text-gold-light bg-void-core/50 px-1.5 py-0.5 rounded text-xs">{emblem.bonus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Helper Components
interface NavCardProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function NavCard({ title, icon, isActive, onClick }: NavCardProps) {
  return (
    <div 
      className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all ${
        isActive 
          ? 'bg-gradient-to-br from-void-core/40 to-void-core/20 shadow-md border border-gold/50 backdrop-blur-sm' 
          : 'bg-void-core/40 hover:bg-void-core/40 shadow border border-gold/10 hover:border-gold/30 backdrop-blur-sm'
      }`}
      onClick={onClick}
    >
      <div className={`p-1.5 rounded-full mr-2 ${isActive ? 'bg-gold/20' : 'bg-void-core/50'}`}>
        {React.cloneElement(icon as React.ReactElement, { 
          size: 18, 
          className: isActive ? 'text-gold' : 'text-gold/60' 
        })}
      </div>
      <span className={`text-sm font-semibold ${isActive ? 'text-gold' : 'text-cream/90'}`}>{title}</span>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

function SectionHeader({ title, subtitle, icon }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center">
        <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-gold/20 to-gold/50 mr-3"></div>
        <div className="bg-void-core/70 backdrop-blur-md border-b-2 border-gold rounded-md px-8 py-3 inline-block shadow-sm shadow-gold/20">
          <h2 className="text-2xl font-bold text-gold text-center">{title}</h2>
        </div>
        <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-gold/20 to-gold/50 ml-3"></div>
      </div>
      <p className="text-sm text-cream/90 mt-2 text-center">{subtitle}</p>
    </div>
  );
}

// Formatting Helpers
function formatStatName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
}

function formatRoleName(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatTraitName(trait: string): string {
  return trait
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatCCName(cc: string): string {
  return cc
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
}

function formatCompName(comp: string): string {
  return comp
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}
