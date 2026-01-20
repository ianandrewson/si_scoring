export type Scenario = {
  name: string
  difficulty: number,
}

export const SCENARIOS: Scenario[] = [
  { name: "Blitz", difficulty: 0 },
  { name: "Guard the Isle's Heart", difficulty: 0, },
  { name: "Rituals of Terror", difficulty: 3, },
  { name: "Dahan Insurrection", difficulty: 4, },
  { name: "Second Wave", difficulty: 1, },
  { name: "Powers Long Forgotten", difficulty: 1, },
  { name: "Ward the Shores", difficulty: 2, },
  { name: "Rituals of the Destroying Flame", difficulty: 3, },
  { name: "Elemental Invocation", difficulty: 1, },
  { name: "Despicable Theft", difficulty: 2, },
  { name: "The Great River", difficulty: 3, },
  { name: "A Diversity of Spirits", difficulty: 0, },
  { name: "Varied Terrains", difficulty: 2, },
  { name: "Destiny Unfolds", difficulty: -1, },
  { name: "Surges of Colonization", difficulty: 2, },
  { name: "Surges of Colonization (Larger Surges)", difficulty: 7, },
]