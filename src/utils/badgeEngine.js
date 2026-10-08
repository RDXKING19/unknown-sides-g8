export const BADGES = {
  first_correct: {
    id: 'first_correct',
    name: 'First Side Solved ✅',
    description: 'Answered your first side question correctly!',
    icon: '✅'
  },
  streak_5: {
    id: 'streak_5',
    name: 'Square Streak 🔥',
    description: '5 correct answers in a row!',
    icon: '🔥'
  },
  streak_10: {
    id: 'streak_10',
    name: 'Master Measurer Streak 🏅',
    description: '10 correct answers in a row!',
    icon: '🏅'
  },
  sim_all: {
    id: 'sim_all',
    name: 'Fully Rigged Crew 🧰',
    description: 'Completed all 3 stations in the Site Lab!',
    icon: '🧰'
  },
  world_3star: {
    id: 'world_3star',
    name: 'Triple-Star Site ⭐⭐⭐',
    description: 'Earned 3 stars in any world!',
    icon: '⭐⭐⭐'
  },
  boss_won: {
    id: 'boss_won',
    name: 'Boss Beam Broken 🏗️',
    description: 'Defeated a boss in a Boss Battle!',
    icon: '🏗️'
  },
  answered_20: {
    id: 'answered_20',
    name: 'Tireless Tape Measure 📏',
    description: 'Answered 20 or more questions in Practice!',
    icon: '📏'
  },
  journey_complete: {
    id: 'journey_complete',
    name: 'Chief Site Surveyor 🎖️',
    description: 'Completed the full 5-phase Survey Crew journey!',
    icon: '🎖️'
  }
};

/**
 * Evaluates current state and returns an array of newly unlocked badge objects.
 */
export function checkBadges(state) {
  const currentBadges = new Set(state.badges || []);
  const newlyUnlocked = [];

  const trigger = (badgeId) => {
    if (!currentBadges.has(badgeId) && BADGES[badgeId]) {
      newlyUnlocked.push(BADGES[badgeId]);
      currentBadges.add(badgeId);
    }
  };

  // 1. First correct
  if ((state.totalCorrect || 0) >= 1) trigger('first_correct');

  // 2. Streaks
  if ((state.streak || 0) >= 5 || (state.bestStreak || 0) >= 5) trigger('streak_5');
  if ((state.streak || 0) >= 10 || (state.bestStreak || 0) >= 10) trigger('streak_10');

  // 3. All 3 Simulate stations complete
  if (Array.isArray(state.simCompleted) && state.simCompleted.length >= 3 && state.simCompleted.every(Boolean)) {
    trigger('sim_all');
  }

  // 4. Any world 3 stars
  if (Array.isArray(state.worldResults) && state.worldResults.some(r => r === 3)) {
    trigger('world_3star');
  }

  // 5. Boss won
  if (state.bossesDefeated && state.bossesDefeated > 0) {
    trigger('boss_won');
  }

  // 6. Answered 20+
  if ((state.totalAnswered || 0) >= 20) {
    trigger('answered_20');
  }

  // 7. Journey complete
  if (state.journeyComplete) {
    trigger('journey_complete');
  }

  return newlyUnlocked;
}
