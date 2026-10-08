/**
 * Scoring and XP formulas for SideQuest
 */

export function calcStars(correctCount) {
  if (correctCount >= 9) return 3;
  if (correctCount >= 7) return 2;
  if (correctCount >= 5) return 1;
  return 0;
}

export function calcXP({ attempts = 1, hintsUsed = 0, streak = 0 } = {}) {
  // Base 10, penalty for multiple attempts and hints, minimum base 2
  const attemptPenalty = Math.max(0, (attempts - 1) * 3);
  const hintPenalty = hintsUsed * 2;
  const baseXP = Math.max(2, 10 - attemptPenalty - hintPenalty);

  // Streak bonus: +2 for each streak step above 2, capped at +10
  const streakBonus = streak >= 3 ? Math.min(10, (streak - 2) * 2) : 0;

  return baseXP + streakBonus;
}
