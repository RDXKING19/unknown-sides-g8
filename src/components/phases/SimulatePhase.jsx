import React, { useState, useEffect } from 'react';
import { FloatingSymbols } from '../shared/FloatingSymbols.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import { simStationIntro } from '../../utils/narration.js';
import { SquareSecretLab } from '../simulations/SquareSecretLab.jsx';
import { LadderLockIn } from '../simulations/LadderLockIn.jsx';
import { SiteReportDetective } from '../simulations/SiteReportDetective.jsx';

export const STATIONS = [
  {
    id: 0,
    archetype: 'discovery',
    icon: '🟦',
    name: 'Station A: The Square Secret Lab',
    sub: 'Squares on the sides prove the rule',
    Comp: SquareSecretLab
  },
  {
    id: 1,
    archetype: 'build-to-target',
    icon: '🪜',
    name: 'Station B: Ladder Lock-In',
    sub: 'Place the ladder to reach the ledge',
    Comp: LadderLockIn
  },
  {
    id: 2,
    archetype: 'error-detective',
    icon: '🏗️',
    name: "Station C: Real-World Site Rig",
    sub: 'Engineer ramps, stay-wires & transit lines',
    Comp: SiteReportDetective
  }
];

export function SimulatePhase({
  muted = false,
  onNext,
  simCompleted = [false, false, false],
  onCompleteStation
}) {
  const [stationIdx, setStationIdx] = useState(0);

  const currentStation = STATIONS[stationIdx];
  const CurrentComp = currentStation.Comp;

  const allStationsComplete = simCompleted.slice(0, 3).every(Boolean);

  useEffect(() => {
    if (!muted) narrate(simStationIntro(stationIdx), true);
    return () => stopNarration();
  }, [stationIdx, muted]);

  const handleStationFinished = () => {
    if (onCompleteStation) {
      onCompleteStation(stationIdx);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <FloatingSymbols />

      {/* Main Simulation Stations Card */}
      <div className="w-full max-w-6xl sim-card card-fit bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Cyan Accent Bar */}
        <div className="sim-accent w-24 h-2 bg-cyan-400 rounded-full mb-2 shadow-[0_0_18px_rgba(56,189,248,0.85)] shrink-0" />

        {/* Card Header Title */}
        <h2 className="sim-title font-display font-900 text-xl sm:text-2xl text-white flex items-center gap-2.5 mb-3 shrink-0">
          <span className="text-2xl sm:text-3xl">🧪</span>
          <span>Surveyor Site Lab — 3 Investigation Stations</span>
        </h2>

        {/* Mobile Horizontal Chip Strip (< 768 px) */}
        <div className="flex md:hidden gap-2 overflow-x-auto w-full pb-2 mb-2 snap-x shrink-0">
          {STATIONS.map((st, i) => {
            const isSelected = stationIdx === i;
            const isDone = simCompleted[i];

            return (
              <button
                key={st.id}
                onClick={() => setStationIdx(i)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border-2 flex items-center gap-2 shrink-0 snap-start transition cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-[#1e2852] text-white shadow-md'
                    : 'border-white/10 bg-[#13082b]/80 text-slate-300'
                }`}
              >
                <span>{st.icon}</span>
                <span className="font-display font-900 text-sm whitespace-nowrap">
                  Station {String.fromCharCode(65 + i)}
                </span>
                <span>{isDone ? '✅' : '🔓'}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Grid for >= 768 px */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 w-full items-stretch flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Station Sidebar Tabs */}
          <div className="hidden md:flex md:col-span-5 lg:col-span-4 flex-col justify-between gap-2.5 shrink-0">
            <div className="flex flex-col gap-2.5">
              {STATIONS.map((st, i) => {
                const isSelected = stationIdx === i;
                const isDone = simCompleted[i];

                return (
                  <button
                    key={st.id}
                    onClick={() => setStationIdx(i)}
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-[#1e2852] text-white shadow-[0_0_22px_rgba(56,189,248,0.4)] scale-[1.01]'
                        : 'border-purple-500/25 bg-[#13082b]/80 text-slate-300 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                          isSelected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-white'
                        }`}
                      >
                        {st.icon}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-display font-900 text-xs sm:text-sm md:text-base leading-snug break-words">
                          {st.name}
                        </p>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-0.5 leading-tight">
                          {st.sub}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base shrink-0 px-2 py-1 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                      {isDone ? '✅' : '🔓'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Left CTA Button (Gated on all 3 stations being complete) */}
            <div className="flex flex-col gap-1.5 mt-2">
              <button
                onClick={onNext}
                disabled={!allStationsComplete}
                className="btn-gold font-display font-900 text-sm sm:text-base py-3.5 px-6 shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                <span>Go to Practice Phase!</span>
                <span>→</span>
              </button>
              {!allStationsComplete && (
                <span className="text-xs text-amber-300 font-extrabold text-center">
                  Complete all 3 stations to unlock Practice Phase ({simCompleted.slice(0, 3).filter(Boolean).length}/3 complete)
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Station Workspace */}
          <div className="sim-right col-span-1 md:col-span-8 bg-[#13092e]/95 border-2 border-purple-400/35 rounded-3xl p-3 sm:p-5 flex flex-col justify-between shadow-inner flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 justify-between">
              {/* Header Row */}
              <div className="sim-head flex items-center justify-between border-b border-white/15 pb-2.5 mb-2.5 shrink-0">
                <h3 className="font-display font-900 text-base sm:text-lg text-cyan-300 flex items-center gap-2.5">
                  <span className="text-xl sm:text-2xl">{currentStation.icon}</span>
                  <span className="line-clamp-1">{currentStation.name}</span>
                </h3>
                <span className="font-display font-900 text-xs text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  Station {stationIdx + 1} of 3
                </span>
              </div>

              {/* Interactive Station Component */}
              <div className="sim-body flex-1 min-h-0 flex flex-col overflow-y-auto">
                <CurrentComp
                  key={stationIdx}
                  onComplete={handleStationFinished}
                  audioEnabled={!muted}
                />
              </div>

              {/* Mobile CTA Button below workspace */}
              <div className="flex md:hidden flex-col gap-1.5 mt-2 pt-2 border-t border-white/10">
                <button
                  onClick={onNext}
                  disabled={!allStationsComplete}
                  className="btn-gold font-display font-900 text-sm py-3 px-6 shadow-md w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                >
                  <span>Go to Practice Phase →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
