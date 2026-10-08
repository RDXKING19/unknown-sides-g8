import React, { useReducer, useState, useEffect } from 'react';
import { setMuted, playClickSound } from './utils/audio.js';
import { appReducer, INITIAL_STATE } from './state/appReducer.js';
import { TopNav } from './components/TopNav.jsx';
import { IntroScreen } from './components/IntroScreen.jsx';
import { WonderPhase } from './components/phases/WonderPhase.jsx';
import { StoryPhase } from './components/phases/StoryPhase.jsx';
import { SimulatePhase } from './components/phases/SimulatePhase.jsx';
import { PlayPhase } from './components/phases/PlayPhase.jsx';
import { ReflectPhase, CelebrationScreen } from './components/phases/ReflectPhase.jsx';
import { STORY_PANELS } from './data/storyContent.js';

export function App() {
  const [state, dispatch] = useReducer(
    (s, a) => appReducer(s, a, STORY_PANELS.length),
    INITIAL_STATE
  );
  const [storySlideInfo, setStorySlideInfo] = useState(null);

  // Sync mute state cleanly in an effect (prevents reducer impurity double-firing in StrictMode)
  useEffect(() => {
    setMuted(!state.audioEnabled);
  }, [state.audioEnabled]);

  const completed = {
    wonder: state.phase !== 'intro' && state.phase !== 'wonder',
    story: !['intro', 'wonder', 'story'].includes(state.phase),
    simulate: !['intro', 'wonder', 'story', 'simulate'].includes(state.phase),
    practice: state.worldResults.some(r => r != null && r > 0),
    reflect: state.journeyComplete
  };

  const hasProgress =
    state.xp > 0 || state.worldResults.some(r => r != null && r > 0) || state.badges.length > 0;

  // Global click audio effect: plays crisp tactile pop on interactive elements
  useEffect(() => {
    const handleGlobalClick = e => {
      const target = e.target.closest(
        'button, [role="button"], [role="option"], [role="radio"], [role="checkbox"], input[type="radio"], input[type="checkbox"], input[type="range"], select, option, .cursor-pointer, svg .cursor-pointer'
      );
      if (target) {
        playClickSound();
      }
    };
    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_AUDIO' });
  };

  const goPhase = key => {
    if (key !== 'story') setStorySlideInfo(null);
    dispatch({ type: 'SET_PHASE', payload: key });
  };

  const handleUpdateScore = payload => {
    if (payload.isCorrect !== undefined) {
      if (payload.isCorrect) {
        dispatch({ type: 'ANSWER_CORRECT', payload });
      } else {
        dispatch({ type: 'ANSWER_INCORRECT', payload });
      }
    }
    if (payload.worldIdx !== undefined) {
      dispatch({ type: 'UPDATE_WORLD_RESULT', payload });
    }
  };

  return (
    <div className="app-container w-full h-full">
      {/* Top Navbar (Hidden on Intro Phase) */}
      {state.phase !== 'intro' && (
        <TopNav
          phase={state.phase}
          completed={completed}
          muted={!state.audioEnabled}
          onToggleMute={toggleMute}
          onHome={() => dispatch({ type: 'RESET_SESSION' })}
          onGoPhase={goPhase}
          slideInfo={state.phase === 'story' ? storySlideInfo : null}
          hasProgress={hasProgress}
        />
      )}

      {/* Main Viewport Content Area */}
      <main
        className={`flex-1 min-h-0 flex flex-col relative overflow-hidden ${
          state.phase !== 'intro' ? 'app-main' : ''
        }`}
      >
        {state.phase === 'intro' && (
          <IntroScreen onBegin={() => dispatch({ type: 'SET_PHASE', payload: 'wonder' })} />
        )}

        {state.phase === 'wonder' && (
          <WonderPhase
            muted={!state.audioEnabled}
            onNext={() => dispatch({ type: 'SET_PHASE', payload: 'story' })}
          />
        )}

        {state.phase === 'story' && (
          <StoryPhase
            muted={!state.audioEnabled}
            onSlideChange={(current, total) => setStorySlideInfo({ current, total })}
            onDone={() => {
              setStorySlideInfo(null);
              dispatch({ type: 'SET_PHASE', payload: 'simulate' });
            }}
          />
        )}

        {state.phase === 'simulate' && (
          <SimulatePhase
            muted={!state.audioEnabled}
            simCompleted={state.simCompleted}
            onCompleteStation={idx => dispatch({ type: 'COMPLETE_SIM_STATION', payload: idx })}
            onNext={() => dispatch({ type: 'SET_PHASE', payload: 'practice' })}
          />
        )}

        {state.phase === 'practice' && !state.journeyComplete && (
          <PlayPhase
            muted={!state.audioEnabled}
            xp={state.xp}
            streak={state.streak}
            bestStreak={state.bestStreak}
            badges={state.badges}
            badgeToast={state.badgeToast}
            worldResults={state.worldResults}
            onUpdateScore={handleUpdateScore}
            onClearFeedback={() => dispatch({ type: 'CLEAR_FEEDBACK' })}
            onGoReflect={() => dispatch({ type: 'SET_PHASE', payload: 'reflect' })}
          />
        )}

        {state.phase === 'reflect' && !state.journeyComplete && (
          <ReflectPhase
            xp={state.xp}
            stars={state.worldResults.reduce((a, b) => a + (b || 0), 0)}
            bestStreak={state.bestStreak}
            badges={state.badges}
            worldResults={state.worldResults}
            muted={!state.audioEnabled}
            onComplete={() => dispatch({ type: 'COMPLETE_PHASE', payload: 'reflect' })}
          />
        )}

        {state.journeyComplete && (
          <CelebrationScreen
            xp={state.xp}
            stars={state.worldResults.reduce((a, b) => a + (b || 0), 0)}
            bestStreak={state.bestStreak}
            muted={!state.audioEnabled}
            onRestart={() => dispatch({ type: 'RESET_SESSION' })}
          />
        )}
      </main>
    </div>
  );
}

export default App;
