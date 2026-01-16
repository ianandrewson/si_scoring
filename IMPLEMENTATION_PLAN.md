# Spirit Island Score Tracking App - Implementation Plan

## Overview
A React Native (Expo) application to track Spirit Island board game scores with offline-only local storage.

---

## Phase 1: Project Setup & Dependencies

### Install Required Packages
```bash
npx expo install expo-sqlite expo-file-system expo-image-picker expo-image-manipulator @react-native-community/datetimepicker
```

### Update app.json Plugins
Add camera and photo library permissions for `expo-image-picker`.

### Create Directory Structure
```
app/
├── _layout.tsx                    # Root layout with providers
├── index.tsx                      # Entry redirect logic
├── profile-setup.tsx              # First-time profile creation
├── (tabs)/
│   ├── _layout.tsx                # Tab navigator
│   ├── index.tsx                  # Home screen (games list)
│   ├── profiles.tsx               # Profile management
│   └── stats.tsx                  # Profile stats
├── add-game.tsx                   # Add game form (modal)
└── game/
    └── [id].tsx                   # Game details with tabs
components/
├── ui/Button.tsx, DatePicker.tsx, IconSymbol.tsx
├── GameCard.tsx
├── ImagePicker.tsx
├── ThemedText.tsx, ThemedView.tsx
hooks/
├── useDatabase.ts, useProfiles.ts, useGames.ts
lib/
├── database/schema.ts, connection.ts
├── storage/imageStorage.ts
└── scoring.ts
types/index.ts
contexts/AppContext.tsx
```

---

## Phase 2: Database Layer

### Schema (SQLite)
- **profiles**: id, name, created_at, last_used_at
- **games**: id, profile_id (FK), score, date, players, spirits, win, adversary, scenario, invader_cards, dahan, blight, notes, created_at, updated_at
- **game_pictures**: id, game_id (FK), file_path, created_at

add index on games.profile_id. Consider ON DELETE CASCADE for game_pictures.

### Key Files
- `lib/database/schema.ts` - SQL table definitions
- `lib/database/connection.ts` - Database initialization with `expo-sqlite`
- `hooks/useProfiles.ts` - Profile CRUD operations
- `hooks/useGames.ts` - Game CRUD with score calculation; score calculation should be made when adding a game to database. Enums for adversary and scenario difficulty will be manually added.

### Score Calculation (`lib/scoring.ts`) - Official Rules
```typescript
// Victory Score:
// = (5 × (adversaryDifficulty + scenarioDifficulty)) + 10 + (2 x invaderCards) + (dahan / players) - (blight / players)
//
// Defeat Score: (2 × (adversaryDifficulty + scenarioDifficulty)) + invaderCards + (dahan / players) - (blight / players)
```

---

## Phase 3: State Management

### AppContext (`contexts/AppContext.tsx`)
- `activeProfile` - Currently selected profile
- `hasCompletedSetup` - Whether initial profile exists
- `viewAllProfiles` - Toggle to show games from all profiles
- Actions: `createAndActivateProfile`, `switchProfile`, `refreshProfiles`

---

## Phase 4: Navigation Structure

### Root Layout (`app/_layout.tsx`)
- Wrap with `AppProvider` and `ThemeProvider`
- Stack screens: index, profile-setup, (tabs), add-game, game/[id]

### Entry Point (`app/index.tsx`)
- Redirect to `/profile-setup` if no profiles exist
- Redirect to `/(tabs)` if profile exists (loads most recent active profile)

### Tab Navigator (`app/(tabs)/_layout.tsx`)
- **Profiles** tab - Profile management
- **Games** tab (home) - List of games
- **Stats** tab - Profile stats

---

## Phase 5: Screen Implementations

### Profile Setup (`app/profile-setup.tsx`)
- Text input for profile name
- Create button navigates to home

### Home Screen (`app/(tabs)/index.tsx`)
- FlatList of GameCard components
- Pull-to-refresh
- FAB button to add new game
- Empty state when no games

### Add Game (`app/add-game.tsx`)
- Form fields: date, players, spirits, win toggle, adversary (text), adversary difficulty (number), scenario, invader cards, dahan, blight, notes
- Terror level picker only shown when win=true
- ImagePicker component for photos
- On submit: save to DB, navigate to `/game/[id]?tab=stats`

### Game Details (`app/game/[id].tsx`)
- Tab bar: "Game" | "Stats"
- **Game tab**: All game info, photos horizontal scroll
- **Stats tab**: Score display + "Additional stats will go here"
- Default to "Game" tab from list, "Stats" tab after adding

### Settings (`app/(tabs)/profiles.tsx`)
- List of profiles with selection
- "All Profiles" profile with id=0
- Add new profile button

---

## Phase 6: Image Handling

### Image Storage (`lib/storage/imageStorage.ts`)
- Store in `FileSystem.documentDirectory/media/`
- `processAndSaveImage()`: Resize to 1920px width, compress to JPEG (0.8 quality)
- `deleteImage()`, `deleteAllGameImages()`

### ImagePicker Component (`components/ImagePicker.tsx`)
- Camera and photo library options
- Max 5 images per game
- Shows processing indicator
- Remove button on each image

---

## Phase 7: UI Components

### Components to Create
- `Button.tsx` - Primary, outline, destructive variants
- `DatePicker.tsx` - Platform-specific date selection
- `GameCard.tsx` - Game list item with date, spirits, score, win/loss badge
- Copy from app-example: `ThemedText.tsx`, `ThemedView.tsx`, `IconSymbol.tsx`, `HapticTab.tsx`

---

## Critical Files to Modify/Create

| File | Purpose |
|------|---------|
| `app.json` | Add expo-image-picker plugin with permissions |
| `lib/database/connection.ts` | SQLite initialization |
| `contexts/AppContext.tsx` | Global state management |
| `app/_layout.tsx` | Root navigation with providers |
| `hooks/useGames.ts` | Game CRUD + score calculation |
| `lib/storage/imageStorage.ts` | Image processing and storage |
| `app/game/[id].tsx` | Tabbed game details screen |

---

## Verification Plan

1. **First Launch**: Opens profile setup, creates profile, navigates to empty home
2. **Add Game**: Fill form, add photo, submit → navigates to Stats tab
3. **Game List**: New game appears with correct summary
4. **Game Details**: All data displays, both tabs work
5. **Profile Switching**: Settings shows profiles, switching changes game list
6. **View All**: Toggle shows games from all profiles
7. **Persistence**: Kill app, reopen → loads most recent profile and saved games
8. **Image Handling**: Photos resized, stored locally, display correctly

---

## Type Definitions

```typescript
interface Profile {
  id: number;
  name: string;
  createdAt: string;
  lastUsedAt: string;
}

interface Game {
  id: number;
  profileId: number;
  date: string;
  players: string;
  spirits: string;
  win: boolean;
  adversary: string | null;
  scenario: string | null;
  invaderCards: number;
  dahan: number;
  blight: number;
  notes: string;
}

interface GameWithScore extends Game {
  score: number;
  pictures: string[];
}
```
