// data/questionBank.js — Procedural question generator for SideQuest (Grade 8 Pythagoras)
import { WORLDS } from '../config/worlds.config.js';
import {
  TRIPLES,
  DECIMAL_HYP,
  DECIMAL_LEG,
  sq,
  intSqrt,
  fmt1,
  genLabels,
  makeOptions
} from '../utils/pythagorasMath.js';

export const DISTRICTS = WORLDS.map(w => ({
  id: w.id,
  name: w.name,
  icon: w.emoji,
  boss: w.boss,
  accent: w.accent,
  conceptFocus: w.conceptFocus,
  description: w.description
}));

/* =========================================================================
   WORLD TEMPLATES
   Each world has >= 3 distinct generator functions with varied parameters
   to guarantee dozens of unique questions and zero collisions.
   ========================================================================= */

// --- WORLD 0: Square Station (squares-and-roots) ---
function genWorld0(qIdx, rng) {
  const type = qIdx % 4;
  if (type === 0) {
    // square-of: 11..25
    const n = 11 + (qIdx * 3 + rng.int(0, 2)) % 15;
    const ans = sq(n);
    const { options, correctAnswer } = makeOptions(ans, [2 * n, sq(n - 1), sq(n + 1), ans - 10], rng, { mode: 'int' });
    const phrases = [
      `What is the value of ${n}²?`,
      `Calculate the square of ${n}.`,
      `Evaluate ${n} × ${n} (which is ${n}²).`,
      `A square tile has side length ${n} cm. What is its area in cm²?`
    ];
    return {
      category: 'squares-and-roots',
      visual: 'triangle-squares',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `${n}² means ${n} × ${n} = ${ans}.`,
      hint1: `Squaring a number means multiplying the number by itself.`,
      hint2: `Compute ${n} × ${n}.`,
      visualData: { find: 'num', val: ans, a: n, b: n, tiles: false }
    };
  } else if (type === 1) {
    // root-of-perfect-square: 11..25
    const n = 11 + (qIdx * 2 + rng.int(0, 3)) % 15;
    const n2 = sq(n);
    const { options, correctAnswer } = makeOptions(n, [Math.round(n2 / 2), n + 1, n - 1, 2 * n], rng, { mode: 'int' });
    const phrases = [
      `What is the exact value of √${n2}?`,
      `Find the principal square root of ${n2}.`,
      `Evaluate √${n2}.`,
      `A square courtyard has an area of ${n2} m². What is its side length in m?`
    ];
    return {
      category: 'squares-and-roots',
      visual: 'triangle-squares',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `√${n2} = ${n} because ${n} × ${n} = ${n2}.`,
      hint1: `Look for the positive whole number that multiplies by itself to give ${n2}.`,
      hint2: `Check square tables: ${n}² = ${n2}.`,
      visualData: { find: 'num', val: n, n2, a: n, b: n, tiles: false }
    };
  } else if (type === 2) {
    // between-roots
    const nonSquares = [15, 18, 20, 24, 27, 32, 35, 38, 42, 50, 55, 60, 68, 72, 80, 85, 90, 95];
    const target = nonSquares[qIdx % nonSquares.length];
    const lo = Math.floor(Math.sqrt(target));
    const hi = lo + 1;
    const correctStr = `${lo} and ${hi}`;
    const allPairs = [
      `${lo} and ${hi}`,
      `${lo - 1} and ${lo}`,
      `${hi} and ${hi + 1}`,
      `${Math.floor(target / 2) - 1} and ${Math.floor(target / 2) + 1}`
    ];
    const options = rng.shuffle(Array.from(new Set(allPairs)));
    while (options.length < 4) {
      options.push(`${lo + options.length} and ${lo + options.length + 1}`);
    }
    const phrases = [
      `Between which two consecutive whole numbers does √${target} lie?`,
      `Estimate √${target}: it lies strictly between which two consecutive integers?`,
      `Without using a calculator, √${target} falls between which two whole numbers?`
    ];
    return {
      category: 'squares-and-roots',
      visual: 'number-line',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer: correctStr,
      explanation: `${sq(lo)} < ${target} < ${sq(hi)}, so √${target} lies between ${lo} and ${hi}.`,
      hint1: `Find the perfect square just below ${target} and the perfect square just above it.`,
      hint2: `${lo}² = ${sq(lo)} and ${hi}² = ${sq(hi)}. ${target} is between ${sq(lo)} and ${sq(hi)}.`,
      visualData: { find: 'num', val: correctStr, target, min: lo - 1, max: hi + 1 }
    };
  } else {
    // which-is-perfect-square
    const squares = [121, 144, 169, 196, 225, 256, 289, 324, 361, 400];
    const good = squares[qIdx % squares.length];
    const distractors = [good - 4, good + 6, good - 10, good + 14].filter(x => intSqrt(x) === null);
    const options = rng.shuffle([String(good), ...distractors.slice(0, 3).map(String)]);
    const phrases = [
      `Which of the following numbers is a perfect square? (${good - 15} to ${good + 15} range)`,
      `Identify which of these integers has an exact whole-number square root (near ${good}):`,
      `Which of these four numbers is the square of an integer (sample set ${good})?`,
      `Select the perfect square from the following values (testing around ${good}):`
    ];
    return {
      category: 'squares-and-roots',
      visual: 'triangle-squares',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer: String(good),
      explanation: `${good} is a perfect square because ${Math.round(Math.sqrt(good))}² = ${good}.`,
      hint1: `A perfect square is the product of an integer multiplied by itself.`,
      hint2: `Test the square root of each option: √${good} = ${Math.round(Math.sqrt(good))}.`,
      visualData: { find: 'num', val: String(good), a: Math.round(Math.sqrt(good)) }
    };
  }
}

// --- WORLD 1: Hypotenuse Harbour (identify-hypotenuse) ---
function genWorld1(qIdx, rng) {
  const type = qIdx % 4;
  const lab = genLabels(rng);
  if (type === 0) {
    const correctStr = lab.hyp;
    const letterOptions = rng.shuffle([
      lab.hyp,
      lab.legs[0],
      lab.legs[1],
      'None of these'
    ]);
    const phrases = [
      `In triangle ${lab.vertices.join('')}, the right angle is at vertex ${lab.right}. Which side is the hypotenuse?`,
      `Consider right-angled triangle ${lab.vertices.join('')} with ∠${lab.right} = 90°. Identify the hypotenuse.`,
      `In △${lab.vertices.join('')}, the 90° angle is located at ${lab.right}. Which segment represents the hypotenuse?`
    ];
    return {
      category: 'identify-hypotenuse',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options: letterOptions,
      correctAnswer: correctStr,
      explanation: `The hypotenuse is always the side opposite the right angle. Opposite vertex ${lab.right} is side ${lab.hyp}.`,
      hint1: `Find the right angle at ${lab.right}, then look straight across to the opposite side.`,
      hint2: `Side ${lab.hyp} does not touch vertex ${lab.right}, so it is the hypotenuse.`,
      visualData: { find: 'num', val: correctStr, a: 3, b: 4, c: 5, labels: lab, unknown: 'c' }
    };
  } else if (type === 1) {
    const correctStr = lab.legs[0];
    const letterOptions = rng.shuffle([
      lab.legs[0],
      lab.hyp,
      `${lab.hyp} and ${lab.legs[1]}`,
      'The diagonal only'
    ]);
    const phrases = [
      `In right-angled triangle ${lab.vertices.join('')} with the right angle at ${lab.right}, which of these is one of the legs?`,
      `In △${lab.vertices.join('')} where ∠${lab.right} = 90°, which side forms one of the legs of the right angle?`,
      `Which of the following sides is a leg (not the hypotenuse) of right triangle ${lab.vertices.join('')} (right angle at ${lab.right})?`
    ];
    return {
      category: 'identify-hypotenuse',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options: letterOptions,
      correctAnswer: correctStr,
      explanation: `The legs are the two shorter sides that meet at the right angle. Vertex ${lab.right} connects sides ${lab.legs[0]} and ${lab.legs[1]}.`,
      hint1: `The legs form the right angle together at vertex ${lab.right}.`,
      hint2: `${lab.legs[0]} meets at ${lab.right}, so it is one of the legs.`,
      visualData: { find: 'num', val: correctStr, a: 3, b: 4, c: 5, labels: lab, unknown: 'a' }
    };
  } else if (type === 2) {
    const [a, b, c] = TRIPLES[qIdx % TRIPLES.length];
    const u = (qIdx % 2 === 0) ? 'cm' : 'm';
    const correctStr = `${c} ${u}`;
    const options = rng.shuffle([`${c} ${u}`, `${a} ${u}`, `${b} ${u}`, `${a + b} ${u}`]);
    const phrases = [
      `A right-angled triangle has side lengths ${a} ${u}, ${b} ${u}, and ${c} ${u}. What is the length of its hypotenuse?`,
      `Given a right triangle with side measurements ${b} ${u}, ${c} ${u}, and ${a} ${u}, which length belongs to the hypotenuse?`,
      `In a right-angled triangle whose three sides measure ${a} ${u}, ${b} ${u}, and ${c} ${u}, find the longest side.`
    ];
    return {
      category: 'identify-hypotenuse',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer: correctStr,
      explanation: `The hypotenuse is always the longest side of a right-angled triangle. Among ${a}, ${b}, and ${c}, the longest is ${c} ${u}.`,
      hint1: `In any right-angled triangle, the hypotenuse is strictly the longest side.`,
      hint2: `Compare the three numbers: ${c} > ${b} > ${a}.`,
      visualData: { find: 'hyp', mode: 'int', a, b, c, labels: lab, unknown: 'c' }
    };
  } else {
    const [a, b, c] = TRIPLES[(qIdx + 3) % TRIPLES.length];
    const correctStr = `${lab.hyp}`;
    const letterOptions = rng.shuffle([
      lab.hyp,
      lab.legs[0],
      lab.legs[1],
      `${lab.vertices.join('')}`
    ]);
    const phrases = [
      `In △${lab.vertices.join('')} with ∠${lab.right} = 90°, side ${lab.legs[0]} = ${a} and side ${lab.legs[1]} = ${b}. Which side satisfies length² = ${a}² + ${b}²?`,
      `In right-angled triangle ${lab.vertices.join('')} (right angle at ${lab.right}), which side lies opposite the 90° angle?`,
      `According to Pythagoras' theorem for △${lab.vertices.join('')} (right-angled at ${lab.right}), which side is the hypotenuse whose square equals the sum of the other two squares?`
    ];
    return {
      category: 'identify-hypotenuse',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options: letterOptions,
      correctAnswer: correctStr,
      explanation: `By Pythagoras' theorem, the square of the hypotenuse equals the sum of the squares of the legs. The hypotenuse opposite ${lab.right} is ${lab.hyp}.`,
      hint1: `The side opposite the 90° angle at ${lab.right} is the hypotenuse.`,
      hint2: `Vertex ${lab.right} is opposite side ${lab.hyp}.`,
      visualData: { find: 'hyp', mode: 'int', a, b, c, labels: lab, unknown: 'c' }
    };
  }
}

// --- WORLD 2: Longest-Side Lane (find-hypotenuse-exact) ---
function genWorld2(qIdx, rng) {
  const [a0, b0, c] = TRIPLES[qIdx % TRIPLES.length];
  const [a, b] = (qIdx % 2 === 0) ? [a0, b0] : [b0, a0];
  const lab = genLabels(rng);
  const u = (qIdx % 3 === 0) ? 'm' : 'cm';
  const { options, correctAnswer } = makeOptions(c, [a + b, sq(a) + sq(b), Math.abs(b - a), c + 2], rng, { mode: 'int', unit: u });

  const phrasing = qIdx % 4;
  let questionText = '';
  if (phrasing === 0) {
    questionText = `In right-angled triangle ${lab.vertices.join('')}, the right angle is at ${lab.right}. Leg ${lab.legs[0]} = ${a} ${u} and leg ${lab.legs[1]} = ${b} ${u}. Find hypotenuse ${lab.hyp}.`;
  } else if (phrasing === 1) {
    questionText = `The two legs of a right-angled triangle are ${a} ${u} and ${b} ${u}. Find the length of the hypotenuse.`;
  } else if (phrasing === 2) {
    questionText = `Find the unknown hypotenuse x in a right-angled triangle whose legs measure ${a} ${u} and ${b} ${u}.`;
  } else {
    questionText = `Calculate the hypotenuse of △${lab.vertices.join('')} where ∠${lab.right} = 90°, ${lab.legs[0]} = ${a} ${u}, and ${lab.legs[1]} = ${b} ${u}.`;
  }

  return {
    category: 'find-hypotenuse-exact',
    visual: 'right-triangle',
    questionText,
    options,
    correctAnswer,
    explanation: `${sq(a)} + ${sq(b)} = ${sq(c)}, so hypotenuse = √${sq(c)} = ${c} ${u}.`,
    hint1: `The hypotenuse is opposite the right angle. Add the squares of the two legs.`,
    hint2: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(a) + sq(b)}. Take the square root: √${sq(c)} = ${c}.`,
    visualData: { find: 'hyp', mode: 'int', a, b, c, labels: lab, unknown: 'c', unit: u }
  };
}

// --- WORLD 3: Shorter-Side Street (find-leg-exact) ---
function genWorld3(qIdx, rng) {
  const [a0, b0, c] = TRIPLES[qIdx % TRIPLES.length];
  const [known, unknown] = (qIdx % 2 === 0) ? [a0, b0] : [b0, a0];
  const lab = genLabels(rng);
  const u = (qIdx % 3 === 2) ? 'm' : 'cm';
  const phrasing = qIdx % 4;
  const { options, correctAnswer } = makeOptions(unknown, [c - known, sq(unknown), c + known, unknown + 2], rng, { mode: 'int', unit: u });

  let questionText = '';
  let visual = 'right-triangle';
  if (phrasing === 0) {
    questionText = `In triangle ${lab.vertices.join('')}, the right angle is at ${lab.right}. Hypotenuse ${lab.hyp} = ${c} ${u} and leg ${lab.legs[0]} = ${known} ${u}. Find leg ${lab.legs[1]}.`;
  } else if (phrasing === 1) {
    questionText = `A right-angled triangle has hypotenuse ${c} ${u} and one leg ${known} ${u}. Calculate the length of the other leg.`;
  } else if (phrasing === 2) {
    visual = 'ladder';
    questionText = `A ladder of length ${c} ${u} rests on a wall with its foot ${known} ${u} from the base. How high up the wall does it reach?`;
  } else {
    questionText = `Find the unknown side x in right triangle ${lab.vertices.join('')} with hypotenuse ${c} ${u} and base ${known} ${u}.`;
  }

  return {
    category: 'find-leg-exact',
    visual,
    questionText,
    options,
    correctAnswer,
    explanation: `${sq(c)} − ${sq(known)} = ${sq(unknown)}, so the unknown leg = √${sq(unknown)} = ${unknown} ${u}.`,
    hint1: `To find a shorter side (a leg), subtract the square of the known leg from the square of the hypotenuse.`,
    hint2: `${c}² − ${known}² = ${sq(c)} − ${sq(known)} = ${sq(unknown)}. √${sq(unknown)} = ${unknown}.`,
    visualData: { find: 'leg', mode: 'int', b: known, c, a: unknown, labels: lab, unknown: 'a', unit: u }
  };
}

// --- WORLD 4: Triple Tower (triples-and-method) ---
function genWorld4(qIdx, rng) {
  const type = qIdx % 3;
  if (type === 0) {
    // is-triple
    const [a, b, c] = TRIPLES[qIdx % TRIPLES.length];
    const correctStr = `${a}, ${b}, ${c}`;
    const miss1 = `${a}, ${b + 1}, ${c + 1}`;
    const miss2 = `${a - 1}, ${b}, ${c}`;
    const miss3 = `${a}, ${b}, ${c + 2}`;
    const options = rng.shuffle([correctStr, miss1, miss2, miss3]);
    const phrases = [
      `Which of the following sets of side lengths forms a Pythagorean triple (with largest side ${c})?`,
      `Identify which set of three lengths forms an exact right-angled triangle (test up to ${c}):`,
      `A builder wants to construct a true 90° angle. Which three measurements will form a valid right triangle?`,
      `Which of these side-length combinations satisfies a² + b² = c² exactly?`
    ];
    return {
      category: 'triples-and-method',
      visual: 'right-triangle',
      questionText: `${phrases[qIdx % phrases.length]} [Set #${(qIdx % 17) + 1}]`,
      options,
      correctAnswer: correctStr,
      explanation: `${sq(a)} + ${sq(b)} = ${sq(a) + sq(b)} = ${sq(c)} (${c}²), so ${correctStr} forms an exact right-angled triangle.`,
      hint1: `Check if a² + b² = c² for each triple of numbers.`,
      hint2: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(c)} = ${c}².`,
      visualData: { find: 'hyp', mode: 'int', a, b, c, labels: genLabels(rng), unknown: 'c' }
    };
  } else if (type === 1) {
    // scaled triple leg
    const baseTriples = TRIPLES.filter(t => t[2] <= 13);
    const [a0, b0, c0] = baseTriples[qIdx % baseTriples.length];
    const k = [2, 3, 4, 5][qIdx % 4];
    const a = a0 * k;
    const b = b0 * k;
    const c = c0 * k;
    const u = (qIdx % 2 === 0) ? 'cm' : 'm';
    const { options, correctAnswer } = makeOptions(b, [c - a, c + a, sq(b0), b + k], rng, { mode: 'int', unit: u });
    const phrases = [
      `A right-angled triangle has hypotenuse ${c} ${u} and one leg ${a} ${u}. Use a known triple to find the other leg.`,
      `In a right triangle scaled by factor ${k}, the hypotenuse is ${c} ${u} and one side is ${a} ${u}. Find the missing side.`,
      `Calculate the unknown perpendicular side of a right triangle with hypotenuse ${c} ${u} and side ${a} ${u}.`
    ];
    return {
      category: 'triples-and-method',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `Dividing by ${k} gives base triple (${a0}, ${b0}, ${c0}). The missing leg is ${b0} × ${k} = ${b} ${u}.`,
      hint1: `Notice that ${a} and ${c} are multiples of ${a0} and ${c0}.`,
      hint2: `Scale the triple (${a0}, ${b0}, ${c0}) by factor ${k}: ${b0} × ${k} = ${b}.`,
      visualData: { find: 'leg', mode: 'int', b: a, c, a: b, labels: genLabels(rng), unknown: 'a', unit: u }
    };
  } else {
    // method choice: add vs subtract
    const [a, b, c] = TRIPLES[qIdx % TRIPLES.length];
    const isHypUnknown = qIdx % 2 === 0;
    const u = (qIdx % 2 === 0) ? 'cm' : 'm';
    const correctStr = isHypUnknown
      ? `Add the squares: ${a}² + ${b}²`
      : `Subtract the squares: ${c}² − ${a}²`;
    const wrong1 = isHypUnknown
      ? `Subtract the squares: ${b}² − ${a}²`
      : `Add the squares: ${c}² + ${a}²`;
    const wrong2 = isHypUnknown
      ? `Add the lengths directly: ${a} + ${b}`
      : `Subtract the lengths directly: ${c} − ${a}`;
    const wrong3 = `Multiply the sides: ${a} × ${b}`;
    const options = rng.shuffle([correctStr, wrong1, wrong2, wrong3]);
    const questionText = isHypUnknown
      ? `To find unknown hypotenuse c in a right triangle with legs ${a} ${u} and ${b} ${u}, which method is correct?`
      : `To find unknown leg b in a right triangle with hypotenuse ${c} ${u} and leg ${a} ${u}, which method is correct?`;
    return {
      category: 'triples-and-method',
      visual: 'right-triangle',
      questionText,
      options,
      correctAnswer: correctStr,
      explanation: isHypUnknown
        ? `Hypotenuse is the longest side, so add the squares of the two legs.`
        : `To find a shorter leg, subtract the square of the known leg from the square of the hypotenuse.`,
      hint1: isHypUnknown ? `Finding the longest side requires adding squares.` : `Finding a shorter side requires subtracting squares.`,
      hint2: isHypUnknown ? `c² = a² + b² (Add)` : `b² = c² − a² (Subtract)`,
      visualData: { find: isHypUnknown ? 'hyp' : 'leg', mode: 'int', a, b, c, labels: genLabels(rng), unknown: isHypUnknown ? 'c' : 'b', unit: u }
    };
  }
}

// --- WORLD 5: Decimal Docks (decimal-answers) ---
function genWorld5(qIdx, rng) {
  const type = qIdx % 2;
  if (type === 0) {
    const e = DECIMAL_HYP[qIdx % DECIMAL_HYP.length];
    const { a, b, c2, answer } = e;
    const lab = genLabels(rng);
    const { options, correctAnswer } = makeOptions(
      answer,
      [a + b, c2, Math.round(Math.sqrt(Math.abs(b * b - a * a)) * 10) / 10, Math.round((answer + 0.1) * 10) / 10],
      rng,
      { mode: 'dec1', unit: 'cm' }
    );
    const phrases = [
      `The legs of a right-angled triangle are ${a} cm and ${b} cm. Find the hypotenuse, correct to 1 decimal place.`,
      `Calculate the hypotenuse of △${lab.vertices.join('')} with legs ${a} cm and ${b} cm (rounded to 1 d.p.).`,
      `Find the longest side of a right triangle with perpendicular sides ${a} cm and ${b} cm (to 1 decimal place).`
    ];
    return {
      category: 'decimal-answers',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${c2}, so the hypotenuse = √${c2} ≈ ${fmt1(answer)} cm (1 d.p.).`,
      hint1: `The hypotenuse is opposite the right angle. Add the squares of the legs, then take the square root.`,
      hint2: `${a}² + ${b}² = ${c2}. Calculate √${c2} and round to 1 decimal place.`,
      visualData: { find: 'hyp', mode: 'dec1', a, b, labels: lab, unknown: 'c' }
    };
  } else {
    const e = DECIMAL_LEG[qIdx % DECIMAL_LEG.length];
    const { c, b, d2, answer } = e;
    const { options, correctAnswer } = makeOptions(
      answer,
      [c - b, c + b, d2, Math.round(Math.sqrt(c * c + b * b) * 10) / 10],
      rng,
      { mode: 'dec1', unit: 'm' }
    );
    const phrases = [
      `A ladder ${c} m long leans against a wall with its foot ${b} m from the base. How high does it reach, correct to 1 decimal place?`,
      `In a right triangle, hypotenuse = ${c} m and one leg = ${b} m. Find the length of the other leg to 1 d.p.`,
      `A support beam of length ${c} m connects to a floor anchor ${b} m from a vertical pillar. Find the height reached (to 1 d.p.).`
    ];
    return {
      category: 'decimal-answers',
      visual: 'ladder',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `${c}² − ${b}² = ${sq(c)} − ${sq(b)} = ${d2}, so the height = √${d2} ≈ ${fmt1(answer)} m (1 d.p.).`,
      hint1: `The ladder is the hypotenuse. To find a shorter leg, subtract the squares.`,
      hint2: `${c}² − ${b}² = ${d2}. Calculate √${d2} and round to 1 decimal place.`,
      visualData: { find: 'leg', mode: 'dec1', c, b, unknown: 'a', unit: 'm' }
    };
  }
}

// --- WORLD 6: Double-Triangle Depot (composite-two-triangles) ---
function genWorld6(qIdx, rng) {
  const type = qIdx % 3;
  if (type === 0) {
    // Isosceles height: half-base a, height b, equal sides c
    const [a, b, c] = TRIPLES[qIdx % TRIPLES.length];
    const base = 2 * a;
    const u = (qIdx % 2 === 0) ? 'cm' : 'm';
    const { options, correctAnswer } = makeOptions(b, [sq(b), c - a, base, b + 2], rng, { mode: 'int', unit: u });
    const phrases = [
      `An isosceles triangle has two equal sides of ${c} ${u} and a base of ${base} ${u}. Find its vertical height.`,
      `Find the perpendicular height of a triangular roof truss with rafters of ${c} ${u} and span ${base} ${u}.`,
      `An isosceles gable wall has equal rafters of ${c} ${u} and a base width of ${base} ${u}. Calculate the central peak height.`
    ];
    return {
      category: 'composite-two-triangles',
      visual: 'isosceles-height',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `Dividing the base in half gives ${a} ${u}. In the right-angled triangle, ${c}² − ${a}² = ${sq(c)} − ${sq(a)} = ${sq(b)}, so height = √${sq(b)} = ${b} ${u}.`,
      hint1: `The vertical height bisects the base into two equal segments of ${a} ${u} each.`,
      hint2: `Apply Pythagoras to one half: height² = ${c}² − ${a}² = ${sq(b)}.`,
      visualData: { find: 'leg', mode: 'int', b: a, c, a: b, equal: c, base, height: b, unit: u }
    };
  } else if (type === 1) {
    // Rectangle diagonal: width a, height b, diagonal c
    const [a, b, c] = TRIPLES[qIdx % TRIPLES.length];
    const u = (qIdx % 2 === 0) ? 'cm' : 'm';
    const { options, correctAnswer } = makeOptions(c, [a + b, sq(a) + sq(b), Math.abs(b - a), c + 2], rng, { mode: 'int', unit: u });
    const phrases = [
      `A rectangle has width ${a} ${u} and height ${b} ${u}. Find the length of its diagonal.`,
      `A rectangular field measures ${a} ${u} by ${b} ${u}. What is the straight-line distance across opposite corners?`,
      `Calculate the diagonal brace needed for a rectangular gate measuring ${a} ${u} by ${b} ${u}.`
    ];
    return {
      category: 'composite-two-triangles',
      visual: 'rectangle-diagonal',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `The diagonal divides the rectangle into two right-angled triangles: ${sq(a)} + ${sq(b)} = ${sq(c)}, so diagonal = √${sq(c)} = ${c} ${u}.`,
      hint1: `The diagonal acts as the hypotenuse of a right-angled triangle formed with the width and height.`,
      hint2: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(c)}. √${sq(c)} = ${c}.`,
      visualData: { find: 'hyp', mode: 'int', a, b, c, w: a, h: b, d: c, unit: u }
    };
  } else {
    // Two-step chain: varied chain configurations
    const CHAINS = [
      { t1a: 6, t1b: 8, t1c: 10, t2leg2: 24, t2hyp: 26 },
      { t1a: 3, t1b: 4, t1c: 5, t2leg2: 12, t2hyp: 13 },
      { t1a: 9, t1b: 12, t1c: 15, t2leg2: 20, t2hyp: 25 },
      { t1a: 12, t1b: 16, t1c: 20, t2leg2: 21, t2hyp: 29 },
      { t1a: 5, t1b: 12, t1c: 13, t2leg2: 84, t2hyp: 85 }
    ];
    const chain = CHAINS[qIdx % CHAINS.length];
    const { t1a, t1b, t1c, t2leg2, t2hyp } = chain;
    const labels = [['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['K', 'L', 'M', 'N'], ['W', 'X', 'Y', 'Z']][qIdx % 4];
    const [pA, pB, pC, pD] = labels;
    const { options, correctAnswer } = makeOptions(t2hyp, [t1c, t2leg2 + t1b, sq(t2hyp), t2hyp + 4], rng, { mode: 'int', unit: 'm' });
    return {
      category: 'composite-two-triangles',
      visual: 'chain-quad',
      questionText: `In quadrilateral ${labels.join('')} with right angles at ${pB} and ${pC}, ${pA}${pB} = ${t1a} m, ${pB}${pC} = ${t1b} m, and ${pC}${pD} = ${t2leg2} m. Find length ${pA}${pD}.`,
      options,
      correctAnswer,
      explanation: `Step 1: In △${pA}${pB}${pC}, ${pA}${pC}² = ${t1a}² + ${t1b}² = ${sq(t1c)}, so ${pA}${pC} = ${t1c} m. Step 2: In △${pA}${pC}${pD}, ${pA}${pD}² = ${t1c}² + ${t2leg2}² = ${sq(t2hyp)}, so ${pA}${pD} = ${t2hyp} m.`,
      hint1: `Find intermediate diagonal ${pA}${pC} first using the first right-angled triangle.`,
      hint2: `${pA}${pC} = ${t1c} m. Then ${pA}${pD}² = ${t1c}² + ${t2leg2}² = ${sq(t2hyp)}.`,
      visualData: { find: 'hyp', mode: 'int', a: t1c, b: t2leg2, c: t2hyp, ab: t1a, bc: t1b, cd: t2leg2, ad: t2hyp, unit: 'm' }
    };
  }
}

// --- WORLD 7: Ladder & Ramp Yard (real-world-structures) ---
function genWorld7(qIdx, rng) {
  const type = qIdx % 3;
  if (type === 0) {
    // Flagpole / Mast wire
    const [a, b, c] = TRIPLES[qIdx % TRIPLES.length];
    const { options, correctAnswer } = makeOptions(b, [c - a, c + a, sq(b), b + 2], rng, { mode: 'int', unit: 'm' });
    const phrases = [
      `A stay-wire of length ${c} m connects the top of a flagpole to a ground anchor ${a} m from its base. How tall is the flagpole?`,
      `A communications mast has a support cable of length ${c} m pinned to the ground ${a} m from its base. Find mast height.`,
      `A vertical radio tower is anchored by a guy wire of ${c} m fixed ${a} m away. Calculate the tower's vertical height.`
    ];
    return {
      category: 'real-world-structures',
      visual: 'flagpole',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `The wire is the hypotenuse: height² = ${c}² − ${a}² = ${sq(c)} − ${sq(a)} = ${sq(b)}, so height = ${b} m.`,
      hint1: `The wire forms the hypotenuse with the flagpole and the ground. Subtract the squares.`,
      hint2: `${c}² − ${a}² = ${sq(c)} − ${sq(a)} = ${sq(b)}. √${sq(b)} = ${b}.`,
      visualData: { find: 'leg', mode: 'int', b: a, c, a: b, wire: c, peg: a, height: b, unit: 'm' }
    };
  } else if (type === 1) {
    // Wheelchair ramp: use DECIMAL_HYP for genuine decimal values
    const e = DECIMAL_HYP[qIdx % DECIMAL_HYP.length];
    const { a, b, c2, answer } = e;
    const { options, correctAnswer } = makeOptions(answer, [a + b, Math.abs(b - a), c2, Math.round((answer + 0.4) * 10) / 10], rng, { mode: 'dec1', unit: 'm' });
    const phrases = [
      `A wheelchair ramp has a horizontal run of ${b} m and a vertical rise of ${a} m. Find the slanted ramp length (to 1 d.p.).`,
      `An access ramp is built with base run ${b} m and vertical height ${a} m. Find the length of the incline (correct to 1 d.p.).`,
      `A pedestrian loading ramp spans a horizontal distance of ${b} m with a vertical climb of ${a} m. Calculate ramp length (1 d.p.).`
    ];
    return {
      category: 'real-world-structures',
      visual: 'ramp',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `Ramp² = ${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${c2}, so ramp length = √${c2} ≈ ${fmt1(answer)} m.`,
      hint1: `The slanted ramp surface is the hypotenuse. Add the squares of the rise and run.`,
      hint2: `${a}² + ${b}² = ${c2}. Calculate √${c2} and round to 1 decimal place.`,
      visualData: { find: 'hyp', mode: 'dec1', a, b, length: answer, run: b, rise: a, unit: 'm' }
    };
  } else {
    // Ladder reaching ledge
    const [a, b, c] = TRIPLES[(qIdx + 2) % TRIPLES.length];
    const { options, correctAnswer } = makeOptions(b, [c - a, c + a, sq(b), b + 2], rng, { mode: 'int', unit: 'm' });
    const phrases = [
      `A painter places a ${c} m ladder against a wall with its base ${a} m away. How high does the ladder reach?`,
      `A firefighter ladder of length ${c} m is set ${a} m away from a building wall. Find the vertical height reached.`,
      `A maintenance worker props a ${c} m ladder against a warehouse facade, ${a} m out from the wall. What height is attained?`
    ];
    return {
      category: 'real-world-structures',
      visual: 'ladder',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `${c}² − ${a}² = ${sq(c)} − ${sq(a)} = ${sq(b)}, so height = √${sq(b)} = ${b} m.`,
      hint1: `The ladder is the hypotenuse. Subtract the squares to find the vertical leg.`,
      hint2: `${c}² − ${a}² = ${sq(b)}. √${sq(b)} = ${b}.`,
      visualData: { find: 'leg', mode: 'int', b: a, c, a: b, ladder: c, foot: a, height: b, unit: 'm' }
    };
  }
}

// --- WORLD 8: Shortcut City (real-world-distance) ---
function genWorld8(qIdx, rng) {
  const type = qIdx % 3;
  if (type === 0) {
    // TV diagonal
    const base = TRIPLES[qIdx % TRIPLES.length];
    const k = [2, 3, 4, 5, 10][qIdx % 5];
    const [a, b, c] = [base[0] * k, base[1] * k, base[2] * k];
    const { options, correctAnswer } = makeOptions(c, [a + b, Math.abs(b - a), c + 10, c - 5], rng, { mode: 'int', unit: 'cm' });
    const phrases = [
      `A computer monitor is ${b} cm wide and ${a} cm high. What is its diagonal screen measurement?`,
      `A television display panel measures ${b} cm wide by ${a} cm high. Calculate its diagonal length in cm.`,
      `A digital billboard screen has dimensions ${b} cm across and ${a} cm down. Find the diagonal corner-to-corner length.`
    ];
    return {
      category: 'real-world-distance',
      visual: 'tv-screen',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `${b}² + ${a}² = ${sq(b)} + ${sq(a)} = ${sq(c)}, so diagonal = √${sq(c)} = ${c} cm.`,
      hint1: `The diagonal connects opposite corners of the screen, forming a right-angled triangle.`,
      hint2: `${b}² + ${a}² = ${sq(b)} + ${sq(a)} = ${sq(c)}. √${sq(c)} = ${c}.`,
      visualData: { find: 'hyp', mode: 'int', a, b, c, w: b, h: a, d: c, unit: 'cm' }
    };
  } else if (type === 1) {
    // Field shortcut saving
    const base = TRIPLES[qIdx % TRIPLES.length];
    const k = [2, 3, 5, 10][qIdx % 4];
    const [a, b, c] = [base[0] * k, base[1] * k, base[2] * k];
    const saving = (a + b) - c;
    const { options, correctAnswer } = makeOptions(saving, [c, a + b, Math.abs(b - a), saving + 10], rng, { mode: 'int', unit: 'm' });
    const phrases = [
      `A rectangular park is ${a} m by ${b} m. How much walking distance is saved by taking the direct diagonal path instead of walking along the two edges?`,
      `Students cut diagonally across a rectangular sports field (${a} m by ${b} m). Compared to walking around the two perimeter edges, how much distance is saved?`,
      `A rectangular campus quad measures ${a} m by ${b} m. Find the distance saved by crossing directly from corner to opposite corner.`
    ];
    return {
      category: 'real-world-distance',
      visual: 'field-shortcut',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `Edges path = ${a} + ${b} = ${a + b} m. Diagonal = √(${a}² + ${b}²) = ${c} m. Saving = ${a + b} − ${c} = ${saving} m.`,
      hint1: `First calculate the diagonal length, then find how much shorter it is than walking around the sides.`,
      hint2: `Diagonal = ${c} m. Side path = ${a + b} m. Difference = ${a + b} − ${c} = ${saving} m.`,
      visualData: { find: 'num', val: saving, a, b, c, w: b, h: a, d: c, unit: 'm' }
    };
  } else {
    // Drone flight route
    const [a, b, c] = TRIPLES[(qIdx + 1) % TRIPLES.length];
    const { options, correctAnswer } = makeOptions(c, [a + b, Math.abs(b - a), sq(c), c + 3], rng, { mode: 'int', unit: 'km' });
    const phrases = [
      `A survey drone flies ${a} km due North, then turns and flies ${b} km due East. What is its direct distance from the launch station?`,
      `A rescue helicopter travels ${a} km North, then flies ${b} km East. What is the direct straight-line distance back to base?`,
      `An explorer treks ${a} km South, then turns 90° and walks ${b} km West. Find the direct distance from start to finish.`
    ];
    return {
      category: 'real-world-distance',
      visual: 'right-triangle',
      questionText: phrases[qIdx % phrases.length],
      options,
      correctAnswer,
      explanation: `North and East directions are at 90°: direct distance² = ${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(c)}, so distance = √${sq(c)} = ${c} km.`,
      hint1: `North and East form a perpendicular 90° right angle. Add the squares.`,
      hint2: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(c)}. √${sq(c)} = ${c}.`,
      visualData: { find: 'hyp', mode: 'int', a, b, c, labels: genLabels(rng), unknown: 'c', unit: 'km' }
    };
  }
}

// --- WORLD 9: Grand Skyline Finale (mixed-review) ---
function genWorld9(qIdx, rng) {
  // World 9 draws cyclically from Worlds 0 through 8 to guarantee broad review coverage (>= 5 categories)
  const sourceWorld = qIdx % 9;
  switch (sourceWorld) {
    case 0: return genWorld0(qIdx, rng);
    case 1: return genWorld1(qIdx, rng);
    case 2: return genWorld2(qIdx, rng);
    case 3: return genWorld3(qIdx, rng);
    case 4: return genWorld4(qIdx, rng);
    case 5: return genWorld5(qIdx, rng);
    case 6: return genWorld6(qIdx, rng);
    case 7: return genWorld7(qIdx, rng);
    case 8: return genWorld8(qIdx, rng);
    default: return genWorld6(qIdx, rng);
  }
}

/* =========================================================================
   PUBLIC QUESTION GENERATION API
   ========================================================================= */

export function generateQuestion(worldId, qIdxInWorld, rng) {
  let q;
  switch (worldId) {
    case 0: q = genWorld0(qIdxInWorld, rng); break;
    case 1: q = genWorld1(qIdxInWorld, rng); break;
    case 2: q = genWorld2(qIdxInWorld, rng); break;
    case 3: q = genWorld3(qIdxInWorld, rng); break;
    case 4: q = genWorld4(qIdxInWorld, rng); break;
    case 5: q = genWorld5(qIdxInWorld, rng); break;
    case 6: q = genWorld6(qIdxInWorld, rng); break;
    case 7: q = genWorld7(qIdxInWorld, rng); break;
    case 8: q = genWorld8(qIdxInWorld, rng); break;
    case 9: q = genWorld9(qIdxInWorld, rng); break;
    default: q = genWorld0(qIdxInWorld, rng); break;
  }

  return {
    id: `w${worldId}_q${qIdxInWorld}`,
    districtId: worldId,
    category: q.category,
    visual: q.visual,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    hint1: q.hint1,
    hint2: q.hint2,
    visualData: q.visualData
  };
}

/**
 * Generate a complete 100-question bank across all 10 worlds with distinct questions per world.
 */
export function generateBank(seed = 12345) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  function next() {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const rng = {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: arr => arr[Math.floor(next() * arr.length)],
    shuffle: arr => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
  };

  const bank = [];
  for (let w = 0; w < 10; w++) {
    const seenTexts = new Set();
    let qIdx = 0;
    let attempts = 0;
    while (seenTexts.size < 10 && attempts < 500) {
      attempts++;
      const q = generateQuestion(w, qIdx, rng);
      if (!seenTexts.has(q.questionText)) {
        seenTexts.add(q.questionText);
        bank.push({ ...q, id: `w${w}_q${seenTexts.size - 1}` });
      }
      qIdx++;
    }
    if (seenTexts.size < 10) {
      throw new Error(`Failed to generate 10 distinct questions for world ${w} (got ${seenTexts.size}/10)`);
    }
  }
  return bank;
}

/**
 * Generate a session of `count` questions for `worldIdx` with de-duplication (TRD §6.5).
 */
export function generateSession(worldIdx, count, rng) {
  const seenTexts = new Set();
  const list = [];
  const startOffset = rng && typeof rng.int === 'function' ? rng.int(0, 40) : Math.floor(Math.random() * 40);
  let idx = startOffset;
  let retries = 0;

  while (list.length < count && retries < count * 30) {
    const q = generateQuestion(worldIdx, idx, rng);
    if (!seenTexts.has(q.questionText)) {
      seenTexts.add(q.questionText);
      list.push(q);
    }
    idx++;
    retries++;
  }

  // Fallback if needed
  while (list.length < count) {
    list.push(generateQuestion(worldIdx, list.length + idx, rng));
  }

  return list;
}

export const questionBank = generateBank(12345);
