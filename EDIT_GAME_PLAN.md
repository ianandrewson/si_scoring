# Implementation Plan: Add Edit Game Button

## Overview
Add an "Edit Game" button to the game details screen that reuses the add-game screen for editing existing games.

## Approach
Modify the add-game screen to accept an optional `id` query parameter. When present, the screen loads the existing game data, pre-populates all form fields, and submits updates instead of creating a new game.

## Files to Modify

### 1. `/Users/ianandrewson/coding/native/si_scoring/app/game/[id].tsx`
Add an "Edit Game" button above the existing delete button.

**Changes:**
- Add Edit Game button before the Delete Game button (around line 231)
- Add button click handler that navigates to `/add-game?id=${id}`
- Add styling for the edit button (blue outline, similar styling to delete button)

### 2. `/Users/ianandrewson/coding/native/si_scoring/app/add-game.tsx`
Transform into a dual-purpose screen that handles both creating and editing games.

**Changes:**
- Import `useLocalSearchParams` from expo-router
- Extract optional `id` parameter from route params
- Import `updateGame` from `useGames` hook (currently only imports `createGame`)
- Add state variables:
  - `isEditMode` boolean to track if editing vs creating
  - `gameId` number to store the game being edited
  - `initialLoading` boolean to show loading state while fetching game data
- Add useEffect to load existing game data when `id` parameter is present
- Modify `handleSubmit()` to call `updateGame()` when in edit mode vs `createGame()` when creating
- Update Stack.Screen title to show "Edit Game" vs "Add Game" based on mode
- Update submit button text to show "Update Game" vs "Save Game" based on mode

## Key Implementation Details

### Game Data Loading Logic
When the screen loads with an `id` parameter:
1. Set `initialLoading` to true
2. Call `getGameById(parseInt(id, 10))`
3. Map the loaded game data to form state:
   - `date`: Convert string to Date object: `new Date(game.date)`
   - `players`: Use directly: `game.players`
   - `spirits`: Zip players with spirits: `game.players.reduce((acc, player, idx) => ({ ...acc, [player]: game.spirits[idx] }), {})`
   - `win`: Use directly: `game.win`
   - `adversary`: Use the label: `game.adversary || ''`
   - `adversaryLevel`: Reverse-lookup level by matching difficulty (see below)
   - `scenario`: Use directly: `game.scenario || ''`
   - `invaderCards`: Convert to string: `game.invaderCards.toString()`
   - `dahan`: Convert to string: `game.dahan.toString()`
   - `blight`: Convert to string: `game.blight.toString()`
   - `notes`: Use directly: `game.notes`
   - `images`: Use game.pictures: `game.pictures`
4. Set `initialLoading` to false

### Adversary Level Reverse Lookup
The game stores `adversaryDifficulty` (e.g., 6) but the form needs `adversaryLevel` (e.g., 3).
```typescript
if (game.adversary && game.adversaryDifficulty !== null) {
  const adversaryData = ADVERSARIES.find(adv => adv.label === game.adversary);
  if (adversaryData) {
    const levelEntry = Object.entries(adversaryData.levels).find(
      ([_, data]) => data.difficulty === game.adversaryDifficulty
    );
    if (levelEntry) {
      setAdversaryLevel(parseInt(levelEntry[0], 10));
    }
  }
}
```

### Submit Handler Logic
```typescript
if (isEditMode && gameId) {
  game = await updateGame({
    id: gameId,
    profileId: game.profileId, // Use existing profile, don't change
    date: date.toISOString().split('T')[0],
    // ... rest of params same as createGame
  });
} else {
  game = await createGame({
    profileId: activeProfile!.id,
    date: date.toISOString().split('T')[0],
    // ... rest of params
  });
}
```

**Important:** When editing, use the game's existing `profileId`, not `activeProfile.id`. This prevents accidentally moving games between profiles.

## Edge Cases to Handle

1. **Loading State**: Show loading indicator while fetching game data; prevent form interaction during load
2. **Game Not Found**: If `getGameById` returns null, show error and navigate back
3. **Invalid ID**: Handle non-numeric or invalid game IDs gracefully
4. **Spirits Mapping**: Handle cases where players.length !== spirits.length (data corruption)
5. **Adversary Level Not Found**: If difficulty doesn't match any level, default to level 0
6. **Optional Fields**: Handle null values for adversary, scenario, notes
7. **Profile ID Preservation**: Always use the game's original profileId when editing

## Implementation Steps

### Step 1: Add Edit Button to Game Details
1. Open `app/game/[id].tsx`
2. Add Edit Game button before Delete Game button
3. Add navigation handler: `router.push(\`/add-game?id=${id}\`)`
4. Add button styling (blue button, similar to delete but different color)

### Step 2: Add Route Parameter Support to Add Game Screen
1. Open `app/add-game.tsx`
2. Import `useLocalSearchParams` from expo-router
3. Extract `id` parameter: `const { id } = useLocalSearchParams<{ id?: string }>()`
4. Add state: `const [isEditMode, setIsEditMode] = useState(false)`
5. Add state: `const [gameId, setGameId] = useState<number | null>(null)`
6. Add state: `const [initialLoading, setInitialLoading] = useState(false)`
7. Import `updateGame` and `getGameById` from useGames hook

### Step 3: Add Game Data Loading
1. Add useEffect that runs when component mounts:
   ```typescript
   useEffect(() => {
     if (id) {
       loadExistingGame(parseInt(id, 10));
     }
   }, [id]);
   ```
2. Implement `loadExistingGame` async function:
   - Set `initialLoading` to true
   - Call `getGameById()`
   - Handle game not found case
   - Map game data to all form state variables
   - Implement adversary level reverse lookup
   - Set `isEditMode` to true
   - Set `gameId` to the loaded game's id
   - Set `initialLoading` to false

### Step 4: Update Submit Handler
1. Modify `handleSubmit()` to check `isEditMode`
2. When edit mode: call `updateGame()` with game id and all params
3. When create mode: call `createGame()` as before
4. Use game's existing `profileId` when editing, not `activeProfile.id`

### Step 5: Update UI Based on Mode
1. Update Stack.Screen title to be dynamic: `title: isEditMode ? 'Edit Game' : 'Add Game'`
2. Update submit button text: `{isEditMode ? 'Update Game' : 'Save Game'}`
3. Show loading spinner when `initialLoading` is true

## Verification Plan

### Manual Testing
1. **Create a test game** with complete data (all fields filled)
2. **Navigate to game details** and verify all data displays correctly
3. **Click Edit Game button** and verify:
   - Navigation to add-game screen with title "Edit Game"
   - All form fields are pre-populated with correct values
   - Date matches
   - All players and spirits are correct
   - Win/loss toggle is correct
   - Adversary and level are correct
   - Scenario is correct
   - Invader cards, dahan, blight are correct
   - Notes are correct
   - Images are shown (if any)
4. **Modify several fields**:
   - Change date
   - Add a player
   - Change a spirit
   - Toggle win/loss
   - Change adversary level
   - Modify notes
5. **Submit the form** by clicking "Update Game"
6. **Verify navigation** back to game details with stats tab
7. **Verify all changes persisted** in the game details display
8. **Go back and edit again** to ensure you can edit multiple times

### Test Edge Cases
1. Edit a game with minimal data (no adversary, no scenario)
2. Edit a game and remove the adversary
3. Edit a game and add an adversary
4. Edit a game with 1 player, add 3 more
5. Edit a game with 4 players, remove 2
6. Edit a game and change adversary to different one with different level
7. Verify creating new games still works (test from home screen)

### Test Data Integrity
1. After editing, verify the game's `profileId` hasn't changed
2. Verify the game's `id` hasn't changed
3. Verify `createdAt` hasn't changed
4. Verify `updatedAt` has been updated
5. Verify score is recalculated correctly based on new values

### Database Testing
Use the useGames hook to verify:
- Updated game appears in games list with new data
- No duplicate games created
- Pictures are properly updated if modified
