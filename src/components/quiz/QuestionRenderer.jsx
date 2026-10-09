import React from 'react';
import { TriangleVisual } from '../shared/TriangleVisual.jsx';
import { playClickSound } from '../../utils/audio.js';

export function QuestionRenderer({
  question,
  selectedOption = null,
  onSelectOption,
  showHints = false,
  hintLevel = 0,
  onUseHint,
  disabled = false
}) {
  if (!question) return null;

  return (
    <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 max-w-3xl sm:max-w-4xl my-auto">
      {/* Concept Tag Pill */}
      <div className="inline-flex items-center gap-1.5 bg-[#2a1752] border border-purple-400/40 px-3 py-0.5 rounded-full text-purple-200 text-xs font-bold uppercase tracking-wider shrink-0">
        <span>📐</span>
        <span>{question.category ? question.category.replace(/-/g, ' ') : 'Pythagoras Investigation'}</span>
      </div>

      {/* Main Question Text */}
      <h3 className="font-display font-900 text-base sm:text-lg md:text-xl text-white text-center leading-snug max-w-3xl shrink-0 px-2">
        {question.questionText}
      </h3>

      {/* Visual Diagram - Enlarged and Centered for Clear Readability */}
      <div className={`w-full max-w-2xl sm:max-w-3xl ${hintLevel > 0 ? 'h-28 sm:h-32 md:h-36 max-h-[18dvh]' : 'h-36 sm:h-40 md:h-44 max-h-[24dvh]'} bg-[#120726]/95 border-2 border-purple-400/40 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 flex items-center justify-center shadow-2xl relative overflow-hidden shrink-0 transition-all duration-200`}>
        <TriangleVisual type={question.visual} data={question.visualData} />
      </div>

      {/* Hint Banner (if active in Guided Mode) */}
      {hintLevel > 0 && (
        <div className="w-full max-w-2xl bg-amber-950/70 border border-amber-400/60 rounded-xl p-2 sm:p-2.5 text-left fade-in-up shrink-0">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase mb-0.5">
            <span>💡</span>
            <span>Foreman Tally's Clue #{hintLevel}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 font-extrabold leading-snug">
            {hintLevel === 1 ? question.hint1 : question.hint2}
          </p>
        </div>
      )}

      {/* 4 Options Grid (min-h-[46px], text-sm sm:text-base) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-2xl sm:max-w-3xl shrink-0">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => {
                playClickSound();
                onSelectOption(opt);
              }}
              className={`min-h-[46px] sm:min-h-[48px] py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border-2 font-display font-900 text-sm sm:text-base flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-amber-400 bg-[#351b68] text-white shadow-[0_0_18px_rgba(250,204,21,0.5)] scale-[1.01]'
                  : 'border-white/15 bg-[#170b33]/90 text-slate-100 hover:border-amber-400/50 hover:bg-[#201042]'
              } disabled:cursor-not-allowed`}
            >
              <span className="flex-1 font-bold text-sm sm:text-base">{opt}</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-200 ml-2 shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint Trigger Button (for Guided mode) */}
      {showHints && hintLevel < 2 && (
        <button
          onClick={onUseHint}
          disabled={disabled}
          className="text-xs sm:text-sm text-amber-300 hover:text-amber-200 font-extrabold flex items-center gap-1 underline cursor-pointer mt-0.5 shrink-0 min-h-[36px]"
        >
          <span>💡 Need a hint? ({2 - hintLevel} remaining)</span>
        </button>
      )}
    </div>
  );
}
