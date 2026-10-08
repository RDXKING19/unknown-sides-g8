import React from 'react';

export function StarRating({ stars = 0, max = 3, size = 'md' }) {
  const sizeMap = {
    sm: 'text-base gap-0.5',
    md: 'text-xl gap-1',
    lg: 'text-2xl gap-1.5'
  };

  return (
    <div className={`flex items-center justify-center ${sizeMap[size] || sizeMap.md}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`transition-all duration-300 ${
            i < stars ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]' : 'text-slate-600'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
