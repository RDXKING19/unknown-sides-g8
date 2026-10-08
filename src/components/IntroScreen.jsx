import React from 'react';
import { FloatingSymbols } from './shared/FloatingSymbols.jsx';

export function IntroScreen({ onBegin }) {
  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden select-none z-10">
      <FloatingSymbols />

      {/* Main Intro Content Card - Zero Scroll Fit */}
      <div className="relative w-full max-w-3xl flex flex-col items-center text-center fade-in-up z-20 my-auto py-2 px-3 sm:px-6">
        {/* Curriculum Pill Badge */}
        <div className="bg-[#1c0d38] border-2 border-amber-400/50 text-amber-300 text-xs font-900 px-4 py-0.5 rounded-full shadow-lg mb-1.5 tracking-wide shrink-0">
          ✨ Grade 8 · Pythagoras' Theorem
        </div>

        {/* Title */}
        <h1 className="font-display font-900 text-3xl sm:text-4xl md:text-5xl text-white text-center leading-tight tracking-tight mb-1.5 shrink-0">
          SideQuest
          <span className="text-[#facc15] font-900 block drop-shadow-[0_0_24px_rgba(250,204,21,0.65)]">
            Finding Unknown Sides
          </span>
        </h1>

        {/* Mascot Avatar & Speech Pill */}
        <div className="flex items-center gap-2 mb-1.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#facc15] p-0.5 shadow-[0_0_16px_rgba(250,204,21,0.7)] flex items-center justify-center text-sm sm:text-base shrink-0">
            🦉
          </div>
          <div className="bg-white rounded-full px-4 py-0.5 text-[#0c031d] font-display font-900 text-xs sm:text-sm shadow-md">
            Ready to find every unknown length? 📐
          </div>
        </div>

        {/* Subtitle text */}
        <p className="text-slate-200 text-xs sm:text-sm max-w-xl text-center leading-relaxed mb-2 font-bold drop-shadow-sm shrink-0">
          Join Priya, Hafiz, and Foreman Tally on the Skyline Survey Crew! Calculate unreachable heights, wheelchair ramps, stay-wires, and diagonals with Pythagoras' theorem across Singapore sites!
        </p>

        {/* YOUR LEARNING JOURNEY Flow Card */}
        <div className="w-full max-w-2xl bg-[#14082c]/95 border-2 border-purple-400/40 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md flex flex-col items-center mb-2 shrink-0">
          <p className="text-[#facc15] text-[11px] sm:text-xs font-display font-900 tracking-wider text-center mb-1.5 uppercase">
            YOUR SURVEYING JOURNEY
          </p>

          {/* Top Row: Wonder -> Story -> Simulate */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 w-full mb-1.5">
            {/* Wonder */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-purple-400 bg-purple-950/90 text-purple-200 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(192,132,252,0.6)] mb-0.5">
                🔍
              </div>
              <p className="font-display font-900 text-white text-xs leading-tight">Wonder</p>
              <p className="text-slate-300 text-[10px] font-semibold">The 5 m ladder</p>
            </div>
            <span className="text-amber-400 font-black text-xs mb-2">→</span>

            {/* Story */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-amber-400 bg-amber-950/90 text-amber-200 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(251,191,36,0.6)] mb-0.5">
                📖
              </div>
              <p className="font-display font-900 text-white text-xs leading-tight">Story</p>
              <p className="text-slate-300 text-[10px] font-semibold">4 Slide Briefing</p>
            </div>
            <span className="text-amber-400 font-black text-xs mb-2">→</span>

            {/* Simulate */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-teal-400 bg-teal-950/90 text-teal-200 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(45,212,191,0.6)] mb-0.5">
                🧪
              </div>
              <p className="font-display font-900 text-white text-xs leading-tight">Simulate</p>
              <p className="text-slate-300 text-[10px] font-semibold">3 Site Lab stations</p>
            </div>
          </div>

          {/* Bottom Row: Practice -> Reflect */}
          <div className="flex items-center justify-center gap-5 sm:gap-10 w-full">
            {/* Practice */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-400 bg-emerald-950/90 text-emerald-200 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(52,211,153,0.6)] mb-0.5">
                🎮
              </div>
              <p className="font-display font-900 text-white text-xs leading-tight">Practice</p>
              <p className="text-slate-300 text-[10px] font-semibold">10 Job worlds</p>
            </div>
            <span className="text-amber-400 font-black text-xs mb-2">→</span>

            {/* Reflect */}
            <div className="flex flex-col items-center text-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-400 bg-indigo-950/90 text-indigo-200 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(129,140,248,0.6)] mb-0.5">
                📝
              </div>
              <p className="font-display font-900 text-white text-xs leading-tight">Reflect</p>
              <p className="text-slate-300 text-[10px] font-semibold">Certification</p>
            </div>
          </div>
        </div>

        {/* Begin Button */}
        <button
          onClick={onBegin}
          className="btn-gold text-sm sm:text-base font-900 py-2.5 px-8 sm:px-10 mb-2 shadow-[0_0_24px_rgba(250,204,21,0.7)] hover:scale-105 transition cursor-pointer shrink-0"
        >
          🚀 Start the Job!
        </button>

        {/* 3 Bottom Feature Cards */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-2xl shrink-0">
          <div className="bg-[#14082c]/95 border-2 border-purple-400/35 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center w-full shadow-md">
            <span className="text-lg sm:text-xl mb-0.5">📐</span>
            <span className="font-display font-900 text-white text-xs sm:text-sm leading-tight">Pythagoras' Rule</span>
            <span className="text-slate-300 text-[10px] font-semibold leading-tight">a² + b² = c²</span>
          </div>

          <div className="bg-[#14082c]/95 border-2 border-purple-400/35 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center w-full shadow-md">
            <span className="text-lg sm:text-xl mb-0.5">🧪</span>
            <span className="font-display font-900 text-white text-xs sm:text-sm leading-tight">3 Site Stations</span>
            <span className="text-slate-300 text-[10px] font-semibold leading-tight">Tiles, ladders & reports</span>
          </div>

          <div className="bg-[#14082c]/95 border-2 border-purple-400/35 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center w-full shadow-md">
            <span className="text-lg sm:text-xl mb-0.5">🏆</span>
            <span className="font-display font-900 text-white text-xs sm:text-sm leading-tight">10 Game Worlds</span>
            <span className="text-slate-300 text-[10px] font-semibold leading-tight">Boss battles & 30★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
