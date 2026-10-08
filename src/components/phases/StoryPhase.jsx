import React, { useState, useEffect, useRef } from 'react';
import { FloatingSymbols } from '../shared/FloatingSymbols.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import { storyNarration } from '../../utils/narration.js';
import { STORY_PANELS } from '../../data/storyContent.js';

export function StoryPhase({ muted, onDone, onSlideChange }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [imageError, setImageError] = useState(false);
  const slide = STORY_PANELS[slideIdx];

  const slideChangeRef = useRef(onSlideChange);
  slideChangeRef.current = onSlideChange;

  useEffect(() => {
    if (slideChangeRef.current) {
      slideChangeRef.current(slideIdx + 1, STORY_PANELS.length);
    }
    setImageError(false);
  }, [slideIdx]);

  useEffect(() => {
    if (!muted) narrate(storyNarration(slideIdx), true);
    return () => stopNarration();
  }, [slideIdx, muted]);

  const goNext = () => {
    if (slideIdx < STORY_PANELS.length - 1) {
      setSlideIdx(i => i + 1);
    } else {
      onDone();
    }
  };

  const goPrev = () => {
    if (slideIdx > 0) setSlideIdx(i => i - 1);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <FloatingSymbols />

      {/* Main Story Glass Card */}
      <div className="w-full max-w-5xl bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center fade-in-up z-20 my-auto overflow-y-auto max-h-[calc(100dvh-var(--header-h,64px)-5.5rem)]">
        {/* Left Column: Image Illustration or Fallback */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 h-48 sm:h-64 md:h-[360px] w-full bg-black/40 flex items-center justify-center shrink-0">
          {!imageError ? (
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover rounded-2xl md:rounded-3xl hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div
              style={{ backgroundColor: slide.imageBg }}
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            >
              <span className="text-6xl sm:text-7xl mb-3 drop-shadow-lg">{slide.imageEmoji}</span>
              <span className="font-display font-900 text-lg sm:text-xl text-amber-300">
                {slide.title}
              </span>
              <span className="text-xs sm:text-sm text-slate-300 mt-2">
                Job Illustration #{slide.panel}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Narrative Typography & Callouts */}
        <div className="flex flex-col items-start text-left justify-center gap-3 sm:gap-4 overflow-y-auto py-1">
          {/* Phase Badge */}
          <div className="bg-[#24104d] border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black px-3.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            Job Panel {slide.panel} of {STORY_PANELS.length}
          </div>

          {/* Slide Title */}
          <h2 className="font-display font-900 text-xl sm:text-2xl md:text-3xl text-amber-300 leading-snug drop-shadow-md shrink-0">
            {slide.title}
          </h2>

          {/* Body Narrative */}
          <p className="text-slate-100 text-sm sm:text-base md:text-lg leading-relaxed font-semibold drop-shadow-sm">
            {slide.text}
          </p>

          {/* Character Dialogue Callout */}
          <div className="flex items-center gap-3 w-full bg-[#1b0d3d]/90 border border-amber-400/50 rounded-2xl p-3 sm:p-3.5 shadow-md shrink-0 mt-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-400 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-sm">
              {slide.characterEmoji}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                {slide.character} says:
              </span>
              <p className="text-white font-display font-bold text-xs sm:text-sm leading-snug mt-0.5">
                "{slide.bubble}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Row: Back, Dots, Next */}
      <div className="w-full max-w-4xl flex items-center justify-between mt-3 z-20 shrink-0">
        <button
          onClick={goPrev}
          disabled={slideIdx === 0}
          className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/30 text-white font-display font-900 text-sm sm:text-base px-6 sm:px-8 py-2.5 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xl hover:scale-105 min-h-[44px]"
        >
          ← Back
        </button>

        {/* Slide Dots */}
        <div className="flex items-center gap-2">
          {STORY_PANELS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                i === slideIdx ? 'bg-amber-400 w-8' : 'bg-white/25 hover:bg-white/50 w-3'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="btn-gold font-display font-900 text-sm sm:text-base px-6 sm:px-8 py-2.5 rounded-full shadow-[0_0_25px_rgba(250,204,21,0.6)] hover:scale-105 transition cursor-pointer min-h-[44px]"
        >
          <span>
            {slideIdx === STORY_PANELS.length - 1 ? 'Enter the Site Lab' : 'Next Step'}
          </span>
          <span className="ml-1.5">→</span>
        </button>
      </div>
    </div>
  );
}
