import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/database/connection';
import { calculateScore } from '@/lib/scoring';
import { Game, GameWithScore } from '@/types';

interface CreateGameParams {
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
  pictures?: string[];
}

interface UpdateGameParams extends CreateGameParams {
  id: number;
}

interface DbGame {
  id: number;
  profile_id: number;
  score: number;
  date: string;
  players: string;
  spirits: string;
  win: number;
  adversary: string | null;
  adversary_difficulty: number | null;
  scenario: string | null;
  scenario_difficulty: number | null;
  invader_cards: number;
  dahan: number;
  blight: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

const mapDbGameToGameWithScore = (dbGame: DbGame): Omit<GameWithScore, 'pictures'> => ({
  id: dbGame.id,
  profileId: dbGame.profile_id,
  score: dbGame.score,
  date: dbGame.date,
  players: JSON.parse(dbGame.players),
  spirits: JSON.parse(dbGame.spirits),
  win: dbGame.win === 1,
  adversary: dbGame.adversary,
  adversaryDifficulty: dbGame.adversary_difficulty,
  scenario: dbGame.scenario,
  scenarioDifficulty: dbGame.scenario_difficulty,
  invaderCards: dbGame.invader_cards,
  dahan: dbGame.dahan,
  blight: dbGame.blight,
  notes: dbGame.notes,
  createdAt: dbGame.created_at,
  updatedAt: dbGame.updated_at,
});

export const useGames = (profileId?: number) => {
  const [games, setGames] = useState<GameWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      const db = await getDatabase();
      let query = 'SELECT * FROM games';
      const params: any[] = [];

      if (profileId) {
        query += ' WHERE profile_id = ?';
        params.push(profileId);
      }

      query += ' ORDER BY date DESC, created_at DESC';

      const result = await db.getAllAsync<DbGame>(query, params);

      const gamesWithScores = await Promise.all(
        result.map(async (dbGame) => {
          const gameWithScore = mapDbGameToGameWithScore(dbGame);

          const pictures = await db.getAllAsync<{ file_path: string }>(
            'SELECT file_path FROM game_pictures WHERE game_id = ?',
            [gameWithScore.id]
          );

          return {
            ...gameWithScore,
            pictures: pictures.map((p) => p.file_path),
          };
        })
      );

      setGames(gamesWithScores);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (
    params: CreateGameParams
  ): Promise<GameWithScore | null> => {
    try {
      const db = await getDatabase();

      const score = calculateScore({
        win: params.win,
        adversaryDifficulty: params.adversaryDifficulty,
        scenarioDifficulty: params.scenarioDifficulty,
        invaderCards: params.invaderCards,
        dahan: params.dahan,
        blight: params.blight,
        playerCount: params.players.length,
      });

      const result = await db.runAsync(
        `INSERT INTO games (
          profile_id, score, date, players, spirits, win,
          adversary, adversary_difficulty, scenario, scenario_difficulty,
          invader_cards, dahan, blight, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          params.profileId,
          score,
          params.date,
          JSON.stringify(params.players),
          JSON.stringify(params.spirits),
          params.win ? 1 : 0,
          params.adversary,
          params.adversaryDifficulty,
          params.scenario,
          params.scenarioDifficulty,
          params.invaderCards,
          params.dahan,
          params.blight,
          params.notes,
        ]
      );

      const gameId = result.lastInsertRowId;

      if (params.pictures && params.pictures.length > 0) {
        for (const filePath of params.pictures) {
          await db.runAsync(
            'INSERT INTO game_pictures (game_id, file_path) VALUES (?, ?)',
            [gameId, filePath]
          );
        }
      }

      const newGame = await getGameById(gameId);
      await fetchGames();
      return newGame;
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  };

  const getGameById = async (id: number): Promise<GameWithScore | null> => {
    try {
      const db = await getDatabase();
      const dbGame = await db.getFirstAsync<DbGame>(
        'SELECT * FROM games WHERE id = ?',
        [id]
      );

      if (!dbGame) {
        return null;
      }

      const gameWithScore = mapDbGameToGameWithScore(dbGame);

      const pictures = await db.getAllAsync<{ file_path: string }>(
        'SELECT file_path FROM game_pictures WHERE game_id = ?',
        [id]
      );

      return {
        ...gameWithScore,
        pictures: pictures.map((p) => p.file_path),
      };
    } catch (error) {
      console.error('Error getting game:', error);
      return null;
    }
  };

  const updateGame = async (
    params: UpdateGameParams
  ): Promise<GameWithScore | null> => {
    try {
      const db = await getDatabase();

      const score = calculateScore({
        win: params.win,
        adversaryDifficulty: params.adversaryDifficulty,
        scenarioDifficulty: params.scenarioDifficulty,
        invaderCards: params.invaderCards,
        dahan: params.dahan,
        blight: params.blight,
        playerCount: params.players.length,
      });

      await db.runAsync(
        `UPDATE games SET
          profile_id = ?, score = ?, date = ?, players = ?, spirits = ?, win = ?,
          adversary = ?, adversary_difficulty = ?, scenario = ?, scenario_difficulty = ?,
          invader_cards = ?, dahan = ?, blight = ?, notes = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
        [
          params.profileId,
          score,
          params.date,
          JSON.stringify(params.players),
          JSON.stringify(params.spirits),
          params.win ? 1 : 0,
          params.adversary,
          params.adversaryDifficulty,
          params.scenario,
          params.scenarioDifficulty,
          params.invaderCards,
          params.dahan,
          params.blight,
          params.notes,
          params.id,
        ]
      );

      await db.runAsync('DELETE FROM game_pictures WHERE game_id = ?', [
        params.id,
      ]);

      if (params.pictures && params.pictures.length > 0) {
        for (const filePath of params.pictures) {
          await db.runAsync(
            'INSERT INTO game_pictures (game_id, file_path) VALUES (?, ?)',
            [params.id, filePath]
          );
        }
      }

      const updatedGame = await getGameById(params.id);
      await fetchGames();
      return updatedGame;
    } catch (error) {
      console.error('Error updating game:', error);
      return null;
    }
  };

  const deleteGame = async (id: number): Promise<void> => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM games WHERE id = ?', [id]);
      await fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [profileId]);

  return {
    games,
    loading,
    fetchGames,
    createGame,
    getGameById,
    updateGame,
    deleteGame,
  };
};
