export interface Profile {
  id: number;
  name: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface Game {
  id: number;
  profileId: number;
  date: string;
  players: string[];
  spirits: string[];
  win: boolean;
  adversary: string | null;
  adversaryDifficulty: number | null;
  scenario: string | null;
  scenarioDifficulty: number | null;
  invaderCards: number;
  dahan: number;
  blight: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GamePicture {
  id: number;
  gameId: number;
  filePath: string;
  createdAt: string;
}

export interface GameWithScore extends Game {
  score: number;
  pictures: string[];
}
