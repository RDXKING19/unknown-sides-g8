import React, { useState } from 'react';
import { Panel, Node, Msg, GoldBtn, NumberSlider, StationSuccess } from './kit.jsx';
import { sq } from '../../utils/pythagorasMath.js';
import { useStationNarration } from '../../hooks/useStationNarration.js';

const ROUNDS = [
  { ladder: 13, ledge: 12, targetFoot: 5, step: 1, isDec: false },
  { ladder: 10, ledge: 8, targetFoot: 6, step: 1, isDec: false },
  { ladder: 10, ledge: 9, targetFoot: 4.4, step: 0.1, isDec: true }
];

export function LadderLockIn({ onComplete, audioEnabled = true }) {
  const { narrateEvent } = useStationNarration(1, audioEnabled);

  const [roundIdx, setRoundIdx] = useState(0);
  const [foot, setFoot] = useState(2);
  const [roundDone, setRoundDone] = useState([false, false, false]);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const curr = ROUNDS[roundIdx];
  const L = curr.ladder;
  const H = curr.ledge;

  // Kinematics: height reached on wall
  const heightReached = foot < L ? Math.sqrt(sq(L) - sq(foot)) : 0;
  const diffH = Math.abs(heightReached - H);
  const diffFoot = Math.abs(foot - curr.targetFoot);

  // Proximity indicator
  const isNear = curr.isDec ? diffH <= 0.5 : diffH <= 1.0;
  const isMatched = curr.isDec ? diffFoot <= 0.05 : foot === curr.targetFoot;

  const handleCheck = () => {
    if (isMatched) {
      const nextDone = [...roundDone];
      nextDone[roundIdx] = true;
      setRoundDone(nextDone);
      setFeedback({ status: 'correct', text: `Spot on! Ladder locked at height ${H} m (Foot = ${curr.targetFoot} m).` });
      narrateEvent('target_matched');

      if (nextDone.every(Boolean)) {
        setIsFinished(true);
        narrateEvent('station_complete');
      }
    } else {
      const hint = foot < curr.targetFoot
        ? 'Ladder reaches too high! Move the foot further out from the wall.'
        : 'Ladder is too low! Move the foot closer to the wall.';
      setFeedback({ status: 'wrong', text: hint });
    }
  };

  const handleNextJob = () => {
    setFeedback(null);
    if (roundIdx < ROUNDS.length - 1) {
      const nxt = roundIdx + 1;
      setRoundIdx(nxt);
      setFoot(ROUNDS[nxt].isDec ? 2.0 : 2);
    }
  };

  if (isFinished) {
    return (
      <Panel>
        <StationSuccess
          title="Station B: Ladder Lock-In Solved!"
          onComplete={onComplete}
        />
      </Panel>
    );
  }

  // SVG Geometry
  const svgW = 320;
  const svgH = 200;
  const wallX = 240;
  const groundY = 160;
  const s = 10; // scale pixels per meter
  const footX = Math.max(40, wallX - foot * s);
  const topY = Math.max(30, groundY - heightReached * s);
  const ledgeY = groundY - H * s;

  return (
    <Panel>
      {/* Header Info */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2 shrink-0">
        <span className="font-display font-900 text-sm sm:text-base text-cyan-300">
          Job Round {roundIdx + 1} of 3 {curr.isDec ? '(Precision Decimal Round)' : '(Whole-Number Round)'}
        </span>
        <div className="flex items-center gap-1.5">
          {roundDone.map((d, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-bold ${d ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-white/10 text-slate-400'}`}>
              R{i + 1} {d ? '✓' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Target Briefing */}
      <div className="w-full bg-[#120829] border border-cyan-400/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="text-left text-xs sm:text-sm">
          <span className="text-slate-300">Ladder Length: </span>
          <span className="text-cyan-300 font-black">{L} m</span>
          <span className="text-slate-400 mx-2">|</span>
          <span className="text-slate-300">Target Ledge: </span>
          <span className="text-amber-300 font-black">{H} m</span>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-black ${isNear ? (isMatched ? 'bg-emerald-950 text-emerald-300 border border-emerald-400' : 'bg-amber-950 text-amber-300 border border-amber-400') : 'bg-white/10 text-slate-400'}`}>
          {isMatched ? 'LOCKED IN 🎯' : isNear ? 'NEAR LEDGE ⚠️' : 'ADJUST FOOT'}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="w-full shrink-0">
        <NumberSlider
          label="Foot Distance"
          value={foot}
          min={curr.isDec ? 1.0 : 1}
          max={curr.isDec ? 9.0 : 12}
          step={curr.step}
          unit="m"
          onChange={setFoot}
        />
      </div>

      {/* Running Formula Readout */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center shrink-0">
        <Node tone="amber">foot² = {sq(foot).toFixed(curr.isDec ? 2 : 0)}</Node>
        <span className="text-xl font-black text-amber-300">+</span>
        <Node tone="cyan">height² = {sq(heightReached).toFixed(curr.isDec ? 2 : 0)}</Node>
        <span className="text-xl font-black text-cyan-300">=</span>
        <Node tone="purple">ladder² = {sq(L)}</Node>
      </div>

      {/* SVG Wall & Ladder Canvas */}
      <div className="w-full max-w-lg h-52 bg-[#0e0622]/90 border-2 border-purple-400/30 rounded-2xl flex items-center justify-center relative shadow-inner shrink-0">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full select-none">
          {/* Ground Line */}
          <line x1={20} y1={groundY} x2={svgW - 20} y2={groundY} stroke="#64748b" strokeWidth="3" />
          
          {/* Wall Structure */}
          <rect x={wallX} y={20} width={42} height={groundY - 20} fill="#1e143c" stroke="#475569" strokeWidth="2" />

          {/* Right Angle Marker at Wall Base */}
          <path d={`M ${wallX - 14} ${groundY} L ${wallX - 14} ${groundY - 14} L ${wallX} ${groundY - 14}`} fill="none" stroke="#facc15" strokeWidth="2" />
          <rect x={wallX - 14} y={groundY - 14} width={14} height={14} fill="rgba(250, 204, 21, 0.15)" />

          {/* Target Ledge Shelf Marker */}
          <rect x={wallX - 14} y={ledgeY - 4} width={16} height={8} fill="#facc15" rx="2" />
          <g transform={`translate(${wallX + 46}, ${Math.max(10, ledgeY - 10)})`}>
            <rect x="0" y="0" width="70" height="20" rx="5" fill="#14082c" stroke="#facc15" strokeWidth="1.5" />
            <text x="35" y="14" fill="#facc15" fontSize="10" fontWeight="900" textAnchor="middle">
              Ledge {H} m
            </text>
          </g>

          {/* Ladder Beam */}
          <line
            x1={footX}
            y1={groundY}
            x2={wallX}
            y2={topY}
            stroke={isMatched ? "#4ade80" : isNear ? "#fbbf24" : "#38bdf8"}
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Ladder Top Tip Indicator */}
          <circle cx={wallX} cy={topY} r={isMatched ? 6 : 4} fill={isMatched ? "#4ade80" : "#facc15"} />

          {/* Ladder Length Badge along slanted beam */}
          <g transform={`translate(${(footX + wallX) / 2 - 38}, ${(groundY + topY) / 2 - 20})`}>
            <rect x="0" y="0" width="76" height="18" rx="5" fill="#0c031d" stroke={isMatched ? "#4ade80" : "#38bdf8"} strokeWidth="1.5" />
            <text x="38" y="13" fill={isMatched ? "#4ade80" : "#38bdf8"} fontSize="10" fontWeight="900" textAnchor="middle">
              Ladder {L} m
            </text>
          </g>

          {/* Foot Distance Label on Ground */}
          <g transform={`translate(${(footX + wallX) / 2 - 32}, ${groundY + 6})`}>
            <rect x="0" y="0" width="64" height="18" rx="5" fill="#1a0c02" stroke="#fb923c" strokeWidth="1.5" />
            <text x="32" y="13" fill="#fb923c" fontSize="10" fontWeight="900" textAnchor="middle">
              Foot {foot} m
            </text>
          </g>

          {/* Height Dimension Guide & Label on Wall */}
          <line x1={wallX + 4} y1={topY} x2={wallX + 4} y2={groundY} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
          <g transform={`translate(${wallX + 8}, ${(topY + groundY) / 2 - 10})`}>
            <rect x="0" y="0" width="76" height="20" rx="5" fill="#0d1b3e" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="38" y="14" fill="#38bdf8" fontSize="10" fontWeight="900" textAnchor="middle">
              h = {heightReached.toFixed(1)} m
            </text>
          </g>
        </svg>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <Msg tone={feedback.status === 'correct' ? 'emerald' : 'rose'}>
          {feedback.text}
        </Msg>
      )}

      {/* Button Row */}
      <div className="flex items-center gap-3 shrink-0">
        {!roundDone[roundIdx] ? (
          <GoldBtn onClick={handleCheck}>
            Lock Position & Check 🔧
          </GoldBtn>
        ) : (
          roundIdx < ROUNDS.length - 1 && (
            <GoldBtn onClick={handleNextJob}>
              Next Job Round →
            </GoldBtn>
          )
        )}
      </div>
    </Panel>
  );
}
