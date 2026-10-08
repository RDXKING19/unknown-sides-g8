import React from 'react';

export function BossBattleModal({ boss, _lives = 3, onStart, onClose }) {
  if (!boss) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-in-up">
      <div className="w-full max-w-lg bg-[#200b3b]/95 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Boss Emoji Avatar */}
        <div className="w-24 h-24 rounded-full bg-rose-950/80 border-2 border-rose-400 text-6xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse">
          {boss.emoji}
        </div>

        {/* Boss Name */}
        <div className="bg-rose-950/80 border border-rose-400/50 text-rose-300 text-xs font-bold px-4 py-1 rounded-full mb-2 tracking-wide uppercase">
          🚨 BOSS ON SITE
        </div>
        <h2 className="font-display font-900 text-3xl sm:text-4xl text-white mb-2">
          {boss.name}
        </h2>

        <p className="text-slate-200 text-sm sm:text-base mb-4 leading-relaxed font-extrabold">
          This boss has scrambled measurements across the site! Answer 5 questions with 3 lives to secure the site and earn the <span className="text-amber-300 font-bold font-display">"{boss.reward}"</span> badge!
        </p>

        {/* Lives indicator */}
        <div className="flex items-center gap-2 mb-6 bg-black/40 px-5 py-2 rounded-full border border-white/10">
          <span className="text-xs font-bold text-slate-300 uppercase mr-1">Safety Lives:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-2xl text-rose-400">
              ❤️
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 w-full justify-center">
          <button
            onClick={onClose}
            className="btn-secondary text-sm sm:text-base py-3 px-6 rounded-full"
          >
            Fall Back
          </button>
          <button
            onClick={onStart}
            className="btn-gold text-base sm:text-lg py-3 px-8 rounded-full shadow-[0_0_25px_rgba(250,204,21,0.6)] hover:scale-105 transition cursor-pointer"
          >
            Engage Boss! ⚔️
          </button>
        </div>
      </div>
    </div>
  );
}
