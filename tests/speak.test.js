import test from 'node:test';
import assert from 'node:assert/strict';
import { numberToWords, speak } from '../src/utils/speak.js';

test('speak - numberToWords conversions', () => {
  assert.equal(numberToWords(0), 'zero');
  assert.equal(numberToWords(7), 'seven');
  assert.equal(numberToWords(14), 'fourteen');
  assert.equal(numberToWords(42), 'forty-two');
  assert.equal(numberToWords(100), 'one hundred');
  assert.equal(numberToWords(108), 'one hundred and eight');
  assert.equal(numberToWords(250), 'two hundred and fifty');
  assert.equal(numberToWords(1000), 'one thousand');
  assert.equal(numberToWords(24000), 'twenty-four thousand');
  assert.equal(numberToWords(100500), 'one hundred thousand five hundred');
});

test('speak - Notation to Spoken Words Transformations', () => {
  // 1 d.p.
  assert.equal(speak('correct to 1 d.p.'), 'correct to one decimal place');

  // Degree symbols
  assert.equal(speak('a 90° right angle'), 'a ninety degrees right angle');

  // Powers and brackets
  assert.equal(speak('(a + b)²'), 'a plus b, all squared');
  assert.equal(speak('a² + b² = c²'), 'a squared plus b squared equals c squared');
  assert.equal(speak('5² = 25'), 'five squared equals twenty-five');

  // Roots
  assert.equal(speak('√169 = 13'), 'the square root of one hundred and sixty-nine equals thirteen');

  // Math operators
  assert.equal(speak('25 − 9 = 16'), 'twenty-five minus nine equals sixteen');
  assert.equal(speak('10 × 4 ÷ 2'), 'ten times four divided by two');
  assert.equal(speak('x ≈ 7.2'), 'x is approximately seven point two');

  // Decimals
  assert.equal(speak('3.14'), 'three point one four');
  assert.equal(speak('12.5 m'), 'twelve point five metres');

  // Units
  assert.equal(speak('15 cm and 20 m'), 'fifteen centimetres and twenty metres');

  // Vertex tokens (PQRABCXYZLMNDEF) vs acronyms (HDB, TV)
  assert.equal(speak('In triangle ABC with hypotenuse PR'), 'In triangle A B C with hypotenuse P R');
  assert.equal(speak('Watching TV in an HDB block'), 'Watching TV in an HDB block');
});
