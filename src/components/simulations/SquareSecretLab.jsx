import React, { useState, useEffect } from 'react';
import { Panel, Node, Msg, GoldBtn, GhostBtn, NumberSlider, StationSuccess } from './kit.jsx';
import { intSqrt, root1dp, sq } from '../../utils/pythagorasMath.js';
import { useStationNarration } from '../../hooks/useStationNarration.js';

export function SquareSecretLab({ onComplete, audioEnabled = true }) {
  const { narrateEvent } = useStationNarration(0, audioEnabled);

  // Stage: 'tiles' | 'bender' | 'confirm'
  const [stage, setStage] = useState('tiles');
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [isPoured, setIsPoured] = useState(false);
  const [pairsSeen, setPairsSeen] = useState(new Set(['3-4']));
  const [sawTriple, setSawTriple] = useState(true);
  const [sawNonTriple, setSawNonTriple] = useState(false);

  // Stage 2 state
  const [theta, setTheta] = useState(65);
  const [nonRightSeen, setNonRightSeen] = useState(new Set());
  const [lockedAt90, setLockedAt90] = useState(false);

  // Stage 3 state
  const [selectedConfirm, setSelectedConfirm] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // Track leg pair changes in Stage 1
  useEffect(() => {
    setIsPoured(false);
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    setPairsSeen(prev => new Set([...prev, key]));
    const hypInt = intSqrt(sq(a) + sq(b));
    if (hypInt !== null) {
      setSawTriple(true);
    } else {
      setSawNonTriple(true);
    }
  }, [a, b]);

  // Stage 2 angle bending
  const handleAngleChange = deg => {
    // Magnet snap to 90 if within +-3
    const actual = Math.abs(deg - 90) <= 3 ? 90 : deg;
    setTheta(actual);
    if (actual !== 90) {
      setNonRightSeen(prev => new Set([...prev, actual]));
    } else {
      setLockedAt90(true);
      narrateEvent('angle_locked');
    }
  };

  const handlePour = () => {
    setIsPoured(true);
    narrateEvent('pour_complete');
  };

  const stage1Complete = pairsSeen.size >= 4 && sawTriple && sawNonTriple;
  const stage2Complete = nonRightSeen.size >= 2 && lockedAt90;

  // Law of cosines for visual deformation in Stage 2 (drawing only, never shown to student)
  const rad = (theta * Math.PI) / 180;
  const c2_bender = sq(3) + sq(4) - 2 * 3 * 4 * Math.cos(rad);
  const sumLegs2 = sq(3) + sq(4); // 25
  const isAngle90 = theta === 90;

  const handleConfirmSelect = opt => {
    setSelectedConfirm(opt);
    if (opt === 'the triangle has a right angle') {
      setConfirmStatus('correct');
      setIsFinished(true);
      narrateEvent('station_complete');
    } else {
      setConfirmStatus('wrong');
    }
  };

  if (isFinished) {
    return (
      <Panel>
        <StationSuccess
          title="Station A: The Square Secret Lab Solved!"
          onComplete={onComplete}
        />
      </Panel>
    );
  }

  const c2_tiles = sq(a) + sq(b);
  const hypInt_tiles = intSqrt(c2_tiles);

  return (
    <Panel>
      {/* Stage Tabs */}
      <div className="w-full flex flex-wrap items-center justify-between gap-1.5 border-b border-white/15 pb-1.5 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <GhostBtn active={stage === 'tiles'} onClick={() => setStage('tiles')}>
            1. Tile Pour ({pairsSeen.size}/4 pairs {stage1Complete ? '✅' : ''})
          </GhostBtn>
          <GhostBtn
            active={stage === 'bender'}
            disabled={!stage1Complete}
            onClick={() => setStage('bender')}
          >
            2. Angle Bender ({lockedAt90 ? '🔒 90°' : 'Bend'} {stage2Complete ? '✅' : ''})
          </GhostBtn>
          <GhostBtn
            active={stage === 'confirm'}
            disabled={!stage2Complete}
            onClick={() => setStage('confirm')}
          >
            3. Rule Lock 📋
          </GhostBtn>
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-cyan-300">
          Archetype: Concept Discovery
        </span>
      </div>

      {/* -------------------- STAGE 1: TILE POUR -------------------- */}
      {stage === 'tiles' && (
        <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full min-w-0 shrink-0">
            <div className="w-full min-w-0">
              <NumberSlider
                label="Leg a"
                value={a}
                min={1}
                max={12}
                step={1}
                unit="units"
                onChange={setA}
              />
            </div>
            <div className="w-full min-w-0">
              <NumberSlider
                label="Leg b"
                value={b}
                min={1}
                max={12}
                step={1}
                unit="units"
                onChange={setB}
              />
            </div>
          </div>

          {/* Running Readout */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center shrink-0">
            <Node tone="cyan">a² = {sq(a)}</Node>
            <span className="text-lg font-black text-cyan-300">+</span>
            <Node tone="amber">b² = {sq(b)}</Node>
            <span className="text-lg font-black text-amber-300">=</span>
            <Node tone="purple">
              c² = {c2_tiles} {hypInt_tiles ? `(c = ${hypInt_tiles})` : `(c ≈ ${root1dp(c2_tiles)})`}
            </Node>
          </div>

          {/* SVG Visual with dynamic squares */}
          <div className="w-full max-w-lg h-32 sm:h-36 md:h-40 max-h-[22dvh] bg-[#100726]/80 border-2 border-cyan-500/30 rounded-2xl flex items-center justify-center relative p-1.5 shadow-inner shrink-0">
            <svg viewBox="0 0 320 200" className="w-full h-full select-none">
              {/* Central right triangle */}
              <polygon
                points="120,150 120,70 200,150"
                fill="rgba(255,255,255,0.08)"
                stroke="#facc15"
                strokeWidth="2.5"
              />
              <path d="M 120 138 L 132 138 L 132 150" fill="none" stroke="#facc15" strokeWidth="2" />
              <rect x="120" y="138" width="12" height="12" fill="rgba(250,204,21,0.15)" />

              {/* Square on leg a (left) */}
              <rect x="50" y="70" width="70" height="80" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2" />
              <text x="85" y="115" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#0a031c', strokeWidth: '3px' }}>
                {a}² = {sq(a)}
              </text>

              {/* Square on leg b (bottom) */}
              <rect x="120" y="150" width="80" height="40" fill="rgba(251,146,60,0.25)" stroke="#fb923c" strokeWidth="2" />
              <text x="160" y="175" fill="#fb923c" fontSize="13" fontWeight="900" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#0a031c', strokeWidth: '3px' }}>
                {b}² = {sq(b)}
              </text>

              {/* Square on hypotenuse (tilted/poured) */}
              <polygon
                points="120,70 200,150 250,100 170,20"
                fill={isPoured ? "rgba(192,132,252,0.35)" : "rgba(255,255,255,0.05)"}
                stroke="#c084fc"
                strokeWidth="2"
                strokeDasharray={isPoured ? "none" : "4,2"}
              />
              <text x="185" y="85" fill="#c084fc" fontSize="13" fontWeight="900" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#0a031c', strokeWidth: '3px' }}>
                {isPoured ? `c² = ${c2_tiles}` : "Empty"}
              </text>
            </svg>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2.5 shrink-0">
            <GoldBtn onClick={handlePour}>
              {isPoured ? "Tiles Poured! ✨" : "Pour Tiles into c² 🧪"}
            </GoldBtn>
            {stage1Complete && (
              <GoldBtn onClick={() => setStage('bender')}>
                Go to Stage 2: Angle Bender →
              </GoldBtn>
            )}
          </div>

          <Msg tone={stage1Complete ? 'emerald' : 'cyan'}>
            {stage1Complete
              ? "Great exploring! You tested triples and non-triples. Proceed to Stage 2!"
              : `Explore at least 4 leg combinations (need 1 whole triple and 1 decimal). Seen: ${pairsSeen.size}/4`}
          </Msg>
        </div>
      )}

      {/* -------------------- STAGE 2: ANGLE BENDER -------------------- */}
      {stage === 'bender' && (
        <div className="w-full flex flex-col items-center gap-2 sm:gap-2.5 flex-1 min-h-0">
          <p className="text-slate-200 text-xs sm:text-sm font-bold text-center">
            Legs are fixed at a = 3, b = 4 (a² + b² = 25). Drag the angle slider between 40° and 140°. Notice when c² matches 25!
          </p>

          <div className="w-full max-w-md shrink-0">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300 mb-0.5">
              <span>Angle θ between legs:</span>
              <span className={`font-mono text-sm sm:text-base font-black ${isAngle90 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {theta}° {isAngle90 ? '🔒 RIGHT ANGLE LOCKED' : ''}
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="140"
              step="5"
              value={theta}
              onChange={e => handleAngleChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2.5"
            />
          </div>

          {/* Comparative Area Bars */}
          <div className="w-full max-w-md bg-black/40 border border-white/15 rounded-xl p-2 sm:p-2.5 flex flex-col gap-1.5 shrink-0">
            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-bold text-slate-300 mb-0.5">
                <span>Sum of squares on legs (a² + b² = 9 + 16):</span>
                <span className="text-cyan-300 font-bold">25 units²</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[50%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-bold text-slate-300 mb-0.5">
                <span>Square on opposite side (c²):</span>
                <span className={`font-bold ${isAngle90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {c2_bender.toFixed(1)} units²
                </span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${isAngle90 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.min(100, (c2_bender / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <Msg tone={isAngle90 ? 'emerald' : 'amber'}>
            {isAngle90
              ? '✨ Exact 90° Right Angle! a² + b² = c² (25 = 25). The theorem holds!'
              : `At ${theta}°, a² + b² (${sumLegs2}) does NOT equal c² (${c2_bender.toFixed(1)}). Move slider to 90°!`}
          </Msg>

          {stage2Complete && (
            <GoldBtn onClick={() => setStage('confirm')} className="shrink-0">
              Go to Stage 3: Confirmation →
            </GoldBtn>
          )}
        </div>
      )}

      {/* -------------------- STAGE 3: CONFIRMATION MCQ -------------------- */}
      {stage === 'confirm' && (
        <div className="w-full flex flex-col items-center gap-3.5 flex-1 min-h-0 justify-center">
          <h3 className="font-display font-900 text-lg sm:text-xl text-white text-center">
            Pythagoras' theorem (a² + b² = c²) works ONLY when...
          </h3>

          <div className="flex flex-col gap-2.5 w-full max-w-md">
            {[
              'the triangle has a right angle',
              'the triangle is isosceles',
              'all three sides are whole numbers',
              'the hypotenuse is exactly 5'
            ].map((opt, i) => (
              <button
                key={i}
                onClick={() => handleConfirmSelect(opt)}
                className={`py-3 px-4 rounded-xl border-2 font-display text-sm sm:text-base text-left transition cursor-pointer ${
                  selectedConfirm === opt
                    ? confirmStatus === 'correct'
                      ? 'border-emerald-400 bg-emerald-950/80 text-white'
                      : 'border-rose-400 bg-rose-950/80 text-white'
                    : 'border-white/15 bg-white/5 text-slate-200 hover:border-cyan-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {confirmStatus === 'wrong' && (
            <Msg tone="rose">
              Not quite! Re-check your discovery in Stage 2: a² + b² matched c² only at 90°.
            </Msg>
          )}
        </div>
      )}
    </Panel>
  );
}
