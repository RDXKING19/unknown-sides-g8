import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('stations.wiring - STATIONS Archetypes and Components in SimulatePhase.jsx', () => {
  const filePath = path.resolve('src/components/phases/SimulatePhase.jsx');
  assert.ok(fs.existsSync(filePath), 'SimulatePhase.jsx must exist');

  const content = fs.readFileSync(filePath, 'utf-8');

  // Verify component imports
  assert.match(content, /import\s+{\s*SquareSecretLab\s*}\s+from\s+['"]\.\.\/simulations\/SquareSecretLab\.jsx['"]/);
  assert.match(content, /import\s+{\s*LadderLockIn\s*}\s+from\s+['"]\.\.\/simulations\/LadderLockIn\.jsx['"]/);
  assert.match(content, /import\s+{\s*SiteReportDetective\s*}\s+from\s+['"]\.\.\/simulations\/SiteReportDetective\.jsx['"]/);

  // Extract STATIONS definition
  const match = content.match(/export const STATIONS = (\[[\s\S]*?\]);/);
  assert.ok(match, 'STATIONS export array must be present in SimulatePhase.jsx');

  // Evaluate with mock components
  const SquareSecretLab = () => null;
  const LadderLockIn = () => null;
  const SiteReportDetective = () => null;

  const evalStations = new Function(
    'SquareSecretLab',
    'LadderLockIn',
    'SiteReportDetective',
    `return ${match[1]};`
  );

  const STATIONS = evalStations(SquareSecretLab, LadderLockIn, SiteReportDetective);

  // 3 stations: discovery, build-to-target, error-detective
  assert.equal(STATIONS.length, 3);
  assert.deepEqual(
    STATIONS.map(s => s.archetype),
    ['discovery', 'build-to-target', 'error-detective']
  );

  // Assert every Comp is a function
  STATIONS.forEach((s, idx) => {
    assert.equal(s.id, idx, `Station at index ${idx} must have id ${idx}`);
    assert.equal(typeof s.Comp, 'function', `Station ${s.id} Comp must be a function`);
    assert.ok(s.name, `Station ${s.id} must have a name`);
    assert.ok(s.icon, `Station ${s.id} must have an icon`);
    assert.ok(s.sub, `Station ${s.id} must have a subtitle`);
  });
});
