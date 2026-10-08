import test from 'node:test';
import assert from 'node:assert/strict';
import { appReducer, INITIAL_STATE, isWorldUnlocked } from '../src/state/appReducer.js';

test('appReducer - Initial State', () => {
  assert.equal(INITIAL_STATE.phase, 'intro');
  assert.equal(INITIAL_STATE.storyPanel, 0);
  assert.equal(INITIAL_STATE.simStation, 0);
  assert.equal(INITIAL_STATE.simCompleted.length, 3);
  assert.ok(INITIAL_STATE.simCompleted.every(x => x === false));
  assert.equal(INITIAL_STATE.xp, 0);
  assert.equal(INITIAL_STATE.streak, 0);
  assert.equal(INITIAL_STATE.badges.length, 0);
  assert.equal(INITIAL_STATE.journeyComplete, false);
});

test('appReducer - Story Panel Navigation and Bounds', () => {
  let state = INITIAL_STATE;
  const panelCount = 4;

  // Step through all 4 panels (0 to 3)
  for (let i = 0; i < 3; i++) {
    state = appReducer(state, { type: 'NEXT_STORY_PANEL' }, panelCount);
    assert.equal(state.storyPanel, i + 1);
  }

  // 4th next should transition phase to simulate and reset panel to 0
  state = appReducer(state, { type: 'NEXT_STORY_PANEL' }, panelCount);
  assert.equal(state.phase, 'simulate');
  assert.equal(state.storyPanel, 0);

  // Test PREV_STORY_PANEL bound
  state = { ...INITIAL_STATE, storyPanel: 0 };
  state = appReducer(state, { type: 'PREV_STORY_PANEL' }, panelCount);
  assert.equal(state.storyPanel, 0);
});

test('appReducer - Streak Tracking and Reset', () => {
  let state = INITIAL_STATE;

  // 4 correct answers
  for (let i = 0; i < 4; i++) {
    state = appReducer(state, { type: 'ANSWER_CORRECT', payload: { xpDelta: 10 } });
    assert.equal(state.streak, i + 1);
    assert.equal(state.bestStreak, i + 1);
  }

  // 1 incorrect answer resets streak to 0, bestStreak remains 4
  state = appReducer(state, { type: 'ANSWER_INCORRECT' });
  assert.equal(state.streak, 0);
  assert.equal(state.bestStreak, 4);
  assert.equal(state.totalAnswered, 5);
  assert.equal(state.totalCorrect, 4);
});

test('appReducer - Full Journey Unlocking All 8 Badges', () => {
  let state = INITIAL_STATE;

  // 1. first_correct badge
  state = appReducer(state, { type: 'ANSWER_CORRECT', payload: { xpDelta: 10 } });
  assert.ok(state.badges.includes('first_correct'));

  // 2. streak_5 badge (reach streak 5)
  for (let i = 1; i < 5; i++) {
    state = appReducer(state, { type: 'ANSWER_CORRECT', payload: { xpDelta: 10 } });
  }
  assert.equal(state.streak, 5);
  assert.ok(state.badges.includes('streak_5'));

  // 3. streak_10 badge (reach streak 10)
  for (let i = 5; i < 10; i++) {
    state = appReducer(state, { type: 'ANSWER_CORRECT', payload: { xpDelta: 10 } });
  }
  assert.equal(state.streak, 10);
  assert.ok(state.badges.includes('streak_10'));

  // 4. sim_all badge (complete stations 0, 1, 2)
  for (let s = 0; s < 3; s++) {
    state = appReducer(state, { type: 'COMPLETE_SIM_STATION', payload: s });
  }
  assert.ok(state.badges.includes('sim_all'));

  // 5. world_3star badge
  state = appReducer(state, {
    type: 'UPDATE_WORLD_RESULT',
    payload: { worldIdx: 0, stars: 3, bossWon: false }
  });
  assert.ok(state.badges.includes('world_3star'));

  // 6. boss_won badge
  state = appReducer(state, {
    type: 'UPDATE_WORLD_RESULT',
    payload: { worldIdx: 0, stars: 3, bossWon: true }
  });
  assert.ok(state.badges.includes('boss_won'));

  // 7. answered_20 badge (reach 20 answered)
  while (state.totalAnswered < 20) {
    state = appReducer(state, { type: 'ANSWER_CORRECT', payload: { xpDelta: 10 } });
  }
  assert.ok(state.badges.includes('answered_20'));

  // 8. journey_complete badge
  state = appReducer(state, { type: 'COMPLETE_PHASE', payload: 'reflect' });
  assert.ok(state.badges.includes('journey_complete'));
  assert.equal(state.journeyComplete, true);

  // Assert all 8 badges are earned, with zero duplicates
  assert.equal(state.badges.length, 8);
  assert.equal(new Set(state.badges).size, 8);
});

test('appReducer - Feedback Clearing and Audio Toggles', () => {
  let state = { ...INITIAL_STATE, badgeToast: ['first_correct', 'streak_5'] };
  state = appReducer(state, { type: 'CLEAR_FEEDBACK' });
  assert.equal(state.badgeToast.length, 0);

  state = appReducer(state, { type: 'TOGGLE_AUDIO' });
  assert.equal(state.audioEnabled, false);

  state = appReducer(state, { type: 'RESET_SESSION' });
  assert.equal(state.audioEnabled, false, 'RESET_SESSION must preserve user audio toggle setting');
  assert.equal(state.xp, 0);
});

test('appReducer - isWorldUnlocked progression logic', () => {
  const worldResults = Array(10).fill(null);
  assert.ok(isWorldUnlocked(worldResults, 0), 'World 0 is always unlocked');
  assert.ok(!isWorldUnlocked(worldResults, 1), 'World 1 is locked when World 0 is null');

  worldResults[0] = 2; // World 0 completed with 2 stars
  assert.ok(isWorldUnlocked(worldResults, 1), 'World 1 is unlocked when World 0 has stars > 0');
  assert.ok(!isWorldUnlocked(worldResults, 2), 'World 2 remains locked');
});
