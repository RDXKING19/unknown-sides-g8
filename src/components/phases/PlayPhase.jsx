import React, { useState, useEffect, useRef } from 'react';
import { FloatingSymbols } from '../shared/FloatingSymbols.jsx';
import { KingdomMap } from '../gamification/KingdomMap.jsx';
import { QuestionRenderer } from '../quiz/QuestionRenderer.jsx';
import { BossBattleModal } from '../quiz/BossBattleModal.jsx';
import { FeedbackOverlay } from '../shared/FeedbackOverlay.jsx';
import { BadgesModal } from '../gamification/BadgesModal.jsx';
import { DISTRICTS, generateSession } from '../../data/questionBank.js';
import { BADGES } from '../../utils/badgeEngine.js';
import { createRNG } from '../../utils/rng.js';
import { calcStars, calcXP } from '../../utils/scoring.js';
import { narrate, playClickSound } from '../../utils/audio.js';
import {
  playCorrectNarration,
  playWrongNarration,
  districtCompleteNarration,
  bossWinNarration
} from '../../utils/narration.js';

const MODES = [
  { id: 'guided', name: 'Guided Practice', icon: '🧭', questions: 5, hints: true, timed: false, lives: null },
  { id: 'independent', name: 'Independent Practice', icon: '📝', questions: 10, hints: false, timed: false, lives: null },
  { id: 'timed', name: 'Timed Challenge', icon: '⏱️', questions: 8, hints: false, timed: true, lives: null },
  { id: 'boss', name: 'Boss Battle', icon: '👑', questions: 5, hints: false, timed: false, lives: 3 }
];

export function PlayPhase({
  muted = false,
  _xp = 0,
  streak = 0,
  _bestStreak = 0,
  badges = [],
  badgeToast = [],
  worldResults = Array(10).fill(null),
  onUpdateScore,
  onClearFeedback,
  onGoReflect
}) {
  const [selectedMode, setSelectedMode] = useState('independent');
  const [activeWorld, setActiveWorld] = useState(null); // null = map, number = quiz
  const [bossIntroFor, setBossIntroFor] = useState(null); // Explicit state machine fix for Boss Battle (TRD §5.5)
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctInSession, setCorrectInSession] = useState(0);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const timerRef = useRef(null);
  const correctInSessionRef = useRef(0);
  correctInSessionRef.current = correctInSession;

  const totalStars = worldResults.reduce((a, b) => a + (b || 0), 0);
  const allWorldsCompleted = worldResults.every(r => r != null && r > 0);

  // Timer for Timed Challenge Mode
  useEffect(() => {
    if (activeWorld !== null && selectedMode === 'timed' && timeLeft > 0 && !feedback) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            finishQuizSession(correctInSessionRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeWorld, selectedMode, timeLeft, feedback]);

  const startWorldSession = (worldIdx, modeId = selectedMode) => {
    const cfg = MODES.find(m => m.id === modeId) || MODES[1];
    const sessionRNG = createRNG(Date.now() + Math.floor(Math.random() * 100000));
    setQuestions(generateSession(worldIdx, cfg.questions, sessionRNG));
    setQIdx(0);
    setSelectedOption(null);
    setFeedback(null);
    setHintLevel(0);
    setCorrectInSession(0);
    setTimeLeft(60);
    setLives(cfg.lives || 3);

    if (modeId === 'boss') {
      setBossIntroFor(worldIdx); // Explicit state machine: quiz stays hidden until player engages
    } else {
      setActiveWorld(worldIdx);
    }
  };

  const handleOptionSelect = option => {
    playClickSound();
    if (selectedOption !== null || feedback !== null) return;
    setSelectedOption(option);

    const q = questions[qIdx];
    const isCorrect = option === q.correctAnswer;

    if (isCorrect) {
      const nextCorrect = correctInSession + 1;
      setCorrectInSession(nextCorrect);
      const earnedXP = calcXP({ attempts: 1, hintsUsed: hintLevel, streak: streak + 1 });

      if (!muted) narrate(playCorrectNarration(nextCorrect), true);

      // Score evaluated through reducer
      if (onUpdateScore) {
        onUpdateScore({ isCorrect: true, xpDelta: earnedXP });
      }

      setFeedback({
        status: 'correct',
        title: 'Length Found! 📏',
        explanation: q.explanation,
        xpGained: earnedXP
      });
    } else {
      let remainingLives = lives;
      if (selectedMode === 'boss') {
        remainingLives = lives - 1;
        setLives(remainingLives);
      }

      if (!muted) narrate(playWrongNarration(qIdx), true);

      if (onUpdateScore) {
        onUpdateScore({ isCorrect: false });
      }

      setFeedback({
        status: 'wrong',
        title: remainingLives <= 0 && selectedMode === 'boss' ? 'Out of Safety Lives!' : 'Check the Working! 🔧',
        explanation: q.explanation,
        xpGained: 0
      });
    }
  };

  const finishQuizSession = correctCount => {
    const starsEarned = calcStars(correctCount);
    const district = DISTRICTS[activeWorld];
    const bossWon = selectedMode === 'boss' && lives > 0;

    if (bossWon) {
      if (!muted) narrate(bossWinNarration(district.boss.name), true);
    } else if (starsEarned >= 1) {
      if (!muted) narrate(districtCompleteNarration(district.name), true);
    }

    if (onUpdateScore) {
      onUpdateScore({
        worldIdx: activeWorld,
        stars: starsEarned,
        bossWon
      });
    }

    setActiveWorld(null);
  };

  const handleNextStep = () => {
    setFeedback(null);
    setSelectedOption(null);
    setHintLevel(0);
    if (onClearFeedback) onClearFeedback();

    // If boss mode and out of lives -> fail and exit to map
    if (selectedMode === 'boss' && lives <= 0) {
      setActiveWorld(null);
      return;
    }

    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1);
    } else {
      finishQuizSession(correctInSession);
    }
  };

  const currentQ = questions[qIdx];

  // Badge notification for newly earned badge
  const activeBadgeToast = badgeToast && badgeToast.length > 0 ? BADGES[badgeToast[0]] : null;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <FloatingSymbols />

      {/* Main Glass Card Frame */}
      <div className="w-full max-w-6xl card-fit glass-card flex flex-col items-center text-center fade-in-up z-20 my-auto py-4 sm:py-5 px-4 sm:px-8 overflow-hidden">
        {/* Phase Band */}
        <div className="phase-band phase-band--play mb-2 shrink-0" />

        {/* ---------------- VIEW 1: MAP VIEW ---------------- */}
        {activeWorld === null && bossIntroFor === null && (
          <div className="w-full flex flex-col items-center flex-1 min-h-0 overflow-hidden">
            {/* Header & Stats Bar */}
            <div className="w-full flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl sm:text-4xl">🎮</span>
                <div className="text-left">
                  <h2 className="text-section-heading text-emerald-200 text-xl sm:text-2xl font-900">
                    Surveyor Practice Sites
                  </h2>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                    10 MOE Pythagoras Sites · Tap Any Site to Practice Its Topic
                  </span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowBadgesModal(true)}
                  className="bg-[#14082c]/90 border border-purple-400/40 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 shadow-md cursor-pointer hover:border-amber-400 transition min-h-[44px]"
                >
                  <span className="text-base">🎖️</span>
                  <span className="font-display font-900 text-white text-xs sm:text-sm">
                    {badges.length} Badges
                  </span>
                </button>

                <div className="bg-[#14082c]/90 border border-emerald-400/40 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 shadow-md min-h-[44px]">
                  <span className="text-amber-400 text-base">⭐</span>
                  <span className="font-display font-900 text-white text-xs sm:text-sm">
                    {totalStars} / 30
                  </span>
                </div>

                {allWorldsCompleted && (
                  <button
                    onClick={onGoReflect}
                    className="btn-gold font-display font-900 text-xs sm:text-sm py-1.5 px-4 shadow-lg min-h-[44px]"
                  >
                    Site Debrief →
                  </button>
                )}
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-3 shrink-0">
              {MODES.map(m => {
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedMode(m.id);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition cursor-pointer min-h-[48px] ${
                      isSelected
                        ? 'border-emerald-400 bg-[#162e24] text-white shadow-[0_0_16px_rgba(52,211,153,0.4)] scale-[1.01]'
                        : 'border-white/10 bg-[#14082c]/80 text-slate-300 hover:border-emerald-400/50'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div className="text-left">
                      <p className="font-display font-900 text-xs sm:text-sm leading-tight">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-300 font-bold">
                        {m.questions} Qs {m.timed ? '· 60s' : ''} {m.lives ? '· 3 ❤️' : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* World Grid Map */}
            <KingdomMap
              worldResults={worldResults}
              onSelectWorld={idx => startWorldSession(idx, selectedMode)}
              totalStars={totalStars}
              onGoReflect={onGoReflect}
              allCompleted={allWorldsCompleted}
            />
          </div>
        )}

        {/* ---------------- VIEW 2: QUIZ SESSION VIEW ---------------- */}
        {activeWorld !== null && (
          <div className="w-full flex flex-col items-center flex-1 min-h-0 overflow-y-auto">
            {/* Session Top Status Bar */}
            <div className="w-full flex items-center justify-between border-b border-white/15 pb-2 mb-2 shrink-0">
              {/* Back to map button */}
              <button
                onClick={() => setActiveWorld(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-display text-xs sm:text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>←</span>
                <span>Job Sites</span>
              </button>

              {/* World Name Pill */}
              <div className="flex items-center gap-2">
                <span className="text-xl">{DISTRICTS[activeWorld]?.icon}</span>
                <span className="font-display font-900 text-sm sm:text-base text-white">
                  {DISTRICTS[activeWorld]?.name}
                </span>
                <span className="text-xs bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                  Q {qIdx + 1} / {questions.length}
                </span>
              </div>

              {/* Mode Specific Status Indicator */}
              <div className="flex items-center gap-3">
                {selectedMode === 'boss' && (
                  <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-rose-500/40">
                    <span className="text-xs font-bold text-rose-300 mr-1">Lives:</span>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className={`text-base ${i < lives ? 'text-rose-400' : 'text-slate-600'}`}>
                        ❤️
                      </span>
                    ))}
                  </div>
                )}

                {selectedMode === 'timed' && (
                  <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-amber-500/40">
                    <span className="text-xs font-bold text-amber-300">⏱️ {timeLeft}s</span>
                  </div>
                )}

                <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/40">
                  <span className="text-xs font-bold text-emerald-300">🔥 {streak} Streak</span>
                </div>
              </div>
            </div>

            {/* Question Renderer */}
            <QuestionRenderer
              question={currentQ}
              selectedOption={selectedOption}
              onSelectOption={handleOptionSelect}
              showHints={selectedMode === 'guided'}
              hintLevel={hintLevel}
              onUseHint={() => setHintLevel(l => Math.min(2, l + 1))}
              disabled={selectedOption !== null}
            />
          </div>
        )}
      </div>

      {/* Boss Battle Intro Modal (Explicit state machine fix TRD §5.5) */}
      {bossIntroFor !== null && (
        <BossBattleModal
          boss={DISTRICTS[bossIntroFor]?.boss}
          lives={3}
          onStart={() => {
            setActiveWorld(bossIntroFor);
            setBossIntroFor(null);
          }}
          onClose={() => setBossIntroFor(null)}
        />
      )}

      {/* Answer Feedback Overlay */}
      {feedback && (
        <FeedbackOverlay
          status={feedback.status}
          title={feedback.title}
          explanation={feedback.explanation}
          xpGained={feedback.xpGained}
          badge={activeBadgeToast}
          onNext={handleNextStep}
          nextLabel={qIdx < questions.length - 1 ? 'Next Question →' : 'Finish Job Site ✓'}
        />
      )}

      {/* Badges Modal */}
      {showBadgesModal && (
        <BadgesModal
          unlockedBadges={badges}
          onClose={() => setShowBadgesModal(false)}
        />
      )}
    </div>
  );
}
