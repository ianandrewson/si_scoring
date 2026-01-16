export const createProfilesTable = `
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_used_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const createGamesTable = `
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    date TEXT NOT NULL,
    players TEXT NOT NULL,
    spirits TEXT NOT NULL,
    win INTEGER NOT NULL,
    adversary TEXT,
    adversary_difficulty INTEGER,
    scenario TEXT,
    scenario_difficulty INTEGER,
    invader_cards INTEGER NOT NULL DEFAULT 0,
    dahan INTEGER NOT NULL DEFAULT 0,
    blight INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
  );
`;

export const createGamePicturesTable = `
  CREATE TABLE IF NOT EXISTS game_pictures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );
`;

export const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_games_profile_id ON games(profile_id);
`;

export const initializeDatabase = async (db: any) => {
  await db.execAsync(createProfilesTable);
  await db.execAsync(createGamesTable);
  await db.execAsync(createGamePicturesTable);
  await db.execAsync(createIndexes);
};
