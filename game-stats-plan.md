# Game Stats Screen Implementation Plan

## Overview
Implement a comprehensive statistics screen for individual games that compares the current game against all games in the selected profile (or all profiles based on `viewAllProfiles` flag). Replace the placeholder stats tab with a fully functional GameStats component showing rankings, win/loss records, and performance metrics.

## Requirements Summary
- Refactor the ternary in `app/game/[id].tsx` (lines 249-262) to render a new `GameStats` component
- Implement 10+ statistics comparing the current game to profile games
- Build custom visualization components (scales, records) without external libraries
- Respect profile filtering (viewAllProfiles vs activeProfile)
- Handle edge cases (no adversary, first game, no matches)

## Architecture

### Files to Create

1. **`/components/stats/GameStats.tsx`** - Main stats component
   - Fetches comparison games using `useGames(profileId)`
   - Calculates all statistics using utility functions
   - Renders all stat sections with ScrollView
   - Handles loading/empty states

2. **`/components/stats/StatCard.tsx`** - Reusable stat display card
   - Props: `title`, `value`, `subtitle`, `highlightColor`
   - Card styling consistent with app design
   - Used for rankings and score context

3. **`/components/stats/RangeScale.tsx`** - Custom scale visualization
   - Props: `title`, `min`, `max`, `current`, `lowIsGood`
   - Visual track with positioned indicator
   - Color-coded based on good/bad position
   - Labels for min/current/max values

4. **`/components/stats/WinLossRecord.tsx`** - Win/loss record display
   - Props: `title`, `wins`, `losses`, `subtitle`
   - Shows W-L record with percentage
   - Visual progress bar
   - Handles zero-game case

5. **`/lib/stats/gameComparison.ts`** - Statistics calculation utilities
   - `getHighestScore()` - Find highest scoring game
   - `getOverallRank()` - Calculate rank among all games
   - `getSameDifficultyRank()` - Rank within same difficulty
   - `getBlightStats()` - Min/max/current/percentage for blight
   - `getDahanStats()` - Min/max/current/percentage for dahan
   - `getSameAdversaryDifficultyRecord()` - W-L vs same adversary+difficulty
   - `getSameAdversaryRecord()` - W-L vs same adversary (any difficulty)
   - `getSameSpiritsRecord()` - W-L with same spirits
   - `getSameSpiritsAndAdversaryRecord()` - W-L same spirits+adversary
   - `getSpiritComboScoreStats()` - High/low/avg for spirit combo at difficulty
   - `getTotalDifficulty()` - Sum adversary + scenario difficulty

6. **`/lib/stats/spiritComparison.ts`** - Spirit array comparison logic
   - `areSpiritsSame()` - Order-agnostic array equality
   - `getSpiritComboKey()` - Generate sorted key for grouping

### Files to Modify

**`/app/game/[id].tsx`** (lines 249-262)
- Replace placeholder stats content with `<GameStats game={game} />`
- Add import: `import { GameStats } from '@/components/stats/GameStats';`

## Key Implementation Details

### Data Fetching Strategy
```typescript
// In GameStats component
const { activeProfile, viewAllProfiles } = useApp();
const profileId = viewAllProfiles ? undefined : activeProfile?.id;
const { games: allGames, loading } = useGames(profileId);
const comparisonGames = allGames.filter(g => g.id !== currentGame.id);
```

### Spirit Comparison (Order-Agnostic)
```typescript
export const areSpiritsSame = (spirits1: string[], spirits2: string[]): boolean => {
  if (spirits1.length !== spirits2.length) return false;
  const sorted1 = [...spirits1].sort();
  const sorted2 = [...spirits2].sort();
  return sorted1.every((spirit, index) => spirit === sorted2[index]);
};
```

### Total Difficulty Calculation
```typescript
const getTotalDifficulty = (game: GameWithScore) => {
  return (game.adversaryDifficulty ?? 0) + (game.scenarioDifficulty ?? 0);
};
```

### Ranking Algorithm
```typescript
const getOverallRank = (currentGame: GameWithScore, allGames: GameWithScore[]) => {
  const sortedGames = [...allGames, currentGame].sort((a, b) => b.score - a.score);
  return sortedGames.findIndex(g => g.id === currentGame.id) + 1;
};
```

### Scale Percentage Calculation
```typescript
// For positioning indicator on scale
const percentage = max > min
  ? ((current - min) / (max - min)) * 100
  : 50; // Default to middle if all values same
```

## UI Layout Structure

```
ScrollView (padding: 16px)
├── Score Hero Card
│   └── Large centered score (existing style)
│
├── Rankings Section (marginBottom: 24px)
│   ├── StatCard: Overall Rank (#X out of Y games)
│   └── StatCard: Difficulty Rank (#X out of Y at difficulty Z)
│
├── Score Context Section
│   └── StatCard: Highest Score (with spirit names)
│
├── Game State Scales Section
│   ├── RangeScale: Blight (lowIsGood=true, red=high, green=low)
│   └── RangeScale: Dahan (lowIsGood=false, green=high, red=low)
│
├── Win/Loss Records Section
│   ├── WinLossRecord: Same Adversary + Difficulty
│   ├── WinLossRecord: Same Adversary (Any Difficulty)
│   ├── WinLossRecord: Same Spirits
│   └── WinLossRecord: Same Spirits + Adversary
│
└── Spirit Combo Stats Section
    └── StatCard: High/Avg/Low scores for combo at difficulty
```

## Component Styling Guidelines

### Colors
- Primary: `#007AFF` (blue)
- Success: `#34C759` (green)
- Destructive: `#FF3B30` (red)
- Warning: `#FF9500` (orange)
- Text primary: `#11181C`
- Text secondary: `#666`
- Background: `#fff`
- Border/track: `#e0e0e0`

### Card Pattern
```typescript
{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}
```

### Spacing
- Section margin: `24px` bottom
- Card margin: `12px` bottom
- Section padding: `16px`
- Section title fontSize: `18px`, fontWeight: `'600'`

## Edge Cases to Handle

1. **No comparison games** (first game)
   - Show message: "This is your first game! Play more to see comparison statistics."
   - Only display score hero card

2. **No adversary** (null)
   - Skip adversary-specific statistics
   - Don't render adversary win/loss records

3. **Min equals max** (single value range)
   - For RangeScale: Show "All games: X" instead of scale
   - Avoid division by zero in percentage calculation

4. **No matching games**
   - For WinLossRecord: Show "No games found"
   - For spirit combo stats: Don't render section at all

5. **Profile switching**
   - Stats automatically update via useGames(profileId) dependency
   - Comparison set changes when viewAllProfiles toggles

## Performance Optimizations

- Use `useMemo` for filtering comparison games
- Use `useMemo` for all statistics calculations
- Wrap StatCard, RangeScale, WinLossRecord with `React.memo()`
- Single pass through games array where possible
- Expected dataset: 50-500 games (O(n) to O(n log n) acceptable)

## Statistics Definitions

1. **Overall Highest Score**: Max score across all comparison games
2. **Overall Rank**: Position when all games sorted by score descending
3. **Difficulty Rank**: Position among games with same total difficulty
4. **Blight Scale**: Shows min/max blight with current game's position
5. **Dahan Scale**: Shows min/max dahan with current game's position
6. **Same Adversary+Difficulty W-L**: Win/loss vs same adversary at same difficulty
7. **Same Adversary W-L**: Win/loss vs same adversary (any difficulty/spirits)
8. **Same Spirits W-L**: Win/loss with same spirit combo (order-agnostic, any adversary)
9. **Same Spirits+Adversary W-L**: Win/loss with same spirits vs same adversary (any difficulty)
10. **Spirit Combo Score Stats**: High/low/average scores for same spirit combo at same total difficulty (any adversary)

## Verification Steps

After implementation:
1. View game details, switch to Stats tab
2. Verify all statistics calculate correctly
3. Test with first game (empty state)
4. Test with no adversary game
5. Test spirit matching with different orders (["A","B"] vs ["B","A"])
6. Toggle viewAllProfiles and verify stats update
7. Switch active profile and verify filtering
8. Check with games at same difficulty
9. Verify scales render correctly (min/max/current)
10. Test win/loss percentages are accurate
11. Verify scrolling works smoothly
12. Add plan file to git repo

## Critical Implementation Files

1. `/components/stats/GameStats.tsx` - Orchestrates all stats
2. `/lib/stats/gameComparison.ts` - Core calculation logic
3. `/lib/stats/spiritComparison.ts` - Spirit matching logic
4. `/components/stats/RangeScale.tsx` - Visual scale component
5. `/app/game/[id].tsx` - Integration point
