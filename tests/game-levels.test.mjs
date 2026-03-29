import assert from 'node:assert/strict';
import * as engine from '../src/game/engine.ts';
import * as levels from '../src/game/levels.ts';

function isSolvedLayout(vials) {
  return vials.every((vial) => vial.length === 0 || vial.every((color) => color === vial[0]));
}

export function runGameLevelsTests() {
  for (let level = 1; level <= 60; level += 1) {
    const state = levels.createGameState(level, 0);

    assert.equal(isSolvedLayout(state.vials), false, `Level ${level} started solved`);
    assert.equal(
      engine.analyzeMoveAvailability(state).hasMovesLeft,
      true,
      `Level ${level} started with no moves`
    );
  }

  const original = levels.generateLevel(28);
  const repeated = levels.generateLevel(28);

  assert.deepEqual(repeated, original);

  original[0][0] = '__mutated__';

  const regenerated = levels.generateLevel(28);
  assert.notDeepEqual(regenerated, original);
  assert.deepEqual(regenerated, repeated);
}
