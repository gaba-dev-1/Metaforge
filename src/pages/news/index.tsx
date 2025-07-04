import React, { useState } from 'react';
import { Layout, Card } from '@/components/ui';
import { HeaderBanner } from '@/components/common';
import { StatsCarousel } from '@/components/common';
import { 
  Calendar, 
  Tag, 
  Clock, 
  FileBarChart, 
  Trophy, 
  Star, 
  Puzzle, 
  Zap, 
  Slack,
  Eye,
  Cpu,
  Info
} from 'lucide-react';

// Define types for the TFT data
interface TFTCurrentData {
  currentSet: string;
  currentSetName: string;
  currentPatch: string;
  releaseDate: string;
  nextSetDate: string;
  nextSetName: string;
  nextPatchDate: string;
  nextPatchName: string;
}

interface TimelineEvent {
  date: string;
  name: string;
  type: string;
  description: string;
  highlights: string[];
}

interface Tournament {
  name: string;
  date: string;
  region: string;
  importance: string;
  prizePool: string;
  description: string;
}

interface SetData {
  name: string;
  startDate: string;
  endDate: string;
  theme: string;
  mechanic: string;
  description: string;
}

interface RevivalData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface TimelineData {
  patches: TimelineEvent[];
  tournaments: Tournament[];
  sets: SetData[];
  revivals: RevivalData[];
}

interface KeyChange {
  title: string;
  description: string;
}

interface OpeningEncounter {
  character?: string;
  type?: string;
  effect: string;
  chance: string;
}

interface HackEncounter {
  type: string;
  effect: string;
  chance: string;
}

interface EmblemChange {
  name: string;
  effect: string;
}

interface Cosmetic {
  name: string;
  description: string;
}

interface BugFix {
  bug: string;
  fix: string;
}

interface AugmentChange {
  name: string;
  change: string;
}

interface ChampionChange {
  name: string;
  change: string;
}

interface Sections {
  opening_encounters?: {
    title: string;
    content: OpeningEncounter[];
  };
  hacked_encounters?: {
    title: string;
    content: HackEncounter[];
  };
  augment_changes?: {
    title: string;
    removed_augments?: string[];
    returning_augments?: string[];
    adjusted_silver?: Record<string, string>;
    adjusted_gold?: Record<string, string>;
    adjusted_prismatic?: Record<string, string>;
    other_changes?: Record<string, string>;
    content?: AugmentChange[];
  };
  emblem_changes?: {
    title: string;
    content: EmblemChange[];
  };
  cosmetics?: {
    title: string;
    content: Cosmetic[];
  };
  ranked?: {
    title: string;
    content: string;
  };
  champion_changes?: {
    title: string;
    content: ChampionChange[];
  };
  new_hacked_encounters?: {
    title: string;
    content: HackEncounter[];
  };
  hack_adjustments?: {
    title: string;
    description: string;
  };
  bug_fixes?: {
    title: string;
    content: BugFix[];
  };
  revival_info?: {
    title: string;
    content: string;
  };
  [key: string]: any;
}

interface PatchNoteData {
  title: string;
  date: string;
  overview: string;
  keyChanges: KeyChange[];
  sections: Sections;
}

interface PatchNotesData {
  [key: string]: PatchNoteData;
}

interface HackCategory {
  category: string;
  description: string;
  examples: {
    name: string;
    description: string;
  }[];
}

interface HacksData {
  description: string;
  types: HackCategory[];
}

interface Trait {
  name: string;
  description: string;
  champions?: string;
}

// Interface for props
interface PatchNoteSectionProps {
  section: string;
  data: PatchNoteData;
}

interface NavTabProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface TimelineTabProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

interface HackDetailsModalProps {
  show: boolean;
  onClose: () => void;
}

const TFTPatchNotes = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [activePatch, setActivePatch] = useState<string>('14.4');
  const [activeTimeline, setActiveTimeline] = useState<string>('patches');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  
  // Current TFT state based on official data - UPDATED FOR 14.4
  const currentTFTData: TFTCurrentData = {
    currentSet: "Set 14",
    currentSetName: "Cyber City",
    currentPatch: "14.4",
    releaseDate: "April 2, 2025",
    nextSetDate: "July 30, 2025",
    nextSetName: "Set 15",
    nextPatchDate: "May 29, 2025",
    nextPatchName: "14.5"
  };
  
  // Timeline Data - Official 2025 TFT Schedule
  const timelineData: TimelineData = {
    patches: [
      { 
        date: "April 2, 2025", 
        name: "14.1", 
        type: "Major", 
        description: "Set 14: Cyber City release", 
        highlights: ["New Cyber City theme", "Introduction of Hacks mechanic", "New traits and champions"]
      },
      { 
        date: "April 16, 2025", 
        name: "14.2", 
        type: "Balance", 
        description: "First balance patch for Cyber City", 
        highlights: ["Resource adjustment for Hacks", "Champion balance adjustments", "Double Up updates"]
      },
      { 
        date: "May 1, 2025", 
        name: "14.3", 
        type: "Balance", 
        description: "Further Cyber City balance updates", 
        highlights: ["New hacked encounters", "PVE adjustments", "Kobuko rework"]
      },
      { 
        date: "May 14, 2025", 
        name: "14.4", 
        type: "Content", 
        description: "Revival: Remix Rumble + Balance", 
        highlights: ["Set 10 Revival - Remix Rumble", "Balance adjustments", "Loot reductions"]
      },
      { 
        date: "May 29, 2025", 
        name: "14.5", 
        type: "Balance", 
        description: "Mid-set balance update", 
        highlights: ["Cosmetics simplification", "UX improvements", "Item reworks"]
      },
      { 
        date: "June 12, 2025", 
        name: "14.6", 
        type: "Balance", 
        description: "Final major balance patch", 
        highlights: ["Final trait adjustments", "Champion rebalancing"]
      },
      { 
        date: "June 26, 2025", 
        name: "14.7", 
        type: "Balance", 
        description: "Pre-Set 15 adjustment patch", 
        highlights: ["Final balance tweaks", "Preparation for Set 15"]
      },
      { 
        date: "July 16, 2025", 
        name: "14.8", 
        type: "Fun", 
        description: "Cyber City finale patch", 
        highlights: ["Fun adjustments", "PBE release of Set 15"]
      },
      { 
        date: "July 30, 2025", 
        name: "15.1", 
        type: "Major", 
        description: "Set 15 release", 
        highlights: ["New set theme", "New mechanics and champions", "Ranked reset"]
      },
      { 
        date: "November 19, 2025", 
        name: "16.1", 
        type: "Major", 
        description: "Set 16 release", 
        highlights: ["New set theme", "New mechanics", "Ranked reset"]
      }
    ],
    tournaments: [
      {
        name: "TFT Open Championship 11: Cyber League - Week 1",
        date: "May 12-14, 2025",
        region: "Global",
        importance: "Major",
        prizePool: "$50,000",
        description: "First week of the Cyber League championship series"
      },
      {
        name: "TFT Open Championship 11: Cyber League - Week 2",
        date: "May 20-22, 2025",
        region: "Global",
        importance: "Major",
        prizePool: "$50,000",
        description: "Second week of competitive Cyber League matches"
      },
      {
        name: "Cyber City: EMEA Tactician's Cup #2",
        date: "May 24-26, 2025",
        region: "EMEA",
        importance: "Regional",
        prizePool: "$30,000",
        description: "Second Tactician's Cup for the EMEA region"
      },
      {
        name: "Cyber City: APAC Tactician's Cup #2",
        date: "May 24-26, 2025",
        region: "APAC",
        importance: "Regional",
        prizePool: "$30,000",
        description: "Second Tactician's Cup for the APAC region"
      },
      {
        name: "Cyber City: Americas Tactician's Cup #2",
        date: "May 24-26, 2025",
        region: "Americas",
        importance: "Regional",
        prizePool: "$30,000",
        description: "Second Tactician's Cup for the Americas region"
      },
      {
        name: "TFT Open Championship 11: Cyber League - Week 3",
        date: "May 26-28, 2025",
        region: "Global",
        importance: "Major",
        prizePool: "$50,000",
        description: "Third week of the Cyber League championship"
      },
      {
        name: "TFT Open Championship 11: Cyber League - Main Stage",
        date: "May 30-31, 2025",
        region: "Global",
        importance: "Major",
        prizePool: "$100,000",
        description: "Final stage of the Cyber League championship"
      },
      {
        name: "Cyber City: EMEA Tactician's Cup #3",
        date: "June 20-22, 2025",
        region: "EMEA",
        importance: "Regional",
        prizePool: "$30,000",
        description: "Third Tactician's Cup for the EMEA region"
      },
      {
        name: "Cyber City: APAC Tactician's Cup #3",
        date: "June 20-22, 2025",
        region: "APAC",
        importance: "Regional",
        prizePool: "$30,000",
        description: "Third Tactician's Cup for the APAC region"
      },
      {
        name: "Esports World Cup 2025 - TFT",
        date: "August 11-15, 2025",
        region: "Global",
        importance: "Major",
        prizePool: "$500,000",
        description: "TFT's debut at the Esports World Cup"
      },
      {
        name: "TFT Paris Open 2025",
        date: "December 2025",
        region: "Global",
        importance: "Championship",
        prizePool: "$308,500",
        description: "TFT's largest global open tournament of the year"
      }
    ],
    sets: [
      {
        name: "Set 14: Cyber City",
        startDate: "April 2, 2025",
        endDate: "July 29, 2025",
        theme: "Cyberpunk/street factions",
        mechanic: "Hacks",
        description: "Neon-lit cyberpunk aesthetic with warring factions"
      },
      {
        name: "Set 15",
        startDate: "July 30, 2025",
        endDate: "November 18, 2025",
        theme: "TBA",
        mechanic: "TBA",
        description: "Next major set, theme is anime-style fighting tournament"
      },
      {
        name: "Set 16",
        startDate: "November 19, 2025",
        endDate: "March 2026",
        theme: "TBA",
        mechanic: "TBA",
        description: "Final set of 2025, theme to be announced"
      }
    ],
    revivals: [
      {
        name: "Remix Rumble (Set 10)",
        startDate: "May 14, 2025",
        endDate: "July 29, 2025",
        description: "Revival of the music-themed Set 10 with updated bag sizes, new augments, and Cyber City crossover elements"
      }
    ]
  };
  
  // Patch Notes Data - UPDATED with accurate 14.4 info
  const patchNotesData: PatchNotesData = {
    "14.1": {
      title: "Set 14: Cyber City Launch",
      date: "April 2, 2025",
      overview: "Welcome to our next set: Cyber City, where the streets are up for grabs as you roll, explode, and hack your way to control! This update introduces the new Hacks mechanic, Cyber City champions and traits, and system-wide changes.",
      keyChanges: [
        {
          title: "New Set Mechanic: Hacks",
          description: "Benevolent Hackers have infiltrated TFT's core systems to your benefit! Hacks will alter each game in a variety of ways, affecting how core systems such as Augments, the Shop, or Items function. These Hacks will always be beneficial and will impact all players at the same power level, just in slightly different ways. You'll see two to five Hacks each game."
        },
        {
          title: "PvE Rounds Changes",
          description: "PvE (non-player combat) rounds have been taken over by Mechas! So long, Krug, hello, Robo-dude."
        },
        {
          title: "Emblem Improvements",
          description: "For the first time in TFT history, Emblems now provide bonuses on top of making a champion a specific trait. For example, Bastion Emblem grants 10% of Armor and Magic Resistance as Ability Power."
        },
        {
          title: "Augment Overhaul",
          description: "With a new roster and hacks mixing things up, we're removing some Augments that are either roster dependent, interfere too much with hacks, or just need to be vaulted. We're also welcoming back some old favorites as Black Market Augments."
        }
      ],
      sections: {
        opening_encounters: {
          title: "Opening Encounters",
          content: [
            {
              character: "Annie",
              effect: "Annie changes all Augments to Gold tier this game.",
              chance: "10.0%"
            },
            {
              character: "Zac",
              effect: "Zac's virus turns all the Augments Prismatic.",
              chance: "5.0%"
            },
            {
              character: "Aurora",
              effect: "Aurora swaps the last Augment to Prismatic this game.",
              chance: "5.0%"
            },
            {
              character: "Aurora",
              effect: "Aurora swaps the first Augment to Prismatic this game.",
              chance: "6.0%"
            },
            {
              character: "Neeko",
              effect: "Neeko transforms all the monsters into crabs that drop bonus loot, but crabs on Stage 5+ are SUPER DEADLY.",
              chance: "2.5%"
            },
            {
              character: "Urgot",
              effect: "Urgot scrounges up some loot from a highly varied pool each stage.",
              chance: "4.0%"
            },
            {
              character: "Garen",
              effect: "Garen summons a trainer golem with 3 Emblems attached.",
              chance: "4.0%"
            }
          ]
        },
        ranked: {
          title: "Ranked Changes",
          content: "When Cyber City goes live in your region, you can start climbing. Depending on your rank in the previous set, you will start anywhere from Iron II to Silver IV. This is true for both Double Up and Standard ranked. You will get 5 provisional matches after the reset."
        }
      }
    },
    "14.2": {
      title: "First Cyber City Balance Patch",
      date: "April 16, 2025",
      overview: "Welcome to our first patch of Cyber City! Balance issues experienced are part of the Cyber City hacker aesthetic! If only it were that easy… Patch 14.2 is our first big balance patch of the set. We're focused on stabilizing the meta with number adjustments, saving reworks or major adjustments for 14.3.",
      keyChanges: [
        {
          title: "Resource Adjustments",
          description: "Cyber City is a resource-rich techno metropolis thanks to the benevolent hackers injecting the streets with econ from orbs and hacked Augments. We're cutting down on the overall gold from Hacks to make sure games don't feel too resource-inflated."
        },
        {
          title: "Champion Augment Adjustments",
          description: "Our Silver Champion Augments have released a bit on the weak side, so we're making adjustments to improve their performance."
        },
        {
          title: "Double Up Changes",
          description: "More options for Gift Armories were added. Slightly reduced the amount of gold earned from PVE rounds."
        },
        {
          title: "Mobile Updates",
          description: "You can now add friends with the tap of a button (a new button) while in lobby on Mobile!"
        }
      ],
      sections: {
        hack_adjustments: {
          title: "Hack Adjustments",
          description: "Reduced the overall gold provided by various Hack mechanics to prevent resource inflation that was favoring fast level 9 strategies."
        },
        augment_changes: {
          title: "Augment Changes",
          content: [
            {
              name: "Adaptive Strikes (Jax)",
              change: "Base 3rd Strike Damage: 110/165/250 ⇒ 120/180/270"
            },
            {
              name: "Chemtech Overdrive (Black Market)",
              change: "no longer appears on 2-1"
            },
            {
              name: "Double Trouble (Black Market)",
              change: "Bugfix: Starring up the unit to 3* while on the bench, properly grants the 2* copy of the unit."
            },
            {
              name: "Life Long Learning (Black Market)",
              change: "HP Gained each turn: 1.5% ⇒ 2%"
            },
            {
              name: "Scoped Weapons (Black Market)",
              change: "AS Gained: 18% ⇒ 25%"
            }
          ]
        }
      }
    },
    "14.3": {
      title: "Cyber City Balance Updates",
      date: "May 1, 2025",
      overview: "Patch 14.3 brings new Hacks, Opening Encounters, balance changes, and a rework for Kobuko. This update continues to refine the Cyber City experience based on player feedback and data analysis.",
      keyChanges: [
        {
          title: "New Hacked Encounters",
          description: "We've added several new Hacked encounters to increase variety and strategic options."
        },
        {
          title: "Kobuko Rework",
          description: "Kobuko has been reworked to better balance his performance across different team compositions."
        },
        {
          title: "Balance Adjustments",
          description: "Various champion and trait balance adjustments to improve overall game health."
        }
      ],
      sections: {
        champion_changes: {
          title: "Champion Changes",
          content: [
            {
              name: "Aphelios",
              change: "With Golden Ox (6) in check, we're able to distribute power into the still-sad moon lad. Maybe we'll even catch a smile from an Aphelios carry who wants nothing more than to hold three items."
            },
            {
              name: "Cho'Gath",
              change: "Our Cho'Gath changes last patch had him land weaker than intended. With a mana buff and a better AP ratio on his HP stacking, expect to see this Boom Bot making a sizable impact."
            },
            {
              name: "Aurora",
              change: "With safe damage and the ability to throw in tanks throughout the fight, Aurora's been our best 5-cost for a while, especially at two stars. We're reducing some of her damage."
            },
            {
              name: "Viego",
              change: "A fully itemized Viego empowered by Golden Ox could wipe entire boards. We're making adjustments to his power level."
            },
            {
              name: "Kobuko",
              change: "Complete rework to better balance his performance."
            }
          ]
        },
        new_hacked_encounters: {
          title: "New Hacked Encounters",
          content: [
            {
              type: "Lucky Shop",
              effect: "First shop of select rounds will contain units tailored to your team.",
              chance: "Once per stage"
            },
            {
              type: "Tome Carousel",
              effect: "Carousels can appear with Tome of Traits. Use the Tome of Traits to select an Emblem partially tailored to your comp.",
              chance: "Variable"
            },
            {
              type: "Double PVE",
              effect: "After a PvE round, you'll immediately face an exact copy of it, rewarding the exact same loot.",
              chance: "Variable"
            },
            {
              type: "Group Investing",
              effect: "After every Carousel, players choose to split a pot of gold or increase the total amount for future rounds.",
              chance: "Variable"
            },
            {
              type: "Reroll Subscription",
              effect: "At the start of every stage, gain free Shop rerolls, increasing over the game.",
              chance: "Variable"
            },
            {
              type: "Three Champions",
              effect: "Start the game with a two-star 2-cost champion. Every player gets a unique one.",
              chance: "Variable"
            }
          ]
        }
      }
    },
    "14.4": {
      title: "Revival: Remix Rumble + Balance",
      date: "May 14, 2025",
      overview: "Balance and RNGolem, 14.4 is Cyber City's return to the natural order of things. At the start of Cyber City, Hacks provided enough loot to typically fully itemize two carries and a primary tank. We've since lowered the amount of total loot you get, but we're still seeing games have ever-so-slightly too much on average. This patch also brings the return of Remix Rumble!",
      keyChanges: [
        {
          title: "Set Revival: Remix Rumble",
          description: "From patch 14.4 (May 14th) to July 29th, Remix Rumble returns with a couple of updates to mix things up for longtime fans and new DJs alike! The Revival brings back your favorite music festival lineup with K/DA, True Damage, Pentakill, Heartsteel, DJ Sona, Maestro Jhin, and Jazz Bard alongside the Headliner mechanic."
        },
        {
          title: "Loot Reductions",
          description: "With our loot changes in 14.4 you can expect to see about 1 less Item Component and in a few cases 1 less Silver/Blue Loot Orb. The most extreme example of the above is Scuttle Puddle and Crab Rave."
        },
        {
          title: "Revival Features",
          description: "Updated bag sizes for easier rerolling, new Opening Encounters (Ahri, Akali, Zac), and Cyber City Hacks integrated into the revival experience."
        },
        {
          title: "Cosmetics Changes Coming",
          description: "Starting in patch TFT14.5 (patch after this), we'll simplify TFT's cosmetic rarity tiers to ensure they're straightforward and consistent."
        }
      ],
      sections: {
        revival_info: {
          title: "Remix Rumble Revival Details",
          content: "Updated bag (unit pool) sizes: 1-costs: 50 copies, 2-costs: 40 copies, 3-costs: 30 copies, 4-costs: 12 copies, 5-costs: 10 copies. Unlike the Festival of Beasts Revival (which had personal bags), Revival: Remix Rumble returns to a shared pool, but with larger bag sizes for easier rerolling."
        },
        opening_encounters: {
          title: "New Opening Encounters (Revival)",
          content: [
            {
              character: "Ahri",
              effect: "Headliners appear in your shop as if you are 1 level higher.",
              chance: "Revival only"
            },
            {
              character: "Akali",
              effect: "Headliner champions grant plus-one to another one of their traits.",
              chance: "Revival only"
            },
            {
              character: "Zac",
              effect: "Cyber City is invading the Remix Rumble Revival. Watch out for Hacks!",
              chance: "Revival only"
            }
          ]
        },
        hack_adjustments: {
          title: "Loot Adjustments",
          description: "Reduced total component drops by approximately 1 item component per game. Scuttle Puddle and Crab Rave encounters reduced their total component drops by two."
        }
      }
    },
    "14.5": {
      title: "Cosmetics Simplification & Item Reworks",
      date: "May 29, 2025",
      overview: "With Patch 14.5, we're updating, replacing, and reworking several items to better fit their fantasy. We're also simplifying TFT's cosmetic rarity tiers to ensure they're straightforward and consistent.",
      keyChanges: [
        {
          title: "Item Reworks",
          description: "Several items are being updated, replaced, and reworked to better fit their intended fantasy and improve gameplay balance."
        },
        {
          title: "Cosmetics Tier Simplification",
          description: "Little Legends released prior to patch 14.5 in the Rare and Epic tiers will be combined into the new Standard tier. Non-upgradable Little Legends and Booms are designated as three-star content."
        },
        {
          title: "Mid-Set Balance",
          description: "Mid-set balance adjustments to keep the competitive meta healthy and diverse."
        }
      ],
      sections: {}
    }
  };
  
  // Set 14 Mechanics - Hack System Details
  const hacksData: HacksData = {
    description: "In Cyber City, Hacks will alter each game in a variety of ways, affecting how core systems such as Augments, the Shop, or Items function. These Hacks will always be beneficial and will impact all players at the same power level, just in slightly different ways. You'll typically see about three Hacks each game.",
    types: [
      {
        category: "Augment Hacks",
        description: "Hacks that affect the Augment system, including timing, quality, and options.",
        examples: [
          {
            name: "Fourth Augment",
            description: "You will be able to select a fourth Augment later on in the game, bringing you to four Augments in total."
          },
          {
            name: "Augment Timing",
            description: "Augments appear at random rounds earlier than normal (never later)."
          },
          {
            name: "Black Market Augments",
            description: "Special pool of powerful Augments from previous sets, only available from a Hacked Augment slot."
          },
          {
            name: "1v2 Augment Choice",
            description: "Choose between one powerful Gold Augment or TWO Silver Augments."
          }
        ]
      },
      {
        category: "Shop Hacks",
        description: "Hacks that modify how the shop functions and what appears in it.",
        examples: [
          {
            name: "Lucky Shops",
            description: "Shops are more lucky, containing units tailored to your team. Affects all players at an equal rate, once per stage."
          },
          {
            name: "Two-Star Shops",
            description: "Occasionally, a hacked unit will appear at two stars in your shop instead of the usual one-star."
          }
        ]
      },
      {
        category: "Carousel & Item Hacks",
        description: "Hacks that affect carousel offerings and item systems.",
        examples: [
          {
            name: "Tailored Items",
            description: "Each unit on the carousel will have two completed items attached, both from the unit's recommended items list."
          },
          {
            name: "Anvil Carousel",
            description: "A carousel with anvils in place of champs and items."
          },
          {
            name: "Treasure Dragon",
            description: "At Stage 4-7 choose from a rollable package of loot. Augments can appear during the Treasure Armory."
          }
        ]
      },
      {
        category: "Loot Hacks",
        description: "Hacks that provide special loot or modify existing loot systems.",
        examples: [
          {
            name: "Hacked Eggs",
            description: "Loot Eggs with power based on how long they take to hatch. Can choose from short, medium, and long variations."
          },
          {
            name: "Tactician Health",
            description: "A small amount of Tactician Health has a chance to appear in some Hacked Loot Orbs."
          },
          {
            name: "Unstable Item Components",
            description: "Available in Hacked Loot Orbs, these components transform into a different item component each round."
          }
        ]
      },
      {
        category: "Game Mechanic Hacks",
        description: "Hacks that change broader game mechanics or introduce unique decision points.",
        examples: [
          {
            name: "Take it or Split it?",
            description: "Opens an Armory presenting two choices: take 10 gold or split 30 gold from whoever chooses the latter."
          },
          {
            name: "Group Investing",
            description: "After every Carousel, players choose to split a pot of gold or increase the total amount for future rounds."
          },
          {
            name: "Sentinel Armory",
            description: "Pick one of three Sentinels with three items each: Tank, Frontline Attacker, or Backline Sentinel."
          }
        ]
      }
    ]
  };
  
  // Key Traits from Set 14
  const traitData: Trait[] = [
    {
      name: "Anima Squad",
      description: "Anima Squad champions gain Armor, Magic Resist, and their weapons gain bonus effects."
    },
    {
      name: "Cyberboss",
      description: "Your strongest Cyberboss upgrades to its final form and gains Health, Ability Power, and its ability hits more enemies.",
      champions: "Vi (1g), LeBlanc (2g), Draven (3g), Galio (3g), Zed (4g)"
    },
    {
      name: "Cypher",
      description: "Gain Intel by losing combat, increased for loss streaks. You may trade Intel for loot once, after which Cypher champions gain Attack Damage and Ability Power."
    },
    {
      name: "Divinicorp",
      description: "Divinicorp champions grant unique stats to your team, increased for each Divinicorp in play."
    },
    {
      name: "Exotech",
      description: "Gain unique Exotech items that can only be equipped by Exotech champions, granting Health and Attack Speed."
    },
    {
      name: "Street Demon",
      description: "Street Demon tags areas on the board and buffs units who stand inside of them."
    }
  ];
  
  // Component to display patch note sections
  const PatchNoteSection = ({ section, data }: PatchNoteSectionProps) => {
    if (!data || !data.sections || !data.sections[section]) return null;
    
    const sectionData = data.sections[section];
    
    // Different renders based on section type
    if (section === 'opening_encounters' || section === 'hacked_encounters') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionData.content.map((encounter: OpeningEncounter, index: number) => (
                <div key={index} className="bg-void-core/15 rounded p-3 flex items-start border border-gold/20">
                  <div className="mr-3 font-medium text-gold-light min-w-20">
                    {encounter.character || encounter.type}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1 text-cream">{encounter.effect}</div>
                    <div className="text-xs text-cream/70">Chance: {encounter.chance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (section === 'augment_changes') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          
          {/* Removed Augments */}
          {sectionData.removed_augments && sectionData.removed_augments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gold mb-2">Removed Augments</h4>
              <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {sectionData.removed_augments.map((augment: string, index: number) => (
                    <span key={index} className="bg-void-core/15 px-2 py-1 rounded text-xs border border-gold/30 text-cream">
                      {augment}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Returning Augments */}
          {sectionData.returning_augments && sectionData.returning_augments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gold mb-2">Returning Augments</h4>
              <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {sectionData.returning_augments.map((augment: string, index: number) => (
                    <span key={index} className="bg-void-core/15 px-2 py-1 rounded text-xs border border-gold/30 text-cream">
                      {augment}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Other Changes */}
          {sectionData.other_changes && Object.keys(sectionData.other_changes).length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gold mb-2">Other Augment Changes</h4>
              <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
                <div className="space-y-2">
                  {Object.entries(sectionData.other_changes as Record<string, string>).map(([name, change], index) => (
                    <div key={index} className="bg-void-core/15 rounded p-3 border border-gold/20">
                      <div className="font-medium text-gold-light mb-1">{name}</div>
                      <div className="text-sm text-cream">{change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Content (for 14.2+) */}
          {sectionData.content && sectionData.content.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gold mb-2">Augment Adjustments</h4>
              <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
                <div className="space-y-2">
                  {sectionData.content.map((augment: AugmentChange, index: number) => (
                    <div key={index} className="bg-void-core/15 rounded p-3 border border-gold/20">
                      <div className="font-medium text-gold-light mb-1">{augment.name}</div>
                      <div className="text-sm text-cream">{augment.change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (section === 'emblem_changes') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionData.content.map((emblem: EmblemChange, index: number) => (
                <div key={index} className="bg-void-core/15 rounded p-3 border border-gold/20">
                  <div className="font-medium text-gold-light mb-1">{emblem.name}</div>
                  <div className="text-sm text-cream">{emblem.effect}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (section === 'cosmetics') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionData.content.map((cosmetic: Cosmetic, index: number) => (
                <div key={index} className="bg-void-core/15 rounded p-3 border border-gold/20">
                  <div className="font-medium text-gold-light mb-1">{cosmetic.name}</div>
                  <div className="text-sm text-cream">{cosmetic.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (section === 'ranked') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-cream">{sectionData.content}</div>
          </div>
        </div>
      );
    }
    
    if (section === 'champion_changes') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="space-y-3">
              {sectionData.content.map((champion: ChampionChange, index: number) => (
                <div key={index} className="bg-void-core/15 rounded p-3 border border-gold/20">
                  <div className="font-medium text-gold-light mb-1">{champion.name}</div>
                  <div className="text-sm text-cream">{champion.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (section === 'new_hacked_encounters') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionData.content.map((encounter: HackEncounter, index: number) => (
                <div key={index} className="bg-void-core/15 rounded p-3 flex items-start border border-gold/20">
                  <div className="mr-3 font-medium text-gold-light min-w-24">{encounter.type}</div>
                  <div className="flex-1">
                    <div className="text-sm mb-1 text-cream">{encounter.effect}</div>
                    <div className="text-xs text-cream/70">Frequency: {encounter.chance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (section === 'hack_adjustments') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-cream">{sectionData.description}</div>
          </div>
        </div>
      );
    }
    
    if (section === 'bug_fixes') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <ul className="space-y-2">
              {sectionData.content.map((bugfix: BugFix, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1.5 mr-2"></div>
                  <div className="text-cream">
                    <span className="font-medium">{bugfix.bug}</span>: {bugfix.fix}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    
    if (section === 'revival_info') {
      return (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gold mb-4">{sectionData.title}</h3>
          <div className="bg-void-core/25 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-cream">{sectionData.content}</div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Navigation tabs for different sections
  const NavTab = ({ title, isActive, onClick, icon }: NavTabProps) => {
    return (
      <button
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
          isActive 
            ? 'bg-void-core/40 text-gold shadow-md border border-gold/30' 
            : 'bg-void-core/20 text-cream/80 hover:bg-void-core/30 border border-gold/10 hover:border-gold/20'
        }`}
        onClick={onClick}
      >
        {icon && <div className={`mr-2 ${isActive ? 'text-gold' : 'text-cream/70'}`}>{icon}</div>}
        {title}
      </button>
    );
  };
  
  // Timeline section tabs
  const TimelineTab = ({ title, isActive, onClick }: TimelineTabProps) => {
    return (
      <button
        className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
          isActive 
            ? 'border-gold text-gold' 
            : 'border-transparent text-cream/70 hover:text-cream hover:border-gold/30'
        }`}
        onClick={onClick}
      >
        {title}
      </button>
    );
  };
  
  // Current Set Overview section
  const CurrentSetOverview = () => (
    <div className="animate-fadeIn">
      {/* Section Title - centered with gold lines */}
      <div className="mb-6">
        <div className="flex items-center justify-center">
          <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-gold/20 to-gold/50 mr-3"></div>
          <div className="bg-void-core/40 backdrop-blur-md border-b-2 border-gold rounded-md px-8 py-3 inline-block shadow-sm shadow-gold/20">
            <h2 className="text-2xl font-bold text-gold text-center">Overview</h2>
          </div>
          <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-gold/20 to-gold/50 ml-3"></div>
        </div>
      </div>
      
      {/* Content boxes */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 bg-void-core/15 backdrop-filter backdrop-blur-md rounded-lg p-4 border border-gold/20">
          <h3 className="text-lg font-semibold text-gold mb-3 flex items-center">
            <Tag size={18} className="mr-2" />
            Current Patch
          </h3>
          <div className="text-xl font-bold mb-1 text-cream">{currentTFTData.currentPatch}</div>
          <div className="text-sm text-cream/70">Released on May 14, 2025</div>
        </div>
        <div className="flex-1 bg-void-core/15 backdrop-blur-md rounded-lg p-4 border border-gold/20">
          <h3 className="text-lg font-semibold text-gold mb-3 flex items-center">
            <Calendar size={18} className="mr-2" />
            Next Patch
          </h3>
          <div className="text-xl font-bold mb-1 text-cream">{currentTFTData.nextPatchName}</div>
          <div className="text-sm text-cream/70">Coming on {currentTFTData.nextPatchDate}</div>
        </div>
        <div className="flex-1 bg-void-core/15 backdrop-blur-md rounded-lg p-4 border border-gold/20">
          <h3 className="text-lg font-semibold text-gold mb-3 flex items-center">
            <Slack size={18} className="mr-2" />
            Current Revival
          </h3>
          <div className="text-xl font-bold mb-1 text-cream">Remix Rumble</div>
          <div className="text-sm text-cream/70">May 14 - July 29, 2025</div>
        </div>
      </div>
        
      <div className="bg-void-core/15 backdrop-filter backdrop-blur-md rounded-lg p-4 border border-gold/20 mb-4">
        <h3 className="text-lg font-semibold text-gold mb-3 flex items-center">
          <Zap size={18} className="mr-2" />
          Set Mechanic: Hacks
        </h3>
        <p className="text-cream">{hacksData.description}</p>
        <div className="mt-4">
          <button 
            className="px-4 py-2 bg-void-core/30 text-gold rounded-lg text-md font-medium hover:bg-void-core/40 transition-all border border-gold/30 flex items-center"
            onClick={() => setShowInfoModal(true)}
          >
            <Info size={16} className="mr-2" />
            View Hack Details
          </button>
        </div>
      </div>
      
      <div className="bg-void-core/15 backdrop-blur-md rounded-lg p-4 border border-gold/20">
        <h3 className="text-lg font-semibold text-gold mb-3 flex items-center">
          <Puzzle size={18} className="mr-2" />
          Key Traits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {traitData.map((trait, index) => (
            <div key={index} className="bg-void-core/25 p-3 rounded-lg border border-gold/20">
              <div className="font-medium text-gold-light mb-1">{trait.name}</div>
              <div className="text-sm text-cream mb-1">{trait.description}</div>
              {trait.champions && (
                <div className="text-xs text-cream/70 mt-1">
                  <span className="font-medium">Champions:</span> {trait.champions}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Patch Notes section
  const PatchNotesSection = () => (
    <div className="animate-fadeIn">
      {/* Section Title - centered with gold lines */}
      <div className="mb-6">
        <div className="flex items-center justify-center">
          <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-gold/20 to-gold/50 mr-3"></div>
          <div className="bg-void-core/40 backdrop-blur-md border-b-2 border-gold rounded-md px-8 py-3 inline-block shadow-sm shadow-gold/20">
            <h2 className="text-2xl font-bold text-gold text-center">Patch Notes</h2>
          </div>
          <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-gold/20 to-gold/50 ml-3"></div>
        </div>
      </div>
      
      <div className="bg-void-core/25 backdrop-filter backdrop-blur-md rounded-lg overflow-hidden shadow-lg border border-gold/20 mb-8">
        
        <div className="px-6 py-4">
          {/* Patch selector for mobile */}
          <div className="md:hidden mb-4">
            <select 
              className="w-full p-2 bg-void-core/15 text-cream rounded-lg border border-gold/20"
              value={activePatch}
              onChange={(e) => setActivePatch(e.target.value)}
            >
              {Object.keys(patchNotesData).map(patch => (
                <option key={patch} value={patch}>Patch {patch}: {patchNotesData[patch].title}</option>
              ))}
            </select>
          </div>
          
          {/* Patch selector for desktop */}
          <div className="hidden md:flex md:flex-wrap gap-2 mb-6">
            {Object.keys(patchNotesData).map(patch => (
              <NavTab 
                key={patch}
                title={`Patch ${patch}`}
                isActive={activePatch === patch}
                onClick={() => setActivePatch(patch)}
              />
            ))}
          </div>
          
          {patchNotesData[activePatch] && (
            <>
              <div className="bg-void-core/15 backdrop-filter backdrop-blur-md rounded-lg p-6 border border-gold/20 mb-6">
                <h1 className="text-2xl font-bold text-gold mb-2">{patchNotesData[activePatch].title}</h1>
                <div className="text-sm text-cream/70 mb-4">Released on {patchNotesData[activePatch].date}</div>
                <p className="text-cream">{patchNotesData[activePatch].overview}</p>
              </div>
              
              <div className="bg-void-core/15 backdrop-blur-sm rounded-lg p-6 border border-gold/20 mb-6">
                <h2 className="text-xl font-bold text-gold mb-4">Key Changes</h2>
                <div className="space-y-4">
                  {patchNotesData[activePatch].keyChanges.map((change, index) => (
                    <div key={index} className="bg-void-core/25 rounded-lg p-4 border border-gold/20">
                      <h3 className="text-lg font-semibold text-gold-light mb-2">{change.title}</h3>
                      <p className="text-cream text-sm">{change.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dynamic patch note sections */}
              {patchNotesData[activePatch].sections && Object.keys(patchNotesData[activePatch].sections).map(section => (
                <PatchNoteSection 
                  key={section} 
                  section={section} 
                  data={patchNotesData[activePatch]} 
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
  
  // TFT Timeline section
const TimelineSection = () => (
  <div className="animate-fadeIn">
    {/* Section Title - centered with gold lines */}
    <div className="mb-6">
      <div className="flex items-center justify-center">
        <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-gold/20 to-gold/50 mr-3"></div>
        <div className="bg-void-core/40 backdrop-blur-md border-b-2 border-gold rounded-md px-8 py-3 inline-block shadow-sm shadow-gold/20">
          <h2 className="text-2xl font-bold text-gold text-center">2025 Timeline</h2>
        </div>
        <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-gold/20 to-gold/50 ml-3"></div>
      </div>
    </div>
    
    <div className="bg-void-core/25 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-gold/20 mb-8">
      
      {/* Replace TimelineTab with NavTab for consistent styling */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-2 mb-6">
          <NavTab 
            title="Patch Schedule" 
            isActive={activeTimeline === 'patches'} 
            onClick={() => setActiveTimeline('patches')}
            icon={<Calendar size={18} />}
          />
          <NavTab 
            title="Tournaments" 
            isActive={activeTimeline === 'tournaments'} 
            onClick={() => setActiveTimeline('tournaments')}
            icon={<Trophy size={18} />}
          />
          <NavTab 
            title="Sets & Revivals" 
            isActive={activeTimeline === 'sets'} 
            onClick={() => setActiveTimeline('sets')}
            icon={<Slack size={18} />}
          />
        </div>
        </div>
        
        <div className="px-6 py-4">
          {activeTimeline === 'patches' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-void-core/15 rounded-lg overflow-hidden">
                  <thead className="bg-void-core/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Patch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Highlights</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {timelineData.patches.map((patch, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-void-core/10' : 'bg-void-core/20'}>
                        <td className="px-4 py-3 text-sm font-medium text-cream">{patch.date}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            patch.type === 'Major' ? 'bg-void-core/40 text-gold' : 
                            patch.type === 'Balance' ? 'bg-void-core/30 text-gold-light' : 
                            patch.type === 'Fun' ? 'bg-void-core/30 text-gold-light' : 
                            'bg-void-core/30 text-gold-light'
                          }`}>
                            {patch.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-cream">{patch.type}</td>
                        <td className="px-4 py-3 text-sm text-cream">{patch.description}</td>
                        <td className="px-4 py-3 text-sm">
                          <ul className="list-disc list-inside text-cream">
                            {patch.highlights.map((highlight, i) => (
                              <li key={i}>{highlight}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTimeline === 'tournaments' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-void-core/15 rounded-lg overflow-hidden">
                  <thead className="bg-void-core/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Tournament</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Region</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Prize Pool</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {timelineData.tournaments.map((tournament, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-void-core/10' : 'bg-void-core/20'}>
                        <td className="px-4 py-3 text-sm font-medium text-cream">{tournament.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${
                            tournament.importance === 'Championship' ? 'text-gold' : 
                            tournament.importance === 'Major' ? 'text-gold-light' : 
                            'text-gold-light'
                          }`}>
                            {tournament.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tournament.region === 'Global' ? 'bg-void-core/40 text-gold' : 
                            tournament.region === 'EMEA' ? 'bg-void-core/30 text-gold-light' : 
                            tournament.region === 'APAC' ? 'bg-void-core/30 text-gold-light' : 
                            'bg-void-core/30 text-gold-light'
                          }`}>
                            {tournament.region}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gold font-medium">{tournament.prizePool}</td>
                        <td className="px-4 py-3 text-sm text-cream">{tournament.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTimeline === 'sets' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gold mb-4">Coming in 2025</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {timelineData.sets.map((set, index) => (
                    <div key={index} className="bg-void-core/15 rounded-lg overflow-hidden border border-gold/20">
                      <div className={`p-4 ${
                        index === 0 ? 'bg-gradient-to-r from-void-core/30 to-void-core/20' : 
                        index === 1 ? 'bg-gradient-to-r from-void-core/30 to-void-core/20' : 
                        'bg-gradient-to-r from-void-core/30 to-void-core/20'
                      }`}>
                        <h4 className="text-lg font-bold text-gold">{set.name}</h4>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <span className="text-cream/70 text-sm">Dates:</span>
                          <div className="text-cream font-medium">{set.startDate} - {set.endDate}</div>
                        </div>
                        <div className="mb-3">
                          <span className="text-cream/70 text-sm">Theme:</span>
                          <div className="text-cream font-medium">{set.theme}</div>
                        </div>
                        <div className="mb-3">
                          <span className="text-cream/70 text-sm">Set Mechanic:</span>
                          <div className={`text-cream font-medium ${set.mechanic === 'TBA' ? 'text-cream/50' : ''}`}>
                            {set.mechanic}
                          </div>
                        </div>
                        <div>
                          <span className="text-cream/70 text-sm">Description:</span>
                          <div className="text-cream text-sm mt-1">{set.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gold mb-4">Set Revivals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {timelineData.revivals.map((revival, index) => (
                    <div key={index} className="bg-void-core/15 rounded-lg overflow-hidden border border-gold/20">
                      <div className="bg-gradient-to-r from-void-core/30 to-void-core/20 p-4">
                        <h4 className="text-lg font-bold text-gold">{revival.name}</h4>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <span className="text-cream/70 text-sm">Dates:</span>
                          <div className="text-cream font-medium">{revival.startDate} - {revival.endDate}</div>
                        </div>
                        <div>
                          <span className="text-cream/70 text-sm">Description:</span>
                          <div className="text-cream text-sm mt-1">{revival.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Modal for Hack System Details
  const HackDetailsModal = ({ show, onClose }: HackDetailsModalProps) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-void-core bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-filter">
        <div className="bg-void-core/30 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gold/20 shadow-xl">
          <div className="sticky top-0 bg-gradient-to-r from-void-core/30 to-void-core/20 px-6 py-4 flex justify-between items-center border-b border-gold/20 backdrop-filter backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gold flex items-center">
              <Cpu className="mr-2" />
              Set 14 Mechanic: Hacks System
            </h2>
            <button 
              className="p-2 rounded-full bg-void-core/40 text-cream hover:bg-void-core/60 hover:text-white transition-all"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="px-6 py-4">
            <p className="text-cream mb-6">{hacksData.description}</p>
            
            <div className="space-y-6">
              {hacksData.types.map((type, index) => (
                <div key={index} className="bg-void-core/20 rounded-lg p-5 border border-gold/20">
                  <h3 className="text-xl font-bold text-gold mb-3">{type.category}</h3>
                  <p className="text-cream mb-4">{type.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {type.examples.map((example, i) => (
                      <div key={i} className="bg-void-core/30 rounded-lg p-4 border border-gold/20">
                        <div className="font-medium text-gold-light mb-2">{example.name}</div>
                        <div className="text-sm text-cream">{example.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-void-core/20 px-6 py-4 flex justify-end border-t border-gold/20">
            <button
              className="px-4 py-2 bg-void-core/30 text-gold rounded-lg text-sm font-medium hover:bg-void-core/40 transition-all border border-gold/30"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Layout title="News">

      <div className="container mx-auto py-8">
        {/* Main Banner with Navigation - Using homepage style background */}
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
                  Set 14: <span className="text-gold-light">Cyber City</span> News
                </h1>
                <p className="text-cream">Stay updated with the latest patches and the events to come</p>
              </div>
              <div className="flex mt-3 md:mt-0 space-x-4">
                <div className="bg-void-core/50 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-lg border border-gold/30 flex items-center shadow-md">
                  <Clock size={16} className="text-gold mr-2" />
                  <span className="text-sm text-cream">Current Patch: {currentTFTData.currentPatch}</span>
                </div>
                <div className="bg-void-core/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gold/30 flex items-center shadow-md">
                  <Calendar size={16} className="text-gold mr-2" />
                  <span className="text-sm text-cream">Next Patch: {currentTFTData.nextPatchDate}</span>
                </div>
              </div>
            </div>
            
            {/* Navigation inside the banner */}
            <div className="overflow-x-auto">
              <div className="flex justify-center space-x-3 min-w-max">
                <NavTab 
                  title="Overview" 
                  isActive={activeSection === 'overview'} 
                  onClick={() => setActiveSection('overview')}
                  icon={<Eye size={18} />}
                />
                <NavTab 
                  title="Patch Notes" 
                  isActive={activeSection === 'patchnotes'} 
                  onClick={() => setActiveSection('patchnotes')}
                  icon={<FileBarChart size={18} />}
                />
                <NavTab 
                  title="Timeline" 
                  isActive={activeSection === 'timeline'} 
                  onClick={() => setActiveSection('timeline')}
                  icon={<Calendar size={18} />}
                />
              </div>
            </div>
          </div>
        </div>
          
        {/* Main Content Area */}
        <div>
          {activeSection === 'overview' && <CurrentSetOverview />}
          {activeSection === 'patchnotes' && <PatchNotesSection />}
          {activeSection === 'timeline' && <TimelineSection />}
        </div>
        
        {/* Hacks System Modal */}
        <HackDetailsModal show={showInfoModal} onClose={() => setShowInfoModal(false)} />
      </div>
    </Layout>
  );
};

export default TFTPatchNotes;
