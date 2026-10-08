import React, { useState } from 'react';
import { Panel, Msg, GoldBtn, GhostBtn, NumberSlider, StationSuccess } from './kit.jsx';
import { useStationNarration } from '../../hooks/useStationNarration.js';

export function BlueprintBuilder({ onComplete, audioEnabled = true }) {
  const { narrateEvent } = useStationNarration(2, audioEnabled);

  // Active build: 0 = Roof truss (Subtract), 1 = Chain quad (Add)
  const [activeBuild, setActiveBuild] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [buildDone, setBuildDone] = useState([false, false]);
  const [sliderVal, setSliderVal] = useState(5);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // Build 1 data: Rafter 13, Base 10, Half-base 5, Height 12
  // Build 2 data: AB=6, BC=8 -> AC=10; CD=24 -> AD=26

  const handleStepChoice = (isCorrect, explanation) => {
    if (isCorrect) {
      setFeedback({ status: 'correct', text: explanation });
      narrateEvent('step_correct');
      setStepIdx(prev => prev + 1);
    } else {
      setFeedback({ status: 'wrong', text: 'Check the geometric relationship and try again.' });
    }
  };

  const handleSliderSubmit = targetVal => {
    if (sliderVal === targetVal) {
      setFeedback({ status: 'correct', text: `Spot on! Correct length = ${targetVal} m.` });
      narrateEvent('step_correct');
      const nextDone = [...buildDone];
      nextDone[activeBuild] = true;
      setBuildDone(nextDone);

      if (nextDone.every(Boolean)) {
        setIsFinished(true);
        narrateEvent('station_complete');
      }
    } else {
      setFeedback({
        status: 'wrong',
        text: sliderVal < targetVal ? 'Length is too small! Recheck the calculation.' : 'Length is too large!'
      });
    }
  };

  const switchBuild = idx => {
    setActiveBuild(idx);
    setStepIdx(0);
    setSliderVal(idx === 0 ? 8 : 15);
    setFeedback(null);
  };

  if (isFinished) {
    return (
      <Panel>
        <StationSuccess
          title="Station C: Blueprint Builder Solved!"
          onComplete={onComplete}
        />
      </Panel>
    );
  }

  return (
    <Panel>
      {/* Build Switcher */}
      <div className="w-full flex items-center justify-between border-b border-white/15 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <GhostBtn active={activeBuild === 0} onClick={() => switchBuild(0)}>
            Build 1: Isosceles Roof Truss {buildDone[0] ? '✅' : ''}
          </GhostBtn>
          <GhostBtn active={activeBuild === 1} onClick={() => switchBuild(1)}>
            Build 2: Two-Triangle Chain {buildDone[1] ? '✅' : ''}
          </GhostBtn>
        </div>
        <span className="text-xs font-bold text-cyan-300">
          Archetype: Composite Construction
        </span>
      </div>

      {/* ---------------- BUILD 1: ROOF TRUSS (ISOSCELES) ---------------- */}
      {activeBuild === 0 && (
        <div className="w-full flex flex-col items-center gap-3 flex-1 min-h-0">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {['Drop Post', 'Identify Sides', 'Choose Rule', 'Calculate Height'].map((s, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  i < stepIdx || buildDone[0]
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-400/50'
                    : i === stepIdx
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {i + 1}. {s}
              </span>
            ))}
          </div>

          {/* SVG Diagram */}
          <div className="w-full max-w-lg h-48 bg-[#0f0724]/90 border-2 border-purple-400/30 rounded-2xl flex items-center justify-center relative shadow-inner shrink-0">
            <svg viewBox="0 0 320 180" className="w-full h-full select-none">
              {/* Roof Truss Outline */}
              <polygon points="60,140 260,140 160,40" fill="rgba(56,189,248,0.06)" stroke="#c084fc" strokeWidth="3" />
              {/* Dropped centre post if step >= 1 */}
              {stepIdx >= 1 && (
                <>
                  <line x1="160" y1="140" x2="160" y2="40" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5,3" />
                  <path d="M 160 128 L 148 128 L 148 140" fill="none" stroke="#facc15" strokeWidth="2" />
                  <text x="168" y="95" fill="#38bdf8" fontSize="12" fontWeight="bold">h = {stepIdx >= 3 ? '12 m' : '?'}</text>
                  <text x="110" y="156" fill="#fb923c" fontSize="11" fontWeight="bold">half = 5 m</text>
                </>
              )}
              {/* Labels */}
              <text x="100" y="80" fill="#c084fc" fontSize="12" fontWeight="bold">13 m</text>
              <text x="220" y="80" fill="#c084fc" fontSize="12" fontWeight="bold">13 m</text>
              <text x="160" y="156" fill="#fb923c" fontSize="11" fontWeight="bold" textAnchor="middle">
                {stepIdx >= 1 ? '' : 'Span = 10 m'}
              </text>
            </svg>
          </div>

          {/* Step Machine UI */}
          {!buildDone[0] ? (
            <div className="w-full max-w-md flex flex-col items-center gap-2.5">
              {stepIdx === 0 && (
                <GoldBtn onClick={() => handleStepChoice(true, 'Vertical post dropped! The 10 m base is halved into two 5 m segments.')}>
                  ⬇️ Drop Centre Post & Split Base
                </GoldBtn>
              )}

              {stepIdx === 1 && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-sm font-bold text-slate-200 text-center">
                    In the right triangle, what is the role of the 13 m rafter and 5 m half-base?
                  </span>
                  <GhostBtn onClick={() => handleStepChoice(true, 'Correct! 13 m is opposite the right angle (hypotenuse), 5 m is a leg.')}>
                    13 m is the hypotenuse, 5 m is a known leg ✓
                  </GhostBtn>
                  <GhostBtn onClick={() => handleStepChoice(false)}>
                    5 m is the hypotenuse, 13 m is a leg
                  </GhostBtn>
                </div>
              )}

              {stepIdx === 2 && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-sm font-bold text-slate-200 text-center">
                    To find the unknown height (a shorter leg), which calculation do we use?
                  </span>
                  <GhostBtn onClick={() => handleStepChoice(true, 'Correct! Subtract the squares: 13² − 5² = 169 − 25 = 144.')}>
                    Subtract the squares: 13² − 5² ✓
                  </GhostBtn>
                  <GhostBtn onClick={() => handleStepChoice(false)}>
                    Add the squares: 13² + 5²
                  </GhostBtn>
                </div>
              )}

              {stepIdx === 3 && (
                <div className="flex flex-col items-center gap-2.5 w-full">
                  <NumberSlider
                    label="Vertical Height"
                    value={sliderVal}
                    min={1}
                    max={25}
                    step={1}
                    unit="m"
                    onChange={setSliderVal}
                  />
                  <GoldBtn onClick={() => handleSliderSubmit(12)}>
                    Confirm Height ✓
                  </GoldBtn>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-sm">Build 1 Complete! Height = 12 m.</span>
              <GoldBtn onClick={() => switchBuild(1)}>
                Proceed to Build 2: Chain Quad →
              </GoldBtn>
            </div>
          )}

          {feedback && (
            <Msg tone={feedback.status === 'correct' ? 'emerald' : 'rose'}>
              {feedback.text}
            </Msg>
          )}
        </div>
      )}

      {/* ---------------- BUILD 2: TWO-TRIANGLE CHAIN ---------------- */}
      {activeBuild === 1 && (
        <div className="w-full flex flex-col items-center gap-3 flex-1 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            {['Solve Diagonal AC', 'Inspect Triangle ACD', 'Calculate Final AD'].map((s, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  i < stepIdx || buildDone[1]
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-400/50'
                    : i === stepIdx
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {i + 1}. {s}
              </span>
            ))}
          </div>

          {/* SVG Quad Diagram */}
          <div className="w-full max-w-lg h-48 bg-[#0f0724]/90 border-2 border-purple-400/30 rounded-2xl flex items-center justify-center relative shadow-inner shrink-0">
            <svg viewBox="0 0 320 180" className="w-full h-full select-none">
              {/* △ABC */}
              <polygon points="70,140 170,140 70,60" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 70 72 L 82 72 L 82 60" fill="none" stroke="#facc15" strokeWidth="2" />
              {/* △ACD */}
              <polygon points="170,140 70,60 250,50" fill="rgba(192,132,252,0.1)" stroke="#c084fc" strokeWidth="2.5" />

              {/* Labels */}
              <text x="50" y="105" fill="#38bdf8" fontSize="12" fontWeight="bold">6 m</text>
              <text x="120" y="156" fill="#38bdf8" fontSize="12" fontWeight="bold">8 m</text>
              <text x="215" y="100" fill="#c084fc" fontSize="12" fontWeight="bold">24 m</text>
              <text x="120" y="90" fill="#facc15" fontSize="12" fontWeight="bold">
                {stepIdx >= 1 ? 'AC = 10 m' : 'AC = ?'}
              </text>
              <text x="150" y="45" fill="#f43f5e" fontSize="12" fontWeight="900">
                {buildDone[1] ? 'AD = 26 m' : 'AD = ?'}
              </text>
            </svg>
          </div>

          {!buildDone[1] ? (
            <div className="w-full max-w-md flex flex-col items-center gap-2.5">
              {stepIdx === 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-sm font-bold text-slate-200 text-center">
                    Step 1: In right triangle ABC, legs are 6 m and 8 m. What is hypotenuse AC?
                  </span>
                  <GhostBtn onClick={() => handleStepChoice(true, 'Correct! 6² + 8² = 36 + 64 = 100, so AC = 10 m.')}>
                    AC = √100 = 10 m ✓
                  </GhostBtn>
                  <GhostBtn onClick={() => handleStepChoice(false)}>
                    AC = 6 + 8 = 14 m
                  </GhostBtn>
                </div>
              )}

              {stepIdx === 1 && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-sm font-bold text-slate-200 text-center">
                    Step 2: In △ACD, AC = 10 m and CD = 24 m (both legs). How do we find AD?
                  </span>
                  <GhostBtn onClick={() => handleStepChoice(true, 'Correct! Both sides are legs forming a right angle: add their squares.')}>
                    Add the squares: 10² + 24² ✓
                  </GhostBtn>
                  <GhostBtn onClick={() => handleStepChoice(false)}>
                    Subtract: 24² − 10²
                  </GhostBtn>
                </div>
              )}

              {stepIdx === 2 && (
                <div className="flex flex-col items-center gap-2.5 w-full">
                  <NumberSlider
                    label="Final Length AD"
                    value={sliderVal}
                    min={15}
                    max={35}
                    step={1}
                    unit="m"
                    onChange={setSliderVal}
                  />
                  <GoldBtn onClick={() => handleSliderSubmit(26)}>
                    Confirm AD ✓
                  </GoldBtn>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-sm">Build 2 Complete! AD = 26 m.</span>
            </div>
          )}

          {feedback && (
            <Msg tone={feedback.status === 'correct' ? 'emerald' : 'rose'}>
              {feedback.text}
            </Msg>
          )}
        </div>
      )}
    </Panel>
  );
}
