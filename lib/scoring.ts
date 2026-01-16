interface ScoreParams {
  win: boolean;
  adversaryDifficulty: number | null;
  scenarioDifficulty: number | null;
  invaderCards: number;
  dahan: number;
  blight: number;
  playerCount: number;
}

export const calculateScore = ({
  win,
  adversaryDifficulty,
  scenarioDifficulty,
  invaderCards,
  dahan,
  blight,
  playerCount,
}: ScoreParams): number => {
  const adversaryDiff = adversaryDifficulty ?? 0;
  const scenarioDiff = scenarioDifficulty ?? 0;
  const totalDifficulty = adversaryDiff + scenarioDiff;

  if (win) {
    // Victory Score: (5 × (adversaryDifficulty + scenarioDifficulty)) + 10 + (2 × invaderCards) + (dahan / players) - (blight / players)
    return (
      5 * totalDifficulty +
      10 +
      2 * invaderCards +
      Math.floor(dahan / playerCount) -
      Math.floor(blight / playerCount)
    );
  } else {
    // Defeat Score: (2 × (adversaryDifficulty + scenarioDifficulty)) + invaderCards + (dahan / players) - (blight / players)
    return (
      2 * totalDifficulty +
      invaderCards +
      Math.floor(dahan / playerCount) -
      Math.floor(blight / playerCount)
    );
  }
};
