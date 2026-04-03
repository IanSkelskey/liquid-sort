import assert from 'node:assert/strict';
import * as engine from '../src/game/engine.ts';
import { getDifficultyTargets, getLevelConfig } from '../src/game/levelGeneration/config.ts';
import * as levels from '../src/game/levels.ts';

function isSolvedLayout(vials) {
  return vials.every((vial) => vial.length === 0 || vial.every((color) => color === vial[0]));
}

function countCompleteVials(vials) {
  return vials.filter(
    (vial) => vial.length === 4 && vial.every((color) => color === vial[0])
  ).length;
}

function assertCompleteVialLimit(level) {
  const state = levels.createGameState(level, 0);
  const { numColors } = getLevelConfig(level);
  const maxCompleteVials = getDifficultyTargets(level, numColors).maxCompleteVials;
  const completeVials = countCompleteVials(state.vials);

  assert.ok(
    completeVials <= maxCompleteVials,
    `Level ${level} started with ${completeVials} complete vials (max ${maxCompleteVials})`
  );
}

export function runGameLevelsTests() {
  for (let level = 1; level <= 60; level += 1) {
    const state = levels.createGameState(level, 0);

    assert.equal(isSolvedLayout(state.vials), false, `Level ${level} started solved`);
    assert.equal(
      state.vialModifiers.length,
      state.vials.length,
      `Level ${level} did not create a modifier entry for every vial`
    );
    assert.equal(
      engine.analyzeMoveAvailability(state).hasMovesLeft,
      true,
      `Level ${level} started with no moves`
    );
    assertCompleteVialLimit(level);
  }

  const modifierIntroState = levels.createGameState(15, 0);
  assert.ok(
    modifierIntroState.vialModifiers.includes('in-only'),
    'Level 15 should introduce an IN-only vial'
  );

  const directionalState = levels.createGameState(30, 0);
  assert.ok(
    directionalState.vialModifiers.includes('out-only'),
    'Level 30 should include an OUT-only vial'
  );

  for (const level of [115, 150]) {
    assertCompleteVialLimit(level);
  }

  const original = levels.generateLevel(28);
  const repeated = levels.generateLevel(28);

  assert.deepEqual(repeated, original);

  original[0][0] = '__mutated__';

  const regenerated = levels.generateLevel(28);
  assert.notDeepEqual(regenerated, original);
  assert.deepEqual(regenerated, repeated);
}
