import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCase, ERROR_TYPES } from '../src/utils/stationCases.js';
import { createRNG } from '../src/utils/rng.js';

test('stationD - 1,500 Generated Cases Integrity across all 5 Error Types', () => {
  const rng = createRNG(777);
  const TOTAL_CASES = 1500;
  const casesPerType = TOTAL_CASES / ERROR_TYPES.length; // 300 each

  let testedCount = 0;

  for (const errType of ERROR_TYPES) {
    for (let i = 0; i < casesPerType; i++) {
      const c = buildCase(rng, errType);
      testedCount++;

      // 1. Structure assertions
      assert.equal(c.type, errType);
      assert.ok(Array.isArray(c.lines), 'lines must be an array');
      assert.equal(c.lines.length, 4, 'Case must present exactly 4 steps of working');
      assert.ok(Number.isInteger(c.faultyIdx), 'faultyIdx must be an integer');
      assert.ok(c.faultyIdx >= 0 && c.faultyIdx < 4, `faultyIdx ${c.faultyIdx} must be between 0 and 3`);

      // 2. Options and fix assertions
      assert.ok(Array.isArray(c.options), 'options must be an array');
      assert.equal(c.options.length, 3, 'Must offer exactly 3 correction options');
      assert.equal(new Set(c.options).size, 3, 'Options must be distinct');
      assert.ok(c.options.includes(c.correctFix), 'correctFix must be present in options');
      assert.notEqual(
        c.lines[c.faultyIdx],
        c.correctFix,
        `Faulty line at index ${c.faultyIdx} cannot already equal the fix`
      );

      // 3. Arithmetic checks per type
      if (errType === 'added-instead-of-subtracted') {
        assert.equal(c.faultyIdx, 1);
        assert.match(c.correctFix, /subtract the squares/);
      } else if (errType === 'skipped-square-root') {
        assert.equal(c.faultyIdx, 3);
        assert.match(c.correctFix, /√/);
      } else if (errType === 'wrong-hypotenuse') {
        assert.equal(c.faultyIdx, 0);
        assert.match(c.correctFix, /hypotenuse/);
      } else if (errType === 'squaring-slip') {
        assert.equal(c.faultyIdx, 2);
        assert.match(c.correctFix, /h² = \d+ \+ \d+ = \d+/);
      } else if (errType === 'rounding-slip') {
        assert.equal(c.faultyIdx, 3);
        assert.match(c.correctFix, /1 d\.p\./);
      }
    }
  }

  assert.equal(testedCount, TOTAL_CASES);
});
