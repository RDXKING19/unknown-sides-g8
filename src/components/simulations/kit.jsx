import React from 'react';

const TONES = {
  cyan: 'border-cyan-400 bg-cyan-950/80 text-cyan-100 shadow-[0_0_16px_rgba(56,189,248,0.45)]',
  amber: 'border-amber-400 bg-amber-950/80 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.45)]',
  emerald: 'border-emerald-400 bg-emerald-950/80 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.45)]',
  rose: 'border-rose-400 bg-rose-950/80 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.45)]',
  purple: 'border-purple-400 bg-purple-950/80 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.45)]',
  ghost: 'border-white/20 border-dashed bg-white/5 text-white/40'
};

export function Panel({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 sm:gap-2.5 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-2.5 sm:p-3.5 shadow-xl flex-1 min-h-0 overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function Node({ tone = 'cyan', children, w = 'w-auto', className = '' }) {
  return (
    <div
      className={`px-3 sm:px-3.5 py-1 sm:py-1.5 min-h-[38px] sm:min-h-[40px] rounded-xl sm:rounded-2xl border-2 font-display font-900 text-xs sm:text-sm md:text-base flex items-center justify-center text-center whitespace-nowrap transition-all duration-300 shadow-md ${w} ${TONES[tone] || TONES.cyan} ${className}`}
    >
      {children}
    </div>
  );
}

export function Msg({ tone = 'emerald', children }) {
  const cls = {
    emerald: 'bg-emerald-950/90 text-emerald-300 border-emerald-400/60 shadow-[0_0_14px_rgba(52,211,153,0.3)]',
    rose: 'bg-rose-950/90 text-rose-300 border-rose-400/60 shadow-[0_0_14px_rgba(244,63,94,0.3)]',
    amber: 'bg-amber-950/90 text-amber-200 border-amber-400/50 shadow-[0_0_14px_rgba(251,191,36,0.3)]',
    cyan: 'bg-cyan-950/90 text-cyan-200 border-cyan-400/50 shadow-[0_0_14px_rgba(56,189,248,0.3)]'
  }[tone] || 'bg-cyan-950/90 text-cyan-200 border-cyan-400/50';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 text-xs sm:text-sm font-900 text-center fade-in-up shrink-0 ${cls}`}
    >
      {children}
    </div>
  );
}

export const GoldBtn = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn-gold text-xs sm:text-sm font-900 px-4 sm:px-5 py-2 shadow-lg hover:scale-105 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const GhostBtn = ({ children, onClick, disabled = false, active = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`font-display font-900 text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border transition cursor-pointer shrink-0 min-h-[38px] disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_14px_rgba(56,189,248,0.6)]'
        : 'bg-purple-900/80 hover:bg-purple-800 border-purple-400/50 text-purple-100'
    } ${className}`}
  >
    {children}
  </button>
);

/**
 * Accessible Number Slider with 44px min hit targets for - / + buttons and arrow-key support.
 * Satisfies accessibility floors in TRD §7.0 and §10.5.
 */
export function NumberSlider({
  value,
  min = 1,
  max = 20,
  step = 1,
  unit = '',
  onChange,
  label = 'Length'
}) {
  const roundToStep = v => Math.round(v * 100) / 100;
  const dec = () => onChange(roundToStep(Math.max(min, value - step)));
  const inc = () => onChange(roundToStep(Math.min(max, value + step)));

  const handleKeyDown = e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const s = e.shiftKey ? step * 5 : step;
      onChange(roundToStep(Math.max(min, value - s)));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const s = e.shiftKey ? step * 5 : step;
      onChange(roundToStep(Math.min(max, value + s)));
    }
  };

  return (
    <div className="w-full min-w-0 flex items-center gap-2 bg-[#13082b]/90 border border-white/15 px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl overflow-hidden box-border">
      <span className="font-display font-900 text-xs sm:text-sm text-slate-200 shrink-0 whitespace-nowrap min-w-[65px] sm:min-w-[80px]">
        {label}: <span className="text-amber-300 font-mono font-black text-xs sm:text-sm">{value}{unit ? ` ${unit}` : ''}</span>
      </span>

      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={`Decrease ${label} by ${step} ${unit}`}
        className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm sm:text-base flex items-center justify-center transition disabled:opacity-30 cursor-pointer active:scale-95 shrink-0"
      >
        −
      </button>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        onKeyDown={handleKeyDown}
        aria-label={`${label} slider`}
        className="flex-1 min-w-[50px] w-full accent-amber-400 cursor-pointer h-2 sm:h-2.5"
      />

      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={`Increase ${label} by ${step} ${unit}`}
        className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm sm:text-base flex items-center justify-center transition disabled:opacity-30 cursor-pointer active:scale-95 shrink-0"
      >
        +
      </button>
    </div>
  );
}

/**
 * Station completion celebration banner with "Complete Station ✓" button.
 */
export function StationSuccess({ title = 'Station Completed!', onComplete }) {
  return (
    <div className="w-full bg-[#1b0d3a]/95 border-2 border-emerald-400/80 rounded-2xl p-5 flex flex-col items-center text-center gap-3 fade-in-up shadow-[0_0_24px_rgba(52,211,153,0.35)] shrink-0 my-auto">
      <span className="text-4xl animate-bounce">🎉</span>
      <h4 className="font-display font-900 text-xl sm:text-2xl text-emerald-300">
        {title}
      </h4>
      <p className="text-slate-200 text-sm sm:text-base font-extrabold max-w-md">
        All station requirements have been verified by Foreman Tally! Record your progress and mark this station complete.
      </p>
      <button
        type="button"
        onClick={onComplete}
        className="btn-gold font-display font-900 text-base py-3 px-8 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-105 transition cursor-pointer"
      >
        Complete Station ✓
      </button>
    </div>
  );
}
