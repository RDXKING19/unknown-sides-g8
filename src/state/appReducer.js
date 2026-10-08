// App reducer for SideQuest — single source of truth for scoring AND badges (fixes reference defect: badges starved of state)
import { checkBadges } from '../utils/badgeEngine.js';

export const STATION_COUNT = 3;
export const WORLD_COUNT = 10;
export const INITIAL_STATE = {
  phase: 'intro',
  storyPanel: 0,
  simStation: 0,
  simCompleted: Array(STATION_COUNT).fill(false),
  worldResults: Array(WORLD_COUNT).fill(null),
  xp: 0,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  bossesDefeated: 0,
  badges: [],
  badgeToast: [],
  audioEnabled: true,
  journeyComplete: false,
};

/** Evaluate every trigger against the FULL next state; append newly earned badges and queue a toast. */
const withBadges = next => {
  const fresh = checkBadges(next).map(b => b.id);
  return fresh.length
    ? { ...next, badges: [...next.badges, ...fresh], badgeToast: [...next.badgeToast, ...fresh] }
    : next;
};

export function appReducer(state, action, panelCount = 4) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'NEXT_STORY_PANEL':
      return state.storyPanel >= panelCount - 1
        ? { ...state, phase: 'simulate', storyPanel: 0 }
        : { ...state, storyPanel: state.storyPanel + 1 };

    case 'PREV_STORY_PANEL':
      return { ...state, storyPanel: Math.max(0, state.storyPanel - 1) };

    case 'ADVANCE_SIM_STATION':
      return { ...state, simStation: Math.min(STATION_COUNT - 1, state.simStation + 1) };

    case 'PREV_SIM_STATION':
      return { ...state, simStation: Math.max(0, state.simStation - 1) };

    case 'COMPLETE_SIM_STATION': {
      const idx = action.payload ?? state.simStation;
      const simCompleted = [...state.simCompleted];
      simCompleted[idx] = true;
      return withBadges({ ...state, simCompleted });
    }

    case 'ANSWER_CORRECT': {
      const streak = state.streak + 1;
      return withBadges({
        ...state,
        xp: state.xp + (action.payload?.xpDelta ?? 10),
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        totalCorrect: state.totalCorrect + 1,
        totalAnswered: state.totalAnswered + 1
      });
    }

    case 'ANSWER_INCORRECT':
      return withBadges({
        ...state,
        streak: 0,
        totalAnswered: state.totalAnswered + 1
      });

    case 'UPDATE_WORLD_RESULT': {
      const { worldIdx, stars, bossWon } = action.payload;
      const worldResults = [...state.worldResults];
      worldResults[worldIdx] = Math.max(worldResults[worldIdx] ?? 0, stars ?? 0);
      return withBadges({
        ...state,
        worldResults,
        bossesDefeated: state.bossesDefeated + (bossWon ? 1 : 0)
      });
    }

    case 'CLEAR_FEEDBACK':
      return { ...state, badgeToast: [] };

    case 'COMPLETE_PHASE':
      if (action.payload === 'practice') return { ...state, phase: 'reflect' };
      if (action.payload === 'reflect') return withBadges({ ...state, journeyComplete: true });
      return state;

    case 'RESET_SESSION':
      return { ...INITIAL_STATE, audioEnabled: state.audioEnabled };

    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled };

    default:
      return state;
  }
}

export function isWorldUnlocked(worldResults, idx) {
  if (idx === 0) return true;
  return worldResults[idx - 1] != null && worldResults[idx - 1] > 0;
}
