import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FloatingSymbols } from '../shared/FloatingSymbols.jsx';
import { narrate, stopNarration, playClickSound } from '../../utils/audio.js';
import { reflectNarration, reflectCompleteNarration } from '../../utils/narration.js';
import { WORLDS } from '../../config/worlds.config.js';

export const RECAP_QUESTIONS = [
  {
    id: 'r1',
    q: 'In a right-angled triangle, which side is the hypotenuse?',
    options: [
      'The side opposite the right angle',
      'The side at the bottom',
      'The shortest side',
      'Any slanted side'
    ],
    correct: 'The side opposite the right angle',
    explanation: 'The hypotenuse always sits directly opposite the 90° right angle and is strictly the longest side.'
  },
  {
    id: 'r2',
    q: 'A right-angled triangle has hypotenuse 10 cm and one leg 6 cm. Which working finds the other leg?',
    options: [
      '√(10² − 6²)',
      '√(10² + 6²)',
      '10 − 6',
      '10² − 6²'
    ],
    correct: '√(10² − 6²)',
    explanation: 'To find a shorter side (a leg), subtract the squares and take the square root: leg = √(hypotenuse² − other leg²).'
  },
  {
    id: 'r3',
    q: 'Hafiz finds the hypotenuse of a triangle with legs 8 cm and 15 cm and writes 8² + 15² = 289 cm. What did he forget?',
    options: [
      'To take the square root of 289',
      'To subtract instead of add',
      'To square the 15',
      'Nothing — 289 cm is correct'
    ],
    correct: 'To take the square root of 289',
    explanation: '8² + 15² = 289 gives c², the square on the hypotenuse. He must take the square root: c = √289 = 17 cm.'
  }
];

export function ReflectPhase({
  xp = 0,
  stars = 0,
  bestStreak = 0,
  _badges = [],
  worldResults = Array(10).fill(null),
  muted = false,
  onComplete
}) {
  const [recapIdx, setRecapIdx] = useState(0);
  const [recapAnswers, setRecapAnswers] = useState({});
  const [recapCompleted, setRecapCompleted] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [recapFeedback, setRecapFeedback] = useState(null);

  const minLength = 10;
  const currentRecapQ = RECAP_QUESTIONS[recapIdx];

  useEffect(() => {
    if (!muted) narrate(reflectNarration(), true);
    return () => stopNarration();
  }, [muted]);

  const handleRecapSelect = opt => {
    playClickSound();
    const isCorrect = opt === currentRecapQ.correct;
    setRecapAnswers(prev => ({ ...prev, [currentRecapQ.id]: opt }));

    if (isCorrect) {
      setRecapFeedback({ status: 'correct', text: currentRecapQ.explanation });
    } else {
      setRecapFeedback({ status: 'wrong', text: `Review the rule: ${currentRecapQ.explanation}` });
    }
  };

  const handleNextRecap = () => {
    setRecapFeedback(null);
    if (recapIdx < RECAP_QUESTIONS.length - 1) {
      setRecapIdx(i => i + 1);
    } else {
      setRecapCompleted(true);
    }
  };

  const handleSubmit = () => {
    if (!muted) narrate(reflectCompleteNarration(), true);
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {
      // Ignore
    }
    onComplete();
  };

  const charCount = reflectionText.trim().length;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <FloatingSymbols />

      <div className="w-full max-w-4xl card-fit reflect-card bg-[#160b38]/95 border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-y-auto">
        {/* Accent Bar */}
        <div className="w-24 h-2 bg-purple-400 rounded-full mb-2.5 shadow-[0_0_18px_rgba(168,85,247,0.85)] shrink-0" />

        {/* Header */}
        <h2 className="font-display font-900 text-2xl sm:text-3xl text-white mb-3.5 flex items-center gap-2.5 shrink-0">
          <span className="text-3xl sm:text-4xl">🏆</span>
          <span>Surveyor Debrief & Certification</span>
        </h2>

        {/* ---------------- PART 1: 3-QUESTION CONCEPTUAL RECAP ---------------- */}
        {!recapCompleted && (
          <div className="w-full bg-[#1e1044]/95 border-2 border-purple-400/40 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3.5 mb-4 shrink-0 fade-in-up">
            <div className="w-full flex items-center justify-between">
              <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                📝 Conceptual Debrief Quiz (Question {recapIdx + 1} of 3)
              </span>
              <span className="text-sm text-slate-300 font-bold">
                Targets: Hypotenuse & Add vs. Subtract
              </span>
            </div>

            <p className="font-display font-900 text-lg sm:text-xl text-white text-center leading-snug">
              {currentRecapQ.q}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {currentRecapQ.options.map((opt, i) => {
                const isSelected = recapAnswers[currentRecapQ.id] === opt;
                const isCorrect = opt === currentRecapQ.correct;
                const showResult = isSelected && recapFeedback;

                return (
                  <button
                    key={i}
                    onClick={() => handleRecapSelect(opt)}
                    className={`p-3.5 rounded-xl border-2 font-display text-sm sm:text-base text-left transition cursor-pointer min-h-[44px] ${
                      showResult
                        ? isCorrect
                          ? 'border-emerald-400 bg-emerald-950/80 text-white'
                          : 'border-rose-400 bg-rose-950/80 text-white'
                        : isSelected
                        ? 'border-amber-400 bg-[#32175c] text-white'
                        : 'border-white/15 bg-white/5 text-slate-200 hover:border-cyan-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {recapFeedback && (
              <div className="w-full flex items-center justify-between mt-1 gap-2 flex-wrap">
                <span className={`text-sm font-extrabold flex-1 ${recapFeedback.status === 'correct' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {recapFeedback.text}
                </span>
                <button
                  onClick={handleNextRecap}
                  className="btn-gold text-sm font-900 py-2 px-6 rounded-full shrink-0 min-h-[44px]"
                >
                  {recapIdx < RECAP_QUESTIONS.length - 1 ? 'Next Question →' : 'View Final Scorecard ✓'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------------- PART 2: SCORECARD & REFLECTION ---------------- */}
        {recapCompleted && (
          <div className="w-full flex flex-col items-center fade-in-up">
            {/* Top 3 Score Cards */}
            <div className="grid grid-cols-3 gap-3 w-full mb-3.5 shrink-0">
              <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center shadow-lg">
                <span className="text-2xl mb-0.5">✨</span>
                <span className="font-display font-900 text-2xl sm:text-3xl text-amber-400">{xp}</span>
                <span className="text-xs sm:text-sm font-900 text-slate-200">Total XP</span>
              </div>

              <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center shadow-lg">
                <span className="text-2xl mb-0.5">⭐</span>
                <span className="font-display font-900 text-2xl sm:text-3xl text-amber-400">{stars} / 30</span>
                <span className="text-xs sm:text-sm font-900 text-slate-200">Stars</span>
              </div>

              <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center shadow-lg">
                <span className="text-2xl mb-0.5">🔥</span>
                <span className="font-display font-900 text-2xl sm:text-3xl text-amber-400">{bestStreak}</span>
                <span className="text-xs sm:text-sm font-900 text-slate-200">Best Streak</span>
              </div>
            </div>

            {/* World Results Strip */}
            <div className="w-full flex flex-col items-center mb-3 shrink-0">
              <span className="text-xs font-900 text-amber-400 tracking-wider uppercase mb-1.5">
                SITE SURVEY RESULTS
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 w-full">
                {WORLDS.map((w, idx) => {
                  const res = worldResults[idx];
                  return (
                    <div
                      key={w.id}
                      className="bg-[#1a0e42]/80 border border-purple-400/30 rounded-xl p-1.5 flex flex-col items-center justify-between text-center min-h-[50px] shadow-sm"
                    >
                      <span className="text-[11px] font-black text-slate-300">W{idx + 1}</span>
                      <span className="text-xs font-900 text-amber-400 mt-0.5">
                        {res != null && res > 0 ? `${res}★` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reflection Textarea to Foreman Tally */}
            <div className="w-full flex items-start gap-3.5 mb-4 shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#1e0e4a] border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg shrink-0 mt-1">
                🦉
              </div>

              <div className="flex-1 flex flex-col text-left">
                <h3 className="font-display font-900 text-base sm:text-lg text-white mb-1.5 leading-tight">
                  Explain the hypotenuse rule to Foreman Tally:
                </h3>

                <div className="w-full bg-[#0e0626] border-2 border-purple-400/40 rounded-2xl p-3 flex flex-col relative shadow-inner">
                  <textarea
                    rows="3"
                    value={reflectionText}
                    onChange={e => setReflectionText(e.target.value)}
                    placeholder="Dear Foreman Tally, the hypotenuse is always... because..."
                    className="w-full bg-transparent text-base sm:text-lg font-extrabold text-white placeholder-slate-400 outline-none resize-none font-sans"
                  />
                  <div className="text-xs sm:text-sm font-black text-slate-300 text-right mt-1">
                    {charCount} / {minLength} min characters
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Lesson Button */}
            <button
              disabled={charCount < minLength}
              onClick={handleSubmit}
              className="btn-gold font-display font-900 text-base sm:text-lg px-8 py-3 rounded-full shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 min-h-[44px]"
            >
              Complete Survey Mission! 🎖️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CelebrationScreen({ xp, stars, _bestStreak, _muted, onRestart }) {
  useEffect(() => {
    try {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden select-none z-20 bg-[#0c0424]">
      <FloatingSymbols />

      <div className="w-full max-w-md glass-card flex flex-col items-center text-center fade-in-up z-30 my-auto py-6 px-6">
        <span className="text-6xl mb-2 animate-bounce">🎖️🦉</span>

        <div className="bg-[#1c0d38] border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1 rounded-full mb-2">
          Singapore MOE Grade 8 Pythagoras Mastered!
        </div>

        <h1 className="font-display font-900 text-2xl sm:text-3xl text-white mb-2">
          Chief Site Surveyor!
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed font-extrabold">
          Congratulations! You have mastered finding unknown sides, Pythagorean triples, and composite figures with Pythagoras' theorem across all 10 job sites!
        </p>

        {/* Scoreboard summary */}
        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          <div className="bg-[#1e1342] border border-purple-400/30 rounded-2xl p-2.5 text-center">
            <span className="text-xs text-slate-400 font-bold block">TOTAL XP</span>
            <span className="font-display font-900 text-2xl text-amber-300">{xp}</span>
          </div>
          <div className="bg-[#1e1342] border border-purple-400/30 rounded-2xl p-2.5 text-center">
            <span className="text-xs text-slate-400 font-bold block">TOTAL STARS</span>
            <span className="font-display font-900 text-2xl text-amber-300">{stars} / 30</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="btn-gold font-display font-900 text-base py-3 px-8 rounded-full shadow-xl hover:scale-105 transition cursor-pointer min-h-[44px]"
        >
          Survey Again 🚀
        </button>
      </div>
    </div>
  );
}
