// utils/stationCases.js — builders for Simulate Station C and Station D cases.
import { TRIPLES, DECIMAL_HYP, buildTriples, sq, intSqrt, root1dp, fmt1, fmtExact } from './pythagorasMath.js';

export const ERROR_TYPES = [
  'added-instead-of-subtracted',
  'skipped-square-root',
  'wrong-hypotenuse',
  'squaring-slip',
  'rounding-slip'
];

/** All two-triangle chains where hypotenuse of T1 is a leg of T2 */
export function buildChains(triples = TRIPLES, limit2 = 65) {
  const T2 = buildTriples(limit2);
  const out = [];
  for (const t1 of triples) {
    for (const t2 of T2) {
      if (t1 === t2) continue;
      if (t2[0] === t1[2]) {
        out.push({ t1, given2: t2[1], leg2: t2[0], ans: t2[2] });
      } else if (t2[1] === t1[2]) {
        out.push({ t1, given2: t2[0], leg2: t2[1], ans: t2[2] });
      }
    }
  }
  return out;
}

export const CHAINS = buildChains(TRIPLES, 65);

/** Station C Roof truss case */
export function buildRoofCase(rng) {
  const [a0, b0, c] = rng.pick(TRIPLES);
  // Either a0 or b0 can be half-base, the other is height
  const swap = rng.next() < 0.5;
  const halfBase = swap ? a0 : b0;
  const height = swap ? b0 : a0;
  const base = halfBase * 2;
  const rafter = c;

  return {
    rafter,
    base,
    halfBase,
    height,
    steps: [
      {
        prompt: 'Step 1: Drop the vertical centre post to divide the roof into two right-angled triangles.',
        action: 'drop-post',
        buttonText: 'Drop Centre Post ⬇️'
      },
      {
        prompt: `Step 2: In the right-angled triangle, the rafter is ${rafter} m and half the base is ${halfBase} m. Which is the hypotenuse?`,
        action: 'pick-hyp',
        choices: [
          `The rafter (${rafter} m)`,
          `The half-base (${halfBase} m)`,
          'The height post'
        ],
        correct: `The rafter (${rafter} m)`
      },
      {
        prompt: 'Step 3: To find the unknown height (a shorter side), do we add or subtract the squares?',
        action: 'choose-op',
        choices: [
          'Subtract the squares: rafter² − half-base²',
          'Add the squares: rafter² + half-base²',
          'Subtract the lengths: rafter − half-base'
        ],
        correct: 'Subtract the squares: rafter² − half-base²'
      },
      {
        prompt: `Step 4: Calculate the height. ${rafter}² − ${halfBase}² = ${sq(rafter)} − ${sq(halfBase)} = ${sq(height)}. What is the height?`,
        action: 'slider-val',
        min: 1,
        max: 40,
        correct: height
      }
    ]
  };
}

/** Station C Chain quad case */
export function buildChainCase(rng) {
  const chain = rng.pick(CHAINS);
  const { t1, given2, ans } = chain;
  const [a, b, c] = t1; // c is intermediate hypotenuse and leg2 of triangle 2

  return {
    t1: { a, b, c },
    t2: { leg1: c, leg2: given2, hyp: ans },
    ab: a,
    bc: b,
    ac: c,
    cd: given2,
    ad: ans,
    steps: [
      {
        prompt: `Step 1: In the first triangle ABC, AB = ${a} m and BC = ${b} m (right angle at B). Find AC.`,
        action: 'step1-val',
        min: 1,
        max: 50,
        correct: c
      },
      {
        prompt: `Step 2: AC = ${c} m. In triangle ACD, right angle is at C. AC = ${c} m and CD = ${given2} m. How do we find AD?`,
        action: 'choose-op',
        choices: [
          'Add the squares: AC² + CD²',
          'Subtract the squares: CD² − AC²',
          'Multiply: AC × CD'
        ],
        correct: 'Add the squares: AC² + CD²'
      },
      {
        prompt: `Step 3: Calculate AD. ${c}² + ${given2}² = ${sq(c)} + ${sq(given2)} = ${sq(ans)}. What is AD?`,
        action: 'slider-val',
        min: 1,
        max: 70,
        correct: ans
      }
    ]
  };
}

/**
 * Station D Error-Detective case builder
 * Returns: { type, lines, faultyIdx, options, correctFix, data }
 */
export function buildCase(rng, type) {
  const [a0, b0, c] = rng.pick(TRIPLES);
  const swap = rng.next() < 0.5;
  const a = swap ? b0 : a0;
  const b = swap ? a0 : b0;
  let lines, faultyIdx, correct, wrong;

  if (type === 'added-instead-of-subtracted') {
    // leg problem: hypotenuse c, known leg a, unknown leg b
    const bad2 = sq(c) + sq(a);
    lines = [
      `Hypotenuse = ${c} cm, known leg = ${a} cm, unknown leg = x`,
      `Rule: add the squares, x² = ${c}² + ${a}²`,
      `x² = ${sq(c)} + ${sq(a)} = ${bad2}`,
      `x ${intSqrt(bad2) !== null ? '=' : '≈'} ${intSqrt(bad2) !== null ? intSqrt(bad2) : fmt1(root1dp(bad2))} cm`
    ];
    faultyIdx = 1;
    correct = `Rule: subtract the squares, x² = ${c}² − ${a}²`;
    wrong = [
      `Rule: subtract the squares, x² = ${a}² − ${c}²`,
      `Rule: subtract the sides, x = ${c} − ${a}`
    ];
  } else if (type === 'skipped-square-root') {
    // hypotenuse problem
    lines = [
      `Legs = ${a} cm and ${b} cm, hypotenuse = h`,
      `Rule: add the squares, h² = ${a}² + ${b}²`,
      `h² = ${sq(a)} + ${sq(b)} = ${sq(c)}`,
      `h = ${sq(c)} cm`
    ];
    faultyIdx = 3;
    correct = `h = √${sq(c)} = ${c} cm`;
    wrong = [
      `h = ${sq(c)} ÷ 2 = ${fmtExact(sq(c) / 2)} cm`,
      `h = ${a} + ${b} = ${a + b} cm`
    ];
  } else if (type === 'wrong-hypotenuse') {
    // hypotenuse problem; mislabels the longest GIVEN side as the hypotenuse
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const d2 = sq(hi) - sq(lo);
    lines = [
      `Hypotenuse = ${hi} cm (the longest side given), legs = ${lo} cm and h`,
      `Rule: subtract the squares, h² = ${hi}² − ${lo}²`,
      `h² = ${sq(hi)} − ${sq(lo)} = ${d2}`,
      `h ${intSqrt(d2) !== null ? '=' : '≈'} ${intSqrt(d2) !== null ? intSqrt(d2) : fmt1(root1dp(d2))} cm`
    ];
    faultyIdx = 0;
    correct = `h is opposite the right angle, so h is the hypotenuse; legs = ${lo} cm and ${hi} cm`;
    wrong = [
      `Hypotenuse = ${lo} cm (the shortest side given), legs = ${hi} cm and h`,
      `Hypotenuse = ${lo + hi} cm (both sides together), legs = ${lo} cm and h`
    ];
  } else if (type === 'squaring-slip') {
    // hypotenuse problem; a² computed as 2a
    lines = [
      `Legs = ${a} cm and ${b} cm, hypotenuse = h`,
      `Rule: add the squares, h² = ${a}² + ${b}²`,
      `h² = ${2 * a} + ${sq(b)} = ${2 * a + sq(b)}`,
      `h = √${2 * a + sq(b)}`
    ];
    faultyIdx = 2;
    correct = `h² = ${sq(a)} + ${sq(b)} = ${sq(c)}`;
    wrong = [
      `h² = (${a} + ${b})² = ${sq(a + b)}`,
      `h² = ${sq(a)} + ${2 * b} = ${sq(a) + 2 * b}`
    ];
  } else {
    // rounding-slip: decimal hypotenuse problem
    const e = rng.pick(DECIMAL_HYP);
    const good = e.answer;
    const slip = Math.round((good + 0.1) * 10) / 10;
    lines = [
      `Legs = ${e.a} cm and ${e.b} cm, hypotenuse = h`,
      `Rule: add the squares, h² = ${e.a}² + ${e.b}²`,
      `h² = ${sq(e.a)} + ${sq(e.b)} = ${e.c2}`,
      `h ≈ ${fmt1(slip)} cm (1 d.p.)`
    ];
    faultyIdx = 3;
    correct = `h = √${e.c2} ≈ ${fmt1(good)} cm (1 d.p.)`;
    wrong = [
      `h = √${e.c2} ≈ ${fmt1(Math.round((good - 0.1) * 10) / 10)} cm (1 d.p.)`,
      `h = √${e.c2} ≈ ${Math.round(good)} cm (nearest whole number)`
    ];
    return {
      type,
      lines,
      faultyIdx,
      options: rng.shuffle([correct, ...wrong]),
      correctFix: correct,
      data: { type, a: e.a, b: e.b, c2: e.c2, good, slip }
    };
  }

  return {
    type,
    lines,
    faultyIdx,
    options: rng.shuffle([correct, ...wrong]),
    correctFix: correct,
    data: { type, a, b, c }
  };
}
