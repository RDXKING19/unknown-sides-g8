import React, { useEffect } from 'react';
import { FloatingSymbols } from '../shared/FloatingSymbols.jsx';
import { TriangleVisual } from '../shared/TriangleVisual.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import { wonderNarration } from '../../utils/narration.js';

export function WonderPhase({ muted, onNext }) {
  useEffect(() => {
    if (!muted) narrate(wonderNarration(), true);
    return () => stopNarration();
  }, [muted]);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden select-none z-10">
      <FloatingSymbols />

      <div className="w-full max-w-xl glass-card overflow-hidden flex flex-col items-center text-center fade-in-up z-20 my-auto py-3 sm:py-4 px-4 sm:px-6">
        {/* Glowing Phase Band */}
        <div className="phase-band phase-band--wonder mb-1.5" />

        <div className="flex items-center gap-1.5 mb-1 shrink-0">
          <span className="text-2xl">🔍</span>
          <span className="text-purple-300 font-display font-800 text-xs sm:text-sm tracking-wider uppercase">
            Phase 1: Wonder & Curiosity
          </span>
        </div>

        <h2 className="text-main-heading text-purple-200 text-xl sm:text-2xl mb-1.5 max-w-lg shrink-0">
          The Ladder That Won't Tell
        </h2>

        {/* Feature Visual Box */}
        <div className="w-full bg-[#1e143c]/90 border border-purple-400/30 rounded-2xl p-2.5 sm:p-3 mb-2 flex flex-col items-center shadow-lg shrink-0">
          <div className="w-full max-w-xs h-28 sm:h-32 flex items-center justify-center mb-1">
            <TriangleVisual type="ladder" data={{ ladder: 5, foot: 3, height: '?', unknown: 'height' }} compact />
          </div>
          <div className="text-amber-300 font-display font-900 text-lg sm:text-xl mb-1">
            Ladder = 5 m · Foot = 3 m · Height = ?
          </div>
          <p className="text-slate-200 text-xs sm:text-sm max-w-md leading-relaxed font-semibold">
            Priya and Hafiz stand at the foot of an HDB wall with a 5 m ladder whose foot is 3 m from the wall. The top rests on an unreachable ledge. How can surveyors calculate the exact height without climbing?
          </p>
        </div>

        {/* Mascot Thinking Bubble */}
        <div className="flex items-center gap-2.5 bg-[#14082c]/80 border border-purple-500/30 rounded-full px-4 py-1.5 mb-2.5 shrink-0">
          <div className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-200 flex items-center justify-center font-bold text-xs shrink-0">
            🦉
          </div>
          <p className="text-slate-200 text-xs sm:text-sm font-bold text-left">
            "What if you could find a length you can't measure — just from two you can?"
          </p>
        </div>

        <button
          onClick={onNext}
          className="btn-gold text-sm sm:text-base font-900 py-2 sm:py-2.5 px-8 flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition shrink-0"
        >
          <span>Open the Job File</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
