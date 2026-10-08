// utils/pythagorasMath.js — single source of maths truth (pure functions, no React).
// Used by the question generator, the four Simulate stations, and the stress test.

export const sum = arr => arr.reduce((s, x) => s + x, 0);
export const sq = n => n * n;

/** Integer square root if n is a perfect square, else null (safe for n up to ~1e6). */
export const intSqrt = n => {
  if (!Number.isInteger(n) || n < 0) return null;
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : null;
};
export const isPerfectSquare = n => intSqrt(n) !== null;

/** Round to 1 d.p. from an exact squared value — never from an already-rounded intermediate. */
export const root1dp = n2 => Math.round(Math.sqrt(n2) * 10) / 10;
export const fmt1 = x => x.toFixed(1);
/** Minimal-decimals formatter for exact answers: 6 → "6", 2.5 → "2.5" */
export const fmtExact = x => (Number.isInteger(x) ? String(x) : String(Math.round(x * 10) / 10));

/* ------------------------------------------------------------------ pools */

/** All integer triples a<b<c with c <= limit, sorted by c then a. */
export function buildTriples(limit) {
  const out = [];
  for (let a = 3; a < limit; a++) {
    for (let b = a + 1; b < limit; b++) {
      const c = intSqrt(a * a + b * b);
      if (c !== null && c <= limit) out.push([a, b, c]);
    }
  }
  return out.sort((x, y) => x[2] - y[2] || x[0] - y[0]);
}
export const TRIPLES = buildTriples(41); // 17 triples — the curated "clean" pool for exact worlds

/** Scale factors allowed in real-world worlds (contexts such as 2.5 m, 6.5 m). */
export const REAL_WORLD_SCALES = [1, 0.5, 0.1, 10];
export const scaleTriple = ([a, b, c], s) => [a, b, c].map(v => Math.round(v * s * 10) / 10);

/** Exact check in tenths so 0.1/0.5 scaling never suffers floating-point error. */
export function isExactTriangle({ a, b, c }) {
  const [ta, tb, tc] = [a, b, c].map(v => Math.round(v * 10));
  return ta > 0 && tb > 0 && tc > ta && tc > tb && ta * ta + tb * tb === tc * tc;
}

/** True when rounding √n2 to 1 d.p. is unambiguous (not within 0.005 of an xx.x5 boundary)
 *  and the 1 d.p. result does not look like an integer (no "7.0"). */
export function isClean1dp(n2) {
  const x = Math.sqrt(n2) * 10;
  const frac = x - Math.floor(x);
  const robust = Math.abs(frac - 0.5) > 0.05;
  const looksInteger = Math.round(x) % 10 === 0;
  return robust && !looksInteger && !isPerfectSquare(n2);
}

/** Decimal-hypotenuse pool: legs 2..20 (a<=b), c² not a perfect square, clean 1 d.p. */
export function buildDecimalHyp(maxLeg = 20) {
  const out = [];
  for (let a = 2; a <= maxLeg; a++) {
    for (let b = a; b <= maxLeg; b++) {
      const c2 = a * a + b * b;
      if (isClean1dp(c2)) out.push({ a, b, c2, answer: root1dp(c2) });
    }
  }
  return out;
}

/** Decimal-leg pool: hypotenuse c <= maxC, known leg b < c, c²−b² not a perfect square, clean 1 d.p. */
export function buildDecimalLeg(maxC = 25) {
  const out = [];
  for (let c = 4; c <= maxC; c++) {
    for (let b = 2; b < c; b++) {
      const d2 = c * c - b * b;
      if (isClean1dp(d2)) out.push({ c, b, d2, answer: root1dp(d2) });
    }
  }
  return out;
}
export const DECIMAL_HYP = buildDecimalHyp(20); // 156 entries
export const DECIMAL_LEG = buildDecimalLeg(25); // 213 entries

/* ------------------------------------------------- orientation & labelling */

export const LABEL_SETS = [['P', 'Q', 'R'], ['A', 'B', 'C'], ['X', 'Y', 'Z'], ['L', 'M', 'N'], ['D', 'E', 'F']];
export const ROTATIONS = [0, 90, 180, 270, 25, -25, 155, 205]; // degrees; hypotenuse is NOT always the bottom-right slant

/** Pick vertex letters and put the right angle at a random vertex.
 *  hypotenuse = the side joining the two non-right vertices. */
export function genLabels(rng) {
  const set = rng.pick(LABEL_SETS);
  const rightIdx = rng.int(0, 2);
  const right = set[rightIdx];
  const others = set.filter((_, i) => i !== rightIdx);
  return {
    vertices: set,
    right,
    hyp: others.join(''),
    legs: others.map(v => [right, v].join('')),
    rotation: rng.pick(ROTATIONS),
  };
}

/* --------------------------------------------------------------- options */

/**
 * Build 4 distinct options: 1 correct + 3 distractors.
 * misconceptions: values in priority order (already numeric); fillers are offsets.
 * mode 'int'   → integer-valued options only (exact triangle questions)
 * mode 'mixed' → any positive value, minimal decimals (World 0 number-fluency items, e.g. a halved 84.5)
 * mode 'dec1'  → every option formatted to exactly 1 d.p.
 */
export function makeOptions(correct, misconceptions, rng, { mode = 'int', unit = '' } = {}) {
  const fmt = mode === 'dec1' ? fmt1 : fmtExact;
  const label = v => (unit ? `${fmt(v)} ${unit}` : fmt(v));
  const ok = v => Number.isFinite(v) && v > 0 && (mode !== 'int' || Number.isInteger(v));
  const seen = new Set([label(correct)]);
  const picked = [];
  const tryAdd = v => {
    if (picked.length >= 3 || !ok(v)) return;
    const key = label(v);
    if (seen.has(key)) return;
    // decimal worlds: keep non-rounding distractors at least 0.3 from the correct value
    if (mode === 'dec1' && Math.abs(v - correct) < 0.3 && !misconceptions.includes(v)) return;
    seen.add(key);
    picked.push(v);
  };
  misconceptions.forEach(tryAdd);
  const fillers = mode === 'dec1' ? [0.3, -0.3, 0.5, -0.5, 1, -1, 2, -2] : [1, -1, 2, -2, 5, -5, 10, -10];
  rng.shuffle(fillers).forEach(d => tryAdd(correct + d));
  const options = rng.shuffle([correct, ...picked]).map(label);
  return { options, correctAnswer: label(correct) };
}

/* ------------------------------------------------------------ validators */

/** Independent recomputation used by the stress test: returns the answer implied by visualData. */
export function answerFromVisualData(vd) {
  if (!vd) return null;
  switch (vd.find) {
    case 'hyp':
      return vd.mode === 'dec1' ? root1dp(sq(vd.a) + sq(vd.b)) : Math.sqrt(sq(vd.a) + sq(vd.b));
    case 'leg':
      return vd.mode === 'dec1' ? root1dp(sq(vd.c) - sq(vd.b)) : Math.sqrt(sq(vd.c) - sq(vd.b));
    case 'num':
      return vd.val;
    default:
      return null;
  }
}

export function validateRightTriangleData(vd) {
  if (!vd) return false;
  if (vd.find === 'hyp') {
    if (vd.mode === 'dec1') return isClean1dp(sq(vd.a) + sq(vd.b));
    return isExactTriangle({ a: vd.a, b: vd.b, c: Math.sqrt(sq(vd.a) + sq(vd.b)) });
  }
  if (vd.find === 'leg') {
    if (!(vd.c > vd.b)) return false; // hypotenuse must be strictly longest
    if (vd.mode === 'dec1') return isClean1dp(sq(vd.c) - sq(vd.b));
    return isExactTriangle({ a: Math.sqrt(sq(vd.c) - sq(vd.b)), b: vd.b, c: vd.c });
  }
  if (vd.find === 'num') {
    return true;
  }
  return false;
}
