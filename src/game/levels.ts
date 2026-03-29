import { getSavedCoins } from './storage';
import { generateLevelDefinition } from './levelGeneration/generator';
import { cloneHidden, cloneVials } from './levelGeneration/utils';
import { revealTopSegments } from './rules';
import { type GameState, type Vial } from './types';

export function generateLevel(level: number): Vial[] {
  return cloneVials(generateLevelDefinition(level).vials);
}

export function createGameState(level: number, coins?: number): GameState {
  const definition = generateLevelDefinition(level);

  return revealTopSegments({
    vials: cloneVials(definition.vials),
    hidden: cloneHidden(definition.hidden),
    selectedVial: null,
    moveHistory: [],
    level,
    moveCount: 0,
    coins: coins ?? getSavedCoins(),
    addedVial: false,
    won: false,
  });
}
