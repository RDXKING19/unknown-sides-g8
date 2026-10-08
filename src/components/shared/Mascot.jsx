import React from 'react';

export function Mascot({ size = 'md', speech = '', expression = 'default' }) {
  const sizeMap = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-4xl'
  };

  const getEmoji = () => {
    switch (expression) {
      case 'thinking': return '🦉';
      case 'happy': return '🦉';
      case 'foreman': return '🦉';
      default: return '🦉';
    }
  };

  return (
    <div className="flex items-center gap-3 mascot-bubble">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-[0_0_18px_rgba(250,204,21,0.5)] shrink-0`}
        title="Foreman Tally"
      >
        <span>{getEmoji()}</span>
      </div>
      {speech && (
        <div className="bg-[#14082c]/95 border-2 border-amber-400/40 rounded-2xl px-5 py-2.5 text-slate-100 font-display font-extrabold text-sm sm:text-base shadow-xl flex-1 text-left leading-snug">
          {speech}
        </div>
      )}
    </div>
  );
}
