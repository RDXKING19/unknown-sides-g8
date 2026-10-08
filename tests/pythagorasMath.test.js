import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRIPLES,
  DECIMAL_HYP,
  DECIMAL_LEG,
  sq,
  root1dp,
  isExactTriangle,
  isClean1dp,
  scaleTriple,
  genLabels,
  makeOptions,
  validateRightTriangleData,
  answerFromVisualData
} from '../src/utils/pythagorasMath.js';
import { createRNG } from '../src/utils/rng.js';

test('pythagorasMath - Pool Sizes', () => {
  assert.equal(TRIPLES.length, 17, 'TRIPLES pool must contain exactly 17 entries (c <= 41)');
  assert.equal(DECIMAL_HYP.length, 156, 'DECIMAL_HYP pool must contain exactly 156 entries');
  assert.equal(DECIMAL_LEG.length, 213, 'DECIMAL_LEG pool must contain exactly 213 entries');
});

test('pythagorasMath - Integer Triples Geometry', () => {
  for (const [a, b, c] of TRIPLES) {
    assert.ok(a < b, `Leg a (${a}) must be strictly less than b (${b})`);
    assert.ok(b < c, `Leg b (${b}) must be strictly less than hypotenuse c (${c})`);
    assert.equal(sq(a) + sq(b), sq(c), `${a}² + ${b}² must equal ${c}²`);
    assert.ok(isExactTriangle({ a, b, c }), `isExactTriangle must validate [${a}, ${b}, ${c}]`);
  }
});

test('pythagorasMath - Decimal Hypotenuse Pool Integrity', () => {
  for (const { a, b, c2, answer } of DECIMAL_HYP) {
    assert.equal(sq(a) + sq(b), c2, `${a}² + ${b}² must equal c2 (${c2})`);
    assert.ok(isClean1dp(c2), `${c2} must satisfy isClean1dp`);
    assert.equal(root1dp(c2), answer, `root1dp(${c2}) must equal answer (${answer})`);
    assert.equal(typeof answer, 'number');
  }
});

test('pythagorasMath - Decimal Leg Pool Integrity', () => {
  for (const { c, b, d2, answer } of DECIMAL_LEG) {
    assert.ok(c > b, `Hypotenuse ${c} must exceed leg ${b}`);
    assert.equal(sq(c) - sq(b), d2, `${c}² - ${b}² must equal d2 (${d2})`);
    assert.ok(isClean1dp(d2), `${d2} must satisfy isClean1dp`);
    assert.equal(root1dp(d2), answer, `root1dp(${d2}) must equal answer (${answer})`);
  }
});

test('pythagorasMath - Tenths Exactness with Scale Factors', () => {
  for (const s of [0.1, 0.5, 1, 2, 5]) {
    for (const triple of TRIPLES.slice(0, 5)) {
      const [a, b, c] = scaleTriple(triple, s);
      assert.ok(isExactTriangle({ a, b, c }), `Scaled triple [${a}, ${b}, ${c}] by ${s} must be exact`);
    }
  }
});

test('pythagorasMath - makeOptions formatting and distractors', () => {
  const rng = createRNG(42);

  // Mode 'int'
  const intRes = makeOptions(13, [12, 14, 5], rng, { mode: 'int', unit: 'cm' });
  assert.equal(intRes.options.length, 4);
  assert.equal(new Set(intRes.options).size, 4, 'Options must be 4 unique strings');
  assert.ok(intRes.options.includes('13 cm'));
  assert.equal(intRes.correctAnswer, '13 cm');

  // Mode 'dec1'
  const decRes = makeOptions(7.2, [8.0, 6.5, 9.1], rng, { mode: 'dec1', unit: 'm' });
  assert.equal(decRes.options.length, 4);
  assert.equal(new Set(decRes.options).size, 4);
  for (const opt of decRes.options) {
    assert.match(opt, /^\d+\.\d m$/, `Option ${opt} must match 1 d.p. format`);
  }
  assert.equal(decRes.correctAnswer, '7.2 m');
});

test('pythagorasMath - Vertex Labels and Rotations', () => {
  const rng = createRNG(101);
  for (let i = 0; i < 20; i++) {
    const lab = genLabels(rng);
    assert.equal(lab.vertices.length, 3);
    assert.ok(lab.vertices.includes(lab.right));
    assert.equal(lab.legs.length, 2);
    assert.equal(lab.hyp.length, 2);
    assert.ok(!lab.hyp.includes(lab.right), 'Hypotenuse letters must not include right angle vertex');
  }
});

test('pythagorasMath - validateRightTriangleData and answerFromVisualData', () => {
  const exactHyp = { find: 'hyp', mode: 'int', a: 3, b: 4, c: 5 };
  assert.ok(validateRightTriangleData(exactHyp));
  assert.equal(answerFromVisualData(exactHyp), 5);

  const exactLeg = { find: 'leg', mode: 'int', a: 3, b: 4, c: 5 };
  assert.ok(validateRightTriangleData(exactLeg));
  assert.equal(answerFromVisualData(exactLeg), 3);

  const decHyp = { find: 'hyp', mode: 'dec1', a: 5, b: 7 };
  assert.ok(validateRightTriangleData(decHyp));
  assert.equal(answerFromVisualData(decHyp), root1dp(25 + 49));

  const numData = { find: 'num', val: 42 };
  assert.ok(validateRightTriangleData(numData));
  assert.equal(answerFromVisualData(numData), 42);
});
