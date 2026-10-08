import React, { useState } from 'react';
import { Panel, Msg, GoldBtn, NumberSlider, StationSuccess } from './kit.jsx';
import { useStationNarration } from '../../hooks/useStationNarration.js';
import { sq } from '../../utils/pythagorasMath.js';

const REAL_JOBS = [
  {
    id: 'ramp',
    title: 'Job 1: Wheelchair Access Ramp',
    icon: '♿',
    scenario: 'Surveying an accessible entrance ramp for an HDB community hub.',
    legA: 4, // run
    legB: 3, // rise
    labelA: 'Run (Ground)',
    labelB: 'Rise (Ledge)',
    targetHyp: 5,
    unit: 'm',
    min: 2,
    max: 8,
    step: 0.5,
    defaultVal: 3.5,
    contextInfo: 'Target Rise = 3.0 m | Ground Run = 4.0 m'
  },
  {
    id: 'cable',
    title: 'Job 2: Antenna Mast Stay-Cable',
    icon: '🗼',
    scenario: 'Anchoring a rooftop communications mast against heavy coastal winds.',
    legA: 5, // anchor distance
    legB: 12, // mast height
    labelA: 'Anchor Offset',
    labelB: 'Mast Height',
    targetHyp: 13,
    unit: 'm',
    min: 6,
    max: 18,
    step: 0.5,
    defaultVal: 9.0,
    contextInfo: 'Mast Height = 12.0 m | Anchor Offset = 5.0 m'
  },
  {
    id: 'drone',
    title: 'Job 3: Drone Survey Diagonal Transit',
    icon: '🛸',
    scenario: 'Calibrating direct line-of-sight sensor flight across a construction field.',
    legA: 8, // width
    legB: 15, // length
    labelA: 'Field Width',
    labelB: 'Field Length',
    targetHyp: 17,
    unit: 'm',
    min: 10,
    max: 22,
    step: 0.5,
    defaultVal: 12.0,
    contextInfo: 'Field Width = 8.0 m | Field Length = 15.0 m'
  }
];

export function SiteReportDetective({ onComplete, audioEnabled = true }) {
  const { narrateEvent } = useStationNarration(2, audioEnabled);

  const [jobIdx, setJobIdx] = useState(0);
  const [sliderVal, setSliderVal] = useState(REAL_JOBS[0].defaultVal);
  const [jobsCompleted, setJobsCompleted] = useState([false, false, false]);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentJob = REAL_JOBS[jobIdx];
  const { legA, legB, targetHyp, unit } = currentJob;

  // Real-time calculation
  const diff = Math.abs(sliderVal - targetHyp);
  const isMatched = diff <= 0.25;
  const isNear = diff <= 1.0;

  const handleLockIn = () => {
    if (isMatched) {
      const nextDone = [...jobsCompleted];
      nextDone[jobIdx] = true;
      setJobsCompleted(nextDone);
      setFeedback({
        status: 'correct',
        text: `Spot on! Rig perfectly calibrated: ${legA}² + ${legB}² = ${sq(legA)} + ${sq(legB)} = ${sq(targetHyp)} (${targetHyp} ${unit}).`
      });
      narrateEvent('target_matched');

      if (nextDone.every(Boolean)) {
        setIsFinished(true);
        narrateEvent('station_complete');
      }
    } else {
      const msg = sliderVal < targetHyp
        ? `Too short! Length must span across from (${legA} ${unit}) and (${legB} ${unit}). Increase the slider.`
        : `Too long! Length exceeds the hypotenuse clearance. Decrease the slider.`;
      setFeedback({ status: 'wrong', text: msg });
    }
  };

  const handleNextJob = () => {
    setFeedback(null);
    if (jobIdx < REAL_JOBS.length - 1) {
      const nxt = jobIdx + 1;
      setJobIdx(nxt);
      setSliderVal(REAL_JOBS[nxt].defaultVal);
    }
  };

  if (isFinished) {
    return (
      <Panel>
        <StationSuccess
          title="Station C: Real-World Site Rig Solved!"
          onComplete={onComplete}
        />
      </Panel>
    );
  }

  // Real-time SVG coordinates
  const svgW = 340;
  const svgH = 190;
  const groundY = 155;
  const startX = 55;
  const endX = 280;
  const topY = 40;

  // Dynamic visual beam endpoint based on sliderVal
  const ratio = Math.min(1.2, Math.max(0.4, sliderVal / targetHyp));
  const currentBeamX = startX + (endX - startX) * ratio;
  const currentBeamY = groundY + (topY - groundY) * ratio;

  return (
    <Panel>
      {/* Station Header & Job Tabs */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentJob.icon}</span>
          <span className="font-display font-900 text-sm sm:text-base text-cyan-300">
            {currentJob.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {jobsCompleted.map((done, i) => (
            <span
              key={i}
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                done
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              Job {i + 1} {done ? '✓' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Scenario Briefing Card */}
      <div className="w-full bg-[#120829] border border-cyan-400/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="text-left text-xs sm:text-sm">
          <span className="text-slate-200 font-semibold">{currentJob.scenario}</span>
          <div className="text-cyan-300 font-mono font-black mt-0.5">
            {currentJob.contextInfo}
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${
            isMatched
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
              : isNear
              ? 'bg-amber-950 text-amber-300 border border-amber-400'
              : 'bg-white/10 text-slate-400'
          }`}
        >
          {isMatched ? 'ALIGNED 🎯' : isNear ? 'NEAR TARGET ⚠️' : 'ADJUST LENGTH'}
        </div>
      </div>

      {/* Real-World SVG Interactive Simulation Display */}
      <div className="w-full max-w-lg h-44 sm:h-48 bg-[#0c051d]/90 border-2 border-cyan-500/40 rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden shrink-0">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full select-none">
          {/* Ground surface */}
          <line x1={20} y1={groundY} x2={svgW - 20} y2={groundY} stroke="#64748b" strokeWidth={3.5} />

          {/* Job 1: Access Ramp with Platform */}
          {jobIdx === 0 && (
            <>
              {/* Ledge platform */}
              <rect x={endX} y={topY} width={45} height={groundY - topY} fill="#1e143c" stroke="#38bdf8" strokeWidth={2} />
              <text x={endX + 22} y={topY + 30} fill="#38bdf8" fontSize={11} fontWeight="bold" textAnchor="middle">Platform</text>
              <line x1={startX} y1={groundY} x2={endX} y2={groundY} stroke="#fb923c" strokeWidth={3} />
              <line x1={endX} y1={groundY} x2={endX} y2={topY} stroke="#38bdf8" strokeWidth={3} />
              {/* Animated Ramp Surface */}
              <line
                x1={startX}
                y1={groundY}
                x2={currentBeamX}
                y2={currentBeamY}
                stroke={isMatched ? '#facc15' : '#c084fc'}
                strokeWidth={5}
                strokeLinecap="round"
              />
              {/* Wheelchair icon at bottom or rolling up if matched */}
              <text x={isMatched ? (startX + endX) / 2 : startX - 10} y={isMatched ? (groundY + topY) / 2 - 12 : groundY - 10} fontSize={22}>
                ♿
              </text>
            </>
          )}

          {/* Job 2: Antenna Mast with Cable Rig */}
          {jobIdx === 1 && (
            <>
              {/* Antenna Mast */}
              <line x1={endX} y1={groundY} x2={endX} y2={topY} stroke="#facc15" strokeWidth={5} strokeLinecap="round" />
              {/* Flashing aviation beacon */}
              <circle cx={endX} cy={topY} r={6} fill="#ef4444" className="animate-pulse" />
              {/* Ground Anchor Peg */}
              <circle cx={startX} cy={groundY} r={6} fill="#fb923c" />
              <line x1={startX} y1={groundY} x2={endX} y2={groundY} stroke="#fb923c" strokeWidth={3} strokeDasharray="5,3" />
              {/* Animated Stay-Cable */}
              <line
                x1={startX}
                y1={groundY}
                x2={currentBeamX}
                y2={currentBeamY}
                stroke={isMatched ? '#38bdf8' : '#e2e8f0'}
                strokeWidth={isMatched ? 4.5 : 3}
                strokeDasharray={isMatched ? 'none' : '6,3'}
              />
              <text x={startX - 15} y={groundY + 18} fill="#fb923c" fontSize={11} fontWeight="bold">Anchor Peg</text>
              <text x={endX + 8} y={(groundY + topY) / 2} fill="#facc15" fontSize={12} fontWeight="bold">12 m</text>
            </>
          )}

          {/* Job 3: Drone Survey Diagonal Flight */}
          {jobIdx === 2 && (
            <>
              {/* Obstacle Zone */}
              <rect x={startX} y={topY} width={endX - startX} height={groundY - topY} fill="rgba(56,189,248,0.06)" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4,4" />
              {/* Diagonal Target Path */}
              <line
                x1={startX}
                y1={groundY}
                x2={currentBeamX}
                y2={currentBeamY}
                stroke={isMatched ? '#34d399' : '#f43f5e'}
                strokeWidth={4}
                strokeDasharray="5,3"
              />
              {/* Drone moving along path */}
              <text x={currentBeamX - 12} y={currentBeamY - 8} fontSize={22}>
                🛸
              </text>
              <text x={(startX + endX) / 2} y={groundY + 18} fill="#fb923c" fontSize={11} fontWeight="bold" textAnchor="middle">8 m Width</text>
              <text x={endX + 16} y={(groundY + topY) / 2} fill="#38bdf8" fontSize={11} fontWeight="bold">15 m Length</text>
            </>
          )}

          {/* Right-angle square marker */}
          <rect x={endX - 14} y={groundY - 14} width={14} height={14} fill="rgba(250, 204, 21, 0.25)" />
          <path d={`M ${endX - 14} ${groundY} L ${endX - 14} ${groundY - 14} L ${endX} ${groundY - 14}`} fill="none" stroke="#facc15" strokeWidth={2} />

          {/* Real-time Math Formula Display in SVG */}
          <g transform="translate(30, 25)">
            <rect width={160} height={26} rx={6} fill="#0d0422" stroke="#a855f7" strokeWidth={1.5} />
            <text x={80} y={17} fill="#e2e8f0" fontSize={12} fontWeight="bold" textAnchor="middle">
              c² = {legA}² + {legB}² = {sq(legA) + sq(legB)}
            </text>
          </g>

          {/* Current Calibrated Length Badge */}
          <g transform={`translate(${(startX + currentBeamX) / 2 - 35}, ${(groundY + currentBeamY) / 2 - 18})`}>
            <rect width={70} height={22} rx={5} fill="#0d0422" stroke={isMatched ? '#10b981' : '#f59e0b'} strokeWidth={1.5} />
            <text x={35} y={15} fill={isMatched ? '#34d399' : '#fbbf24'} fontSize={12} fontWeight="900" textAnchor="middle">
              {sliderVal} {unit}
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Controls & Verification */}
      <div className="w-full max-w-lg flex flex-col gap-2 shrink-0">
        <NumberSlider
          label="Calibrated Length"
          value={sliderVal}
          min={currentJob.min}
          max={currentJob.max}
          step={currentJob.step}
          unit={unit}
          onChange={setSliderVal}
        />

        <div className="flex items-center justify-center gap-3">
          <GoldBtn onClick={handleLockIn}>
            Lock In Rig ✓
          </GoldBtn>

          {jobsCompleted[jobIdx] && jobIdx < REAL_JOBS.length - 1 && (
            <button
              onClick={handleNextJob}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-display font-900 text-sm px-5 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
            >
              Next Job ({jobIdx + 2}/3) →
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <Msg tone={feedback.status === 'correct' ? 'emerald' : 'rose'}>
          {feedback.text}
        </Msg>
      )}
    </Panel>
  );
}
