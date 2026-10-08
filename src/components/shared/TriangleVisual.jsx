import React from 'react';

/**
 * Pure SVG triangle & geometric diagram renderer for SideQuest (Grade 8 Pythagoras).
 * Replaces AngleVisual from Grade 7.
 * Adheres to Singapore MOE Grade 8 conventions:
 * - Clear right-angle square marker
 * - Hypotenuse and legs labeled with measurements or unknown 'x'
 * - Real-world contexts (ladders, ramps, wires, diagonals, grids)
 * - CSS variables for consistent glowing theme
 * - "Not to scale" pedagogical disclaimer
 * - Complete mathematical bounds protection: auto-scaling and bounding box
 *   guarantee that no vertex, badge, or text label is ever cropped at any rotation.
 */

/**
 * Mathematically rotates, bounds, scales, and centers a right-angled triangle
 * so it is GUARANTEED never to crop against the SVG viewBox edges at ANY rotation.
 */
function getRotatedRightTriangle({ width, height, rotDeg, baseW = 205, altH = 125, pad = 42 }) {
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Canonical right triangle centered at bounding box center
  const pts = [
    { x: -baseW / 2, y: altH / 2 },   // right angle vertex (0)
    { x: baseW / 2, y: altH / 2 },    // leg B horizontal end (1)
    { x: -baseW / 2, y: -altH / 2 }   // leg A vertical end (2)
  ];

  // Rotate points around center (0, 0)
  const rotPts = pts.map(p => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos
  }));

  // Find bounding box of rotated vertices
  const minX = Math.min(...rotPts.map(p => p.x));
  const maxX = Math.max(...rotPts.map(p => p.x));
  const minY = Math.min(...rotPts.map(p => p.y));
  const maxY = Math.max(...rotPts.map(p => p.y));

  const bbW = (maxX - minX) + 2 * pad;
  const bbH = (maxY - minY) + 2 * pad;

  const maxAvailW = width - 64;
  const maxAvailH = height - 58;

  // Scale down if rotated span exceeds available viewBox dimensions
  const scale = Math.min(1.0, maxAvailW / bbW, maxAvailH / bbH);

  const cx = width / 2;
  const cy = height / 2;
  const bbCenterX = (minX + maxX) / 2;
  const bbCenterY = (minY + maxY) / 2;

  // Final screen coordinates (centered in viewBox)
  const screenPts = rotPts.map(p => ({
    x: cx + (p.x - bbCenterX) * scale,
    y: cy + (p.y - bbCenterY) * scale
  }));

  const pRight = screenPts[0];
  const pHoriz = screenPts[1];
  const pVert = screenPts[2];

  // Centroid of the triangle
  const gx = (pRight.x + pHoriz.x + pVert.x) / 3;
  const gy = (pRight.y + pHoriz.y + pVert.y) / 3;

  // Helper to project outwards from centroid with strict boundary clamping
  const outward = (pt, dist, xMargin = 26, yMargin = 22) => {
    const dx = pt.x - gx;
    const dy = pt.y - gy;
    const len = Math.hypot(dx, dy) || 1;
    const rawX = pt.x + (dx / len) * dist;
    const rawY = pt.y + (dy / len) * dist;
    return {
      x: Math.max(xMargin, Math.min(width - xMargin, rawX)),
      y: Math.max(yMargin, Math.min(height - yMargin, rawY))
    };
  };

  // Right-angle square marker corners (oriented along the legs)
  const sqSize = 15 * scale;
  const lenB = Math.hypot(pHoriz.x - pRight.x, pHoriz.y - pRight.y) || 1;
  const lenA = Math.hypot(pVert.x - pRight.x, pVert.y - pRight.y) || 1;

  const uBx = (pHoriz.x - pRight.x) / lenB;
  const uBy = (pHoriz.y - pRight.y) / lenB;
  const uAx = (pVert.x - pRight.x) / lenA;
  const uAy = (pVert.y - pRight.y) / lenA;

  const sqPts = [
    pRight,
    { x: pRight.x + sqSize * uBx, y: pRight.y + sqSize * uBy },
    { x: pRight.x + sqSize * uBx + sqSize * uAx, y: pRight.y + sqSize * uBy + sqSize * uAy },
    { x: pRight.x + sqSize * uAx, y: pRight.y + sqSize * uAy }
  ];

  // Midpoints of sides
  const mB = { x: (pRight.x + pHoriz.x) / 2, y: (pRight.y + pHoriz.y) / 2 };
  const mA = { x: (pRight.x + pVert.x) / 2, y: (pRight.y + pVert.y) / 2 };
  const mH = { x: (pVert.x + pHoriz.x) / 2, y: (pVert.y + pHoriz.y) / 2 };

  return {
    pRight,
    pHoriz,
    pVert,
    sqPts,
    labelB: outward(mB, 18, 30, 24),
    labelA: outward(mA, 18, 30, 24),
    labelH: outward(mH, 20, 32, 24),
    labelVRight: outward(pRight, 20, 22, 20),
    labelVHoriz: outward(pHoriz, 20, 22, 20),
    labelVVert: outward(pVert, 20, 22, 20)
  };
}

export function TriangleVisual({ type = 'right-triangle', data = {}, compact = false }) {
  const width = compact ? 360 : 480;
  const height = compact ? 220 : 270;

  const strokeWidth = compact ? 3 : 3.5;
  const fontSize = compact ? 12 : 15;
  const strokeStyle = { paintOrder: 'stroke', stroke: '#0a031c', strokeWidth: '3.5px', strokeLinejoin: 'round' };

  switch (type) {
    /* ------------------------------------------------ 1. Standard Right Triangle */
    case 'right-triangle': {
      const aVal = data.a ?? 6;
      const bVal = data.b ?? 8;
      const cVal = data.c ?? 10;
      const lab = data.labels || {
        vertices: ['P', 'Q', 'R'],
        right: 'Q',
        hyp: 'PR',
        legs: ['PQ', 'QR'],
        rotation: 0
      };

      const rot = lab.rotation || 0;
      const baseW = compact ? 175 : 205;
      const altH = compact ? 105 : 125;

      const {
        pRight,
        pHoriz,
        pVert,
        sqPts,
        labelB,
        labelA,
        labelH,
        labelVRight,
        labelVHoriz,
        labelVVert
      } = getRotatedRightTriangle({
        width,
        height,
        rotDeg: rot,
        baseW,
        altH,
        pad: compact ? 30 : 42
      });

      const unknown = data.unknown || (data.find === 'hyp' ? 'c' : data.find === 'leg' ? 'a' : null);
      const hypLabel = unknown === 'c' ? 'x' : `${cVal} cm`;
      const leg1Label = unknown === 'b' ? 'x' : `${bVal} cm`;
      const leg2Label = unknown === 'a' ? 'x' : `${aVal} cm`;

      const rightAngleName = lab.right;
      const otherVerts = lab.vertices.filter(v => v !== lab.right);
      const vertTopName = otherVerts[0] || 'P';
      const vertHorizName = otherVerts[1] || 'R';

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Shaded triangle area */}
          <polygon
            points={`${pRight.x},${pRight.y} ${pHoriz.x},${pHoriz.y} ${pVert.x},${pVert.y}`}
            fill="rgba(56, 189, 248, 0.14)"
            stroke="none"
          />

          {/* Right angle marker */}
          <polygon
            points={`${sqPts[0].x},${sqPts[0].y} ${sqPts[1].x},${sqPts[1].y} ${sqPts[2].x},${sqPts[2].y} ${sqPts[3].x},${sqPts[3].y}`}
            fill="rgba(250, 204, 21, 0.25)"
            stroke="#facc15"
            strokeWidth="2.2"
          />

          {/* Leg B */}
          <line
            x1={pRight.x}
            y1={pRight.y}
            x2={pHoriz.x}
            y2={pHoriz.y}
            stroke="var(--tri-leg-b, #fb923c)"
            strokeWidth={strokeWidth + 0.5}
            strokeLinecap="round"
          />

          {/* Leg A */}
          <line
            x1={pRight.x}
            y1={pRight.y}
            x2={pVert.x}
            y2={pVert.y}
            stroke="var(--tri-leg-a, #38bdf8)"
            strokeWidth={strokeWidth + 0.5}
            strokeLinecap="round"
          />

          {/* Hypotenuse */}
          <line
            x1={pVert.x}
            y1={pVert.y}
            x2={pHoriz.x}
            y2={pHoriz.y}
            stroke="var(--tri-hyp, #c084fc)"
            strokeWidth={strokeWidth + 1.5}
            strokeLinecap="round"
          />

          {/* Vertex labels (placed strictly outside with middle anchor) */}
          <text
            x={labelVRight.x}
            y={labelVRight.y}
            fill="#f1f5f9"
            fontSize={fontSize + 1}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            style={strokeStyle}
          >
            {rightAngleName}
          </text>
          <text
            x={labelVHoriz.x}
            y={labelVHoriz.y}
            fill="#f1f5f9"
            fontSize={fontSize + 1}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            style={strokeStyle}
          >
            {vertHorizName}
          </text>
          <text
            x={labelVVert.x}
            y={labelVVert.y}
            fill="#f1f5f9"
            fontSize={fontSize + 1}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            style={strokeStyle}
          >
            {vertTopName}
          </text>

          {/* Side measurement labels (projected outwards from sides) */}
          <text
            x={labelB.x}
            y={labelB.y}
            fill="var(--tri-leg-b, #fb923c)"
            fontSize={fontSize + 1}
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="central"
            style={strokeStyle}
          >
            {leg1Label}
          </text>

          <text
            x={labelA.x}
            y={labelA.y}
            fill="var(--tri-leg-a, #38bdf8)"
            fontSize={fontSize + 1}
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="central"
            style={strokeStyle}
          >
            {leg2Label}
          </text>

          <text
            x={labelH.x}
            y={labelH.y}
            fill="var(--tri-hyp, #c084fc)"
            fontSize={fontSize + 2}
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="central"
            style={strokeStyle}
          >
            {hypLabel}
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 2. Triangle with Built Squares */
    case 'triangle-squares': {
      const a = data.a || 3;
      const b = data.b || 4;

      // Safe adaptive scaling with strict bounds budget for all unit sizes
      const totalUnits = a + b;
      const maxSpan = compact ? 115 : 145;
      const scale = Math.min(compact ? 13 : 18, Math.max(compact ? 2.2 : 2.5, maxSpan / totalUnits));

      const sa = Math.round(a * scale);
      const sb = Math.round(b * scale);

      // Vertically center composite figure (Square A, Triangle, Square B, and both badges)
      const totalFigureHeight = sa + sb + 54;
      const topBadgeY = Math.max(14, Math.round((height - totalFigureHeight) / 2));
      const oy = topBadgeY + 26 + sa;

      const badgeWidth = compact ? 74 : 84;
      const figWidth = sa + Math.max(sb, Math.round(sb / 2) + badgeWidth + 16);
      const ox = Math.round((width - figWidth) / 2) + sa;

      const fontSq = Math.max(compact ? 11 : 12, Math.min(compact ? 15 : 18, Math.round(Math.min(sa, sb) / 4.5)));

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Square on leg A (vertical on left) */}
          <rect x={ox - sa} y={oy - sa} width={sa} height={sa} fill="rgba(56, 189, 248, 0.28)" stroke="#38bdf8" strokeWidth="2.5" />
          <text x={ox - sa / 2} y={oy - sa / 2 + 6} fill="#38bdf8" fontSize={fontSq} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            {a}² = {a * a}
          </text>

          {/* Square on leg B (horizontal on bottom) */}
          <rect x={ox} y={oy} width={sb} height={sb} fill="rgba(251, 146, 60, 0.28)" stroke="#fb923c" strokeWidth="2.5" />
          <text x={ox + sb / 2} y={oy + sb / 2 + 6} fill="#fb923c" fontSize={fontSq} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            {b}² = {b * b}
          </text>

          {/* Right triangle in center */}
          <polygon
            points={`${ox},${oy} ${ox + sb},${oy} ${ox},${oy - sa}`}
            fill="rgba(250, 204, 21, 0.18)"
            stroke="#facc15"
            strokeWidth="3"
          />

          {/* Right angle marker with highlight */}
          <rect x={ox} y={oy - 14} width={14} height={14} fill="rgba(250, 204, 21, 0.25)" />
          <path d={`M ${ox + 14} ${oy} L ${ox + 14} ${oy - 14} L ${ox} ${oy - 14}`} fill="none" stroke="#facc15" strokeWidth="2" />

          {/* Leg a side marking badge (safely ABOVE square A with zero clipping) */}
          <g transform={`translate(${ox - sa / 2 - 32}, ${oy - sa - 24})`}>
            <rect x="0" y="0" width="64" height="22" rx="6" fill="#0b031c" stroke="#38bdf8" strokeWidth="1.8" />
            <text x="32" y="15" fill="#38bdf8" fontSize={fontSize - 2} fontWeight="900" textAnchor="middle">
              a = {a}
            </text>
          </g>

          {/* Leg b side marking badge (safely BELOW square B with zero clipping) */}
          <g transform={`translate(${ox + sb / 2 - 32}, ${oy + sb + 6})`}>
            <rect x="0" y="0" width="64" height="22" rx="6" fill="#0b031c" stroke="#fb923c" strokeWidth="1.8" />
            <text x="32" y="15" fill="#fb923c" fontSize={fontSize - 2} fontWeight="900" textAnchor="middle">
              b = {b}
            </text>
          </g>

          {/* Hypotenuse square area badge */}
          <g transform={`translate(${ox + sb / 2 + 14}, ${oy - sa / 2 - 16})`}>
            <rect x="0" y="0" width={badgeWidth} height="26" rx="7" fill="#1b0c3d" stroke="#c084fc" strokeWidth="2" />
            <text x={badgeWidth / 2} y="18" fill="#c084fc" fontSize={fontSize} fontWeight="900" textAnchor="middle">
              c² = {a * a + b * b}
            </text>
          </g>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 3. Ladder leaning on HDB wall */
    case 'ladder': {
      const ladder = data.ladder || data.c || 5;
      const foot = data.foot || data.b || 3;
      const heightVal = data.height || data.a || (data.unknown === 'height' ? '?' : 4);
      const unit = data.unit || 'm';

      const wallX = compact ? width - 85 : 295;
      const groundY = compact ? height - 42 : 210;
      const footX = compact ? wallX - 165 : 75;
      const topY = compact ? groundY - 120 : 54;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Ground */}
          <line x1={30} y1={groundY} x2={width - 30} y2={groundY} stroke="#94a3b8" strokeWidth="4" />
          {/* Wall */}
          <rect x={wallX} y={35} width={45} height={groundY - 35} fill="#1e143c" stroke="#64748b" strokeWidth="2.5" />
          {/* Window accent */}
          <rect x={wallX - 8} y={topY - 4} width={16} height={9} fill="#facc15" rx="2" />

          {/* Right angle marker at base of wall */}
          <rect x={wallX - 18} y={groundY - 18} width={18} height={18} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${wallX - 18} ${groundY} L ${wallX - 18} ${groundY - 18} L ${wallX} ${groundY - 18}`} fill="none" stroke="#facc15" strokeWidth="2.5" />

          {/* Ladder beam */}
          <line x1={footX} y1={groundY} x2={wallX} y2={topY} stroke="#38bdf8" strokeWidth="6.5" strokeLinecap="round" />

          {/* Ladder rungs */}
          {[0.18, 0.36, 0.54, 0.72, 0.90].map((t, idx) => {
            const rx = footX + (wallX - footX) * t;
            const ry = groundY + (topY - groundY) * t;
            return <circle key={idx} cx={rx} cy={ry} r="3.5" fill="#facc15" />;
          })}

          {/* Labels - safe margins */}
          <text x={(footX + wallX) / 2 - 20} y={(groundY + topY) / 2 - 14} fill="#38bdf8" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            Ladder = {ladder} {unit}
          </text>
          <text x={(footX + wallX) / 2} y={groundY + 24} fill="#fb923c" fontSize={fontSize + 1} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            Foot = {foot} {unit}
          </text>
          <text x={wallX + 50} y={(groundY + topY) / 2 + 5} fill="#f43f5e" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            Height = {heightVal} {unit}
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 4. Wheelchair Ramp */
    case 'ramp': {
      const length = data.length || 2.5;
      const run = data.run || 2.0;
      const rise = data.rise || 1.5;
      const unit = data.unit || 'm';

      const x0 = compact ? 50 : 60;
      const y0 = compact ? height - 45 : 210;
      const rw = compact ? 220 : 250;
      const rh = compact ? 100 : 130;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Ground line */}
          <line x1={25} y1={y0} x2={width - 25} y2={y0} stroke="#64748b" strokeWidth="3.5" />
          {/* Right angle */}
          <rect x={x0 + rw - 18} y={y0 - 18} width={18} height={18} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${x0 + rw - 18} ${y0} L ${x0 + rw - 18} ${y0 - 18} L ${x0 + rw} ${y0 - 18}`} fill="none" stroke="#facc15" strokeWidth="2.5" />

          {/* Ramp Triangle */}
          <polygon
            points={`${x0},${y0} ${x0 + rw},${y0} ${x0 + rw},${y0 - rh}`}
            fill="rgba(56, 189, 248, 0.14)"
            stroke="none"
          />
          {/* Run */}
          <line x1={x0} y1={y0} x2={x0 + rw} y2={y0} stroke="#fb923c" strokeWidth={strokeWidth + 0.5} />
          {/* Rise */}
          <line x1={x0 + rw} y1={y0} x2={x0 + rw} y2={y0 - rh} stroke="#38bdf8" strokeWidth={strokeWidth + 0.5} />
          {/* Slanted ramp surface */}
          <line x1={x0} y1={y0} x2={x0 + rw} y2={y0 - rh} stroke="#c084fc" strokeWidth={strokeWidth + 1.5} />

          {/* Labels with safe bounds */}
          <text x={x0 + rw / 2} y={y0 + 24} fill="#fb923c" fontSize={fontSize + 1} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            Run = {run} {unit}
          </text>
          <text x={x0 + rw + 15} y={y0 - rh / 2 + 5} fill="#38bdf8" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            Rise = {rise} {unit}
          </text>
          <text x={x0 + rw / 2 - 20} y={y0 - rh / 2 - 14} fill="#c084fc" fontSize={fontSize + 2} fontWeight="900" style={strokeStyle}>
            Ramp = {length} {unit}
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 5. Flagpole with Stay-wire */
    case 'flagpole': {
      const wire = data.wire || 13;
      const peg = data.peg || 5;
      const hVal = data.height || 12;
      const unit = data.unit || 'm';

      const poleX = compact ? width - 95 : 300;
      const groundY = compact ? height - 42 : 210;
      const pegX = compact ? poleX - 170 : 65;
      const topY = compact ? groundY - 125 : 52;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          <line x1={25} y1={groundY} x2={width - 25} y2={groundY} stroke="#64748b" strokeWidth="3.5" />
          {/* Pole */}
          <line x1={poleX} y1={groundY} x2={poleX} y2={topY} stroke="#facc15" strokeWidth="5.5" strokeLinecap="round" />
          {/* Flag */}
          <polygon points={`${poleX},${topY} ${poleX - 32},${topY + 15} ${poleX},${topY + 30}`} fill="#ef4444" />
          {/* Stay-wire */}
          <line x1={pegX} y1={groundY} x2={poleX} y2={topY} stroke="#38bdf8" strokeWidth="4" strokeDasharray="6,3" />
          {/* Peg marker */}
          <circle cx={pegX} cy={groundY} r="5" fill="#fb923c" />

          {/* Right angle marker */}
          <rect x={poleX - 18} y={groundY - 18} width={18} height={18} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${poleX - 18} ${groundY} L ${poleX - 18} ${groundY - 18} L ${poleX} ${groundY - 18}`} fill="none" stroke="#facc15" strokeWidth="2.5" />

          {/* Labels */}
          <text x={(pegX + poleX) / 2 - 20} y={(groundY + topY) / 2 - 12} fill="#38bdf8" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            Wire = {wire} {unit}
          </text>
          <text x={(pegX + poleX) / 2} y={groundY + 24} fill="#fb923c" fontSize={fontSize + 1} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            Anchor = {peg} {unit}
          </text>
          <text x={poleX + 16} y={(groundY + topY) / 2 + 5} fill="#facc15" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            Height = {hVal} {unit}
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 6. Isosceles Triangle Height */
    case 'isosceles-height':
    case 'roof-truss': {
      const equal = data.equal || data.rafter || 13;
      const base = data.base || data.span || 10;
      const hVal = data.height || 12;

      const cx = width / 2;
      const groundY = compact ? height - 42 : 210;
      const spanW = compact ? 220 : 270;
      const hPx = compact ? 115 : 140;

      const xL = cx - spanW / 2;
      const xR = cx + spanW / 2;
      const yApex = groundY - hPx;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Left and right rafters */}
          <line x1={xL} y1={groundY} x2={cx} y2={yApex} stroke="#c084fc" strokeWidth={strokeWidth + 0.5} />
          <line x1={xR} y1={groundY} x2={cx} y2={yApex} stroke="#c084fc" strokeWidth={strokeWidth + 0.5} />
          {/* Base */}
          <line x1={xL} y1={groundY} x2={xR} y2={groundY} stroke="#fb923c" strokeWidth={strokeWidth + 0.5} />
          {/* Dashed vertical height post */}
          <line x1={cx} y1={groundY} x2={cx} y2={yApex} stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="6,3" />

          {/* Right angle marker at foot of height */}
          <rect x={cx - 18} y={groundY - 18} width={18} height={18} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${cx - 18} ${groundY} L ${cx - 18} ${groundY - 18} L ${cx} ${groundY - 18}`} fill="none" stroke="#facc15" strokeWidth="2.5" />

          {/* Labels */}
          <text x={(xL + cx) / 2 - 20} y={(groundY + yApex) / 2 - 8} fill="#c084fc" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            {equal} m
          </text>
          <text x={(xR + cx) / 2 + 12} y={(groundY + yApex) / 2 - 8} fill="#c084fc" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            {equal} m
          </text>
          <text x={cx + 14} y={(groundY + yApex) / 2 + 8} fill="#38bdf8" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>
            h = {hVal} m
          </text>
          <text x={cx} y={groundY + 24} fill="#fb923c" fontSize={fontSize + 1} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            Base = {base} m (half = {base / 2} m)
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 7. Rectangle Diagonal / TV Screen */
    case 'rectangle-diagonal':
    case 'tv-screen':
    case 'field-shortcut': {
      const wVal = data.w || 80;
      const hVal = data.h || 60;
      const dVal = data.d || 100;
      const unit = data.unit || 'cm';

      const rw = compact ? 220 : 250;
      const rh = compact ? 110 : 130;
      const x0 = (width - rw) / 2;
      const y0 = compact ? 22 : 48;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Rectangle */}
          <rect
            x={x0}
            y={y0}
            width={rw}
            height={rh}
            fill="rgba(56, 189, 248, 0.1)"
            stroke="#64748b"
            strokeWidth="3.5"
            rx="5"
          />

          {/* Diagonal */}
          <line x1={x0} y1={y0 + rh} x2={x0 + rw} y2={y0} stroke="#facc15" strokeWidth="4" strokeDasharray="6,3" />

          {/* Right angle marker at bottom-left */}
          <rect x={x0} y={y0 + rh - 18} width={18} height={18} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${x0 + 18} ${y0 + rh} L ${x0 + 18} ${y0 + rh - 18} L ${x0} ${y0 + rh - 18}`} fill="none" stroke="#facc15" strokeWidth="2.5" />

          {/* Labels */}
          <text x={x0 + rw / 2} y={y0 + rh + 24} fill="#fb923c" fontSize={fontSize + 1} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            {wVal} {unit}
          </text>
          <text x={x0 - 15} y={y0 + rh / 2 + 5} fill="#38bdf8" fontSize={fontSize + 1} fontWeight="900" textAnchor="end" style={strokeStyle}>
            {hVal} {unit}
          </text>
          <text x={x0 + rw / 2} y={y0 + rh / 2 - 10} fill="#facc15" fontSize={fontSize + 2} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            Diagonal = {dVal} {unit}
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 8. Two-Step Triangle Chain Quad */
    case 'chain-quad': {
      const ab = data.ab || 6;
      const bc = data.bc || 8;
      const cd = data.cd || 24;
      const ad = data.ad || 26;

      const pB = { x: 80, y: compact ? height - 38 : 210 };
      const pA = { x: 80, y: compact ? height - 120 : 115 };
      const pC = { x: compact ? 190 : 250, y: compact ? height - 38 : 210 };
      const pD = { x: compact ? 190 : 250, y: compact ? 30 : 50 };

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Triangle 1: ABC with right angle at B */}
          <polygon points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`} fill="rgba(56, 189, 248, 0.14)" stroke="none" />
          {/* Triangle 2: ACD with right angle at C */}
          <polygon points={`${pA.x},${pA.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`} fill="rgba(192, 132, 252, 0.14)" stroke="none" />

          {/* Right angles */}
          <rect x={pB.x} y={pB.y - 16} width={16} height={16} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${pB.x + 16} ${pB.y} L ${pB.x + 16} ${pB.y - 16} L ${pB.x} ${pB.y - 16}`} fill="none" stroke="#facc15" strokeWidth="2.5" />
          <rect x={pC.x - 16} y={pC.y - 16} width={16} height={16} fill="rgba(250, 204, 21, 0.2)" />
          <path d={`M ${pC.x} ${pC.y - 16} L ${pC.x - 16} ${pC.y - 16} L ${pC.x - 16} ${pC.y}`} fill="none" stroke="#facc15" strokeWidth="2.5" />

          {/* Outer edges */}
          <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke="#38bdf8" strokeWidth="3.5" />
          <line x1={pB.x} y1={pB.y} x2={pC.x} y2={pC.y} stroke="#38bdf8" strokeWidth="3.5" />
          <line x1={pC.x} y1={pC.y} x2={pD.x} y2={pD.y} stroke="#c084fc" strokeWidth="3.5" />
          <line x1={pD.x} y1={pD.y} x2={pA.x} y2={pA.y} stroke="#facc15" strokeWidth="4" />

          {/* Internal diagonal AC */}
          <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5,2" />

          {/* Vertex labels */}
          <text x={pA.x - 18} y={pA.y + 4} fill="#f1f5f9" fontSize={fontSize + 1} fontWeight="bold" style={strokeStyle}>A</text>
          <text x={pB.x - 18} y={pB.y + 18} fill="#f1f5f9" fontSize={fontSize + 1} fontWeight="bold" style={strokeStyle}>B</text>
          <text x={pC.x + 12} y={pC.y + 18} fill="#f1f5f9" fontSize={fontSize + 1} fontWeight="bold" style={strokeStyle}>C</text>
          <text x={pD.x + 12} y={pD.y + 4} fill="#f1f5f9" fontSize={fontSize + 1} fontWeight="bold" style={strokeStyle}>D</text>

          {/* Edge labels */}
          <text x={pA.x - 22} y={(pA.y + pB.y) / 2} fill="#38bdf8" fontSize={fontSize} fontWeight="bold" style={strokeStyle}>{ab} m</text>
          <text x={(pB.x + pC.x) / 2} y={pB.y + 24} fill="#38bdf8" fontSize={fontSize} fontWeight="bold" textAnchor="middle" style={strokeStyle}>{bc} m</text>
          <text x={pC.x + 16} y={(pC.y + pD.y) / 2} fill="#c084fc" fontSize={fontSize} fontWeight="bold" style={strokeStyle}>{cd} m</text>
          <text x={(pA.x + pD.x) / 2} y={(pA.y + pD.y) / 2 - 10} fill="#facc15" fontSize={fontSize + 1} fontWeight="900" style={strokeStyle}>AD = {ad} m</text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    /* ------------------------------------------------ 9. Number Line */
    case 'number-line': {
      const target = data.target || 50;
      const lo = data.min || 6;

      const yLine = height / 2;
      const xStart = compact ? 40 : 55;
      const xEnd = compact ? width - 40 : width - 55;
      const step = (xEnd - xStart) / 4;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-full max-h-full select-none">
          {/* Main axis */}
          <line x1={xStart} y1={yLine} x2={xEnd} y2={yLine} stroke="#cbd5e1" strokeWidth="3.5" />

          {/* Ticks & numbers */}
          {[0, 1, 2, 3, 4].map(i => {
            const tx = xStart + i * step;
            const val = lo + i;
            return (
              <g key={i}>
                <line x1={tx} y1={yLine - 12} x2={tx} y2={yLine + 12} stroke="#94a3b8" strokeWidth="3" />
                <text x={tx} y={yLine + 30} fill="#f1f5f9" fontSize={fontSize + 1} fontWeight="bold" textAnchor="middle" style={strokeStyle}>
                  {val}
                </text>
                <text x={tx} y={yLine - 18} fill="#94a3b8" fontSize={fontSize - 2} textAnchor="middle" style={strokeStyle}>
                  √{val * val}
                </text>
              </g>
            );
          })}

          {/* Target marker indicator */}
          <circle cx={xStart + 1.4 * step} cy={yLine} r="8" fill="#facc15" stroke="#160a36" strokeWidth="2.5" />
          <text x={xStart + 1.4 * step} y={yLine - 32} fill="#facc15" fontSize={fontSize + 2} fontWeight="900" textAnchor="middle" style={strokeStyle}>
            √{target}
          </text>

          <text x={width - 14} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="end" fontStyle="italic" style={strokeStyle}>
            (not to scale)
          </text>
        </svg>
      );
    }

    default:
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-400 font-display">
          📐 Geometric Diagram
        </div>
      );
  }
}
