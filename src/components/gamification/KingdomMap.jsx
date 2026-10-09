import React from 'react';
import { WORLDS } from '../../config/worlds.config.js';
import { StarRating } from './StarRating.jsx';

export function KingdomMap({
  worldResults = Array(10).fill(null),
  onSelectWorld,
  _totalStars = 0,
  _onGoReflect,
  _allCompleted = false
}) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 10 Worlds Grid (Responsive 2 cols mobile, 5 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 w-full p-1 overflow-y-auto map-fit">
        {WORLDS.map((w, idx) => {
          const stars = worldResults[idx] || 0;
          const hasPlayed = worldResults[idx] != null;

          return (
            <div
              key={w.id}
              onClick={() => onSelectWorld(idx)}
              style={{
                borderColor: `${w.accent}80`
              }}
              className="p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all duration-300 min-h-[125px] sm:min-h-[140px] bg-[#14082c]/95 hover:scale-105 cursor-pointer shadow-xl"
            >
              <div className="w-full flex items-center justify-between text-xs font-black text-slate-300">
                <span className="bg-white/10 px-2 py-0.5 rounded-md">W{idx + 1}</span>
                <span style={{ color: w.accent }} className="font-bold">
                  {hasPlayed ? `${stars}★` : 'OPEN'}
                </span>
              </div>

              <span className="text-3xl sm:text-4xl my-0.5 drop-shadow-md">
                {w.emoji}
              </span>

              <div className="w-full">
                <span className="font-display font-900 text-white text-xs sm:text-sm leading-tight line-clamp-1 block">
                  {w.name}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-300 block line-clamp-1 mt-0.5">
                  {w.boss.name}
                </span>
              </div>

              {/* Star Rating Indicator */}
              <div className="mt-1">
                {hasPlayed ? (
                  <StarRating stars={stars} size="sm" />
                ) : (
                  <span className="text-emerald-400 text-xs font-900">Survey Site →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
