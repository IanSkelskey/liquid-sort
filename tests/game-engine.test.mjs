import assert from 'node:assert/strict';
import * as engine from '../src/game/engine.ts';

function createState(overrides = {}) {
  return {
    vials: [['red'], []],
    hidden: [[false], []],
    vialModifiers: ['none', 'none'],
    selectedVial: null,
    moveHistory: [],
    level: 1,
    moveCount: 0,
    coins: 0,
    addedVial: false,
    won: false,
    ...overrides,
  };
}

export function runGameEngineTests() {
  const inOnlySourceState = createState({
    vialModifiers: ['in-only', 'none'],
  });
  assert.equal(engine.pour(inOnlySourceState, 0, 1), null);

  const outOnlyTargetState = createState({
    vialModifiers: ['none', 'out-only'],
  });
  assert.equal(engine.pour(outOnlyTargetState, 0, 1), null);

  const analysis = engine.analyzeMoveAvailability(outOnlyTargetState);
  assert.equal(analysis.hasMovesLeft, false);
  assert.ok(analysis.skipCounts['target-blocked-by-modifier'] > 0);

  const expandedState = engine.addEmptyVial(
    createState({
      vialModifiers: ['out-only', 'none'],
    })
  );
  assert.deepEqual(expandedState.vialModifiers, ['out-only', 'none', 'none']);
}
