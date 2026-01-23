/**
 * Game comparison utilities for calculating statistics.
 * Provides functions to compare games and calculate various metrics.
 */

import { GameWithScore } from '@/types';
import { areSpiritsSame } from './spiritComparison';

/**
 * Calculates the total difficulty of a game (adversary + scenario).
 */
export const getTotalDifficulty = (game: GameWithScore): number => {
  return (game.adversaryDifficulty ?? 0) + (game.scenarioDifficulty ?? 0);
};

/**
 * Finds the game with the highest score.
 */
export const getHighestScore = (games: GameWithScore[]): GameWithScore | null => {
  if (games.length === 0) return null;
  return games.reduce((highest, game) =>
    game.score > highest.score ? game : highest
  );
};

/**
 * Calculates the rank of the current game among all games.
 * @returns Rank (1-indexed) and total count
 */
export const getOverallRank = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { rank: number; total: number } => {
  const sortedGames = [...allGames, currentGame].sort((a, b) => b.score - a.score);
  const rank = sortedGames.findIndex(g => g.id === currentGame.id) + 1;
  return { rank, total: sortedGames.length };
};

/**
 * Calculates the rank of the current game among games with the same total difficulty.
 * @returns Rank (1-indexed), total count, and difficulty level
 */
export const getSameDifficultyRank = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { rank: number; total: number; difficulty: number } | null => {
  const difficulty = getTotalDifficulty(currentGame);
  const sameDifficultyGames = allGames.filter(
    g => getTotalDifficulty(g) === difficulty
  );

  if (sameDifficultyGames.length === 0) {
    return null;
  }

  const sortedGames = [...sameDifficultyGames, currentGame].sort((a, b) => b.score - a.score);
  const rank = sortedGames.findIndex(g => g.id === currentGame.id) + 1;

  return { rank, total: sortedGames.length, difficulty };
};

/**
 * Gets blight statistics (min, max, current), normalized by player count.
 */
export const getBlightStats = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { min: number; max: number; current: number; percentage: number } | null => {
  if (allGames.length === 0) return null;

  // Normalize blight by player count
  const blightValues = allGames.map(g => g.blight / g.players.length);
  let min = Math.min(...blightValues);
  let max = Math.max(...blightValues);
  const current = currentGame.blight / currentGame.players.length;
  if (current < min) min = current
  if (current > max) max = current

  const percentage = max > min
    ? ((current - min) / (max - min)) * 100
    : 50;

  return { min, max, current, percentage };
};

/**
 * Gets dahan statistics (min, max, current), normalized by player count.
 */
export const getDahanStats = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { min: number; max: number; current: number; percentage: number } | null => {
  if (allGames.length === 0) return null;

  // Normalize dahan by player count
  const dahanValues = allGames.map(g => g.dahan / g.players.length);
  let min = Math.min(...dahanValues);
  let max = Math.max(...dahanValues);
  const current = currentGame.dahan / currentGame.players.length;
  if (current < min) min = current
  if (current > max) max = current

  const percentage = max > min
    ? ((current - min) / (max - min)) * 100
    : 50;

  return { min, max, current, percentage };
};

/**
 * Gets win/loss record against the same adversary at the same difficulty.
 * Includes the current game in the record.
 */
export const getSameAdversaryDifficultyRecord = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { wins: number; losses: number } | null => {
  if (!currentGame.adversary) return null;

  const matchingGames = allGames.filter(
    g => getTotalDifficulty(g) === getTotalDifficulty(currentGame)
  );

  if (matchingGames.length === 0) return null;

  // Include current game in the record
  const allMatchingGames = [...matchingGames, currentGame];
  const wins = allMatchingGames.filter(g => g.win).length;
  const losses = allMatchingGames.length - wins;

  return { wins, losses };
};

/**
 * Gets win/loss record against the same adversary (any difficulty).
 * Includes the current game in the record.
 */
export const getSameAdversaryRecord = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { wins: number; losses: number } | null => {
  if (!currentGame.adversary) return null;

  const matchingGames = [...allGames, currentGame].filter(
    g => g.adversary === currentGame.adversary
  );

  if (matchingGames.length === 0) return null;

  const wins = matchingGames.filter(g => g.win).length;
  const losses = matchingGames.length - wins;

  return { wins, losses };
};

/**
 * Gets win/loss record with the same spirit combination (order-agnostic).
 * Includes the current game in the record.
 */
export const getSameSpiritsRecord = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { wins: number; losses: number } | null => {
  const matchingGames = [...allGames, currentGame].filter(
    g => areSpiritsSame(g.spirits, currentGame.spirits)
  );

  if (matchingGames.length === 0) return null;

  const wins = matchingGames.filter(g => g.win).length;
  const losses = matchingGames.length - wins;

  return { wins, losses };
};

/**
 * Gets win/loss record with the same spirits vs the same adversary (any difficulty).
 * Includes the current game in the record.
 */
export const getSameSpiritsAndAdversaryRecord = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { wins: number; losses: number } | null => {
  if (!currentGame.adversary) return null;

  const matchingGames = [...allGames, currentGame].filter(
    g => g.adversary === currentGame.adversary &&
        areSpiritsSame(g.spirits, currentGame.spirits)
  );

  if (matchingGames.length === 0) return null;

  const wins = matchingGames.filter(g => g.win).length;
  const losses = matchingGames.length - wins;

  return { wins, losses };
};

/**
 * Gets score statistics for the same spirit combo at the same total difficulty.
 * Includes the current game in the statistics.
 * @returns High/low/average scores for the spirit combo
 */
export const getSpiritComboScoreStats = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { high: number; low: number; average: number } | null => {
  const difficulty = getTotalDifficulty(currentGame);

  const matchingGames = [...allGames, currentGame].filter(
    g => areSpiritsSame(g.spirits, currentGame.spirits) &&
        getTotalDifficulty(g) === difficulty
  );

  if (matchingGames.length === 0) return null;

  // Include current game in the statistics
  const scores = [...matchingGames.map(g => g.score)];
  const high = Math.max(...scores);
  const low = Math.min(...scores);
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

  return { high, low, average };
};

/**
 * Gets overall score range (min, max, current) across all games.
 */
export const getOverallScoreRange = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { min: number; max: number; current: number; percentage: number } | null => {
  if (allGames.length === 0) return null;

  const scores = allGames.map(g => g.score);
  let min = Math.min(...scores);
  let max = Math.max(...scores);
  const current = currentGame.score;

  if (current < min) min = current;
  if (current > max) max = current;

  const percentage = max > min
    ? ((current - min) / (max - min)) * 100
    : 50;

  return { min, max, current, percentage };
};

/**
 * Gets score range at the same total difficulty as the current game.
 */
export const getSameDifficultyScoreRange = (
  currentGame: GameWithScore,
  allGames: GameWithScore[]
): { min: number; max: number; current: number; percentage: number; difficulty: number } | null => {
  const difficulty = getTotalDifficulty(currentGame);
  const sameDifficultyGames = allGames.filter(
    g => getTotalDifficulty(g) === difficulty
  );

  if (sameDifficultyGames.length === 0) return null;

  const scores = sameDifficultyGames.map(g => g.score);
  let min = Math.min(...scores);
  let max = Math.max(...scores);
  const current = currentGame.score;

  if (current < min) min = current;
  if (current > max) max = current;

  const percentage = max > min
    ? ((current - min) / (max - min)) * 100
    : 50;

  return { min, max, current, percentage, difficulty };
};
