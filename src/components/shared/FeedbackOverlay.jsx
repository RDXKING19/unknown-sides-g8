import React from 'react';

export function FeedbackOverlay({
  status = 'correct', // 'correct' | 'wrong' | 'badge'
  title = '',
  explanation = '',
  xpGained = 0,
  badge = null,
  onNext,
  nextLabel = 'Next Job →'
}) {
  const isCorrect = status === 'correct';
  const isBadge = status === 'badge';

  const tone = isBadge
    ? 'border-amber-400 bg-[#25184a]/95 text-amber-200'
    : isCorrect
    ? 'border-emerald-400 bg-[#122828]/95 text-emerald-200'
    : 'border-rose-400 bg-[#2b1022]/95 text-rose-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in-up">
      <div className={`w-full max-w-lg border-2 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center ${tone}`}>
        {/* Top Icon */}
        <div className="text-5xl sm:text-6xl mb-2">
          {isBadge ? '🎖️' : isCorrect ? '🎉' : '💡'}
        </div>

        {/* Title */}
        <h3 className="font-display font-900 text-2xl sm:text-3xl text-white mb-2">
          {title || (isBadge ? 'Badge Unlocked!' : isCorrect ? 'Length Found! 📏' : 'Check the Working! 🔧')}
        </h3>

        {/* Badge Info */}
        {badge && (
          <div className="w-full bg-amber-950/70 border border-amber-400/50 rounded-2xl p-4 mb-3 flex items-center gap-3">
            <span className="text-4xl">{badge.icon}</span>
            <div className="text-left">
              <h4 className="font-display font-900 text-lg sm:text-xl text-amber-300">{badge.name}</h4>
              <p className="text-sm text-slate-200 font-extrabold">{badge.description}</p>
            </div>
          </div>
        )}

        {/* XP Banner */}
        {isCorrect && xpGained > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/50 px-5 py-2 rounded-full text-amber-300 font-black text-base mb-3">
            <span>✨</span>
            <span>+{xpGained} XP Earned</span>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 mb-5 text-left">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              Surveyor Explanation:
            </p>
            <p className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={onNext}
          className="btn-gold font-display font-900 text-lg sm:text-xl px-10 py-3.5 rounded-full shadow-lg hover:scale-105 transition cursor-pointer"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
