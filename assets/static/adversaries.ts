export type Adversary = {
  name: string,
  label: string,
  levels: Record<number, { name: string, difficulty: number}>, 
}

export const ADVERSARIES: Adversary[] = [
  {
    name: "The Kingdom of Brandenberg-Prussia",
    label: "Brandenberg-Prussia",
    levels: {
      0: { name: "Base Adversary", difficulty: 1 },
      1: { name: "Fast Start", difficulty: 2 },
      2: { name: "Surge of Colonists", difficulty: 4 },
      3: { name: "Efficient", difficulty: 6 },
      4: { name: "Aggressive Timetable", difficulty: 7 },
      5: { name: "Ruthlessly Efficient", difficulty: 9 },
      6: { name: "Terrifingly Efficient", difficulty: 10 },
    }
  },
  {
    name: "The Kingdom of England",
    label: "England",
    levels: {
      0: { name: "Base Adversary", difficulty: 1 },
      1: { name: "Indentured Servants Earn Land", difficulty: 3 },
      2: { name: "Criminals and Malcontents", difficulty: 4 },
      3: { name: "High Immigration (I)", difficulty: 6},
      4: { name: "High Immigration (Full)", difficulty: 7},
      5: { name: "Local Autonomy", difficulty: 9},
      6: { name: "Independent Resolve", difficulty: 11 },
    }
  },
  {
    name: "The Kingdom of Sweden",
    label: "Sweden",
    levels: {
      0: { name: "Base Adversary", difficulty: 1 },
      1: { name: "Heavy Mining", difficulty: 2 },
      2: { name: "Population Pressure at Home", difficulty: 3 },
      3: { name: "Fine Steel for Tools and Guns", difficulty: 5},
      4: { name: "Royal Backing", difficulty: 6 },
      5: { name: "Mining Rush", difficulty: 7 },
      6: { name: "Prospecting Outpost", difficulty: 8 },
    }
  },
  {
    name: "The Kingdom of France (Plantation Colony)",
    label: "France",
    levels: {
      0: { name: "Base Adversary", difficulty: 2 },
      1: { name: "Frontier Explorers", difficulty: 3 },
      2: { name: "Slave Labor", difficulty: 5 },
      3: { name: "Early Plantation", difficulty: 7 },
      4: { name: "Triangle Trade", difficulty: 8 },
      5: { name: "Slow-Healing Ecosystem", difficulty: 9},
      6: { name: "Persistent Explorers", difficulty: 10 },
    }
  },
  {
    name: "The Habsburg Monarchy (Livestock Colony)",
    label: "Habsburg",
    levels: {
      0: { name: "Base Adversary", difficulty: 2 },
      1: { name: "Migratory Herders", difficulty: 3 },
      2: { name: "More Rural than Urban", difficulty: 5 },
      3: { name: "Fast Spread", difficulty: 6 },
      4: { name: "Herds Thrive in Verdant Lands", difficulty: 8 },
      5: { name: "Wave of Immigration", difficulty: 9 },
      6: { name: "Far-Flung Herds", difficulty: 10 },
    }
  },
  {
    name: "The Tsardom of Russia",
    label: "Russia",
    levels: {
      0: { name: "Base Adversary", difficulty: 1 },
      1: { name: "Hunters Bring Home Shell and Hide", difficulty: 3 },
      2: { name: "A sense for Impending Disaster", difficulty: 4 },
      3: { name: "Competition Among Hunters", difficulty: 6 },
      4: { name: "Accelerated Exploitation", difficulty: 7 },
      5: { name: "Entrench in the Face of Fear", difficulty: 9 },
      6: { name: "Pressure for Fast Profit", difficulty: 11 },
    }
  },
  {
    name: "The Kingdom of Scotland",
    label: "Scotland",
    levels: {
      0: { name: "Base Adversary", difficulty: 1 },
      1: { name: "Trading Port", difficulty: 3 },
      2: { name: "Seize Opportunity", difficulty: 4 },
      3: { name: "Chart the Coastline", difficulty: 6 },
      4: { name: "Ambition of a Minor Nation", difficulty: 7 },
      5: { name: "Runoff and Bilgewater", difficulty: 8 },
      6: { name: "Exports Fuel Inward Growth", difficulty: 10 },
    }
  },
  {
    name: "Habsburg Mining Expidition",
    label: "Mining Expidition",
    levels: {
      0: { name: "Base Adversary", difficulty: 1 },
      1: { name: "Avarice Rewarded", difficulty: 3 },
      2: { name: "Miners Come From Far and Wide", difficulty: 4 },
      3: { name: "Mining Boom (I)", difficulty: 5 },
      4: { name: "Untapped Salt Deposits", difficulty: 7 },
      5: { name: "Mining Boom (II)", difficulty: 9 },
      6: { name: "The Empire Ascendant", difficulty: 10 }
    }
  }
]