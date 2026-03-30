import type { VialModifier } from './types';

export const DEFAULT_VIAL_MODIFIER: VialModifier = 'none';

export function cloneVialModifiers(vialModifiers: VialModifier[]): VialModifier[] {
  return [...vialModifiers];
}

export function getVialModifier(vialModifiers: VialModifier[], index: number): VialModifier {
  return vialModifiers[index] ?? DEFAULT_VIAL_MODIFIER;
}

export function canUseVialAsSource(modifier: VialModifier = DEFAULT_VIAL_MODIFIER): boolean {
  return modifier !== 'in-only';
}

export function canUseVialAsTarget(modifier: VialModifier = DEFAULT_VIAL_MODIFIER): boolean {
  return modifier !== 'out-only';
}

export function hasVialModifier(modifier: VialModifier): boolean {
  return modifier !== DEFAULT_VIAL_MODIFIER;
}

export function getVialModifierLabel(modifier: VialModifier): string {
  switch (modifier) {
    case 'in-only':
      return 'In only';
    case 'out-only':
      return 'Out only';
    default:
      return 'Normal';
  }
}

export function getVialModifierShortLabel(modifier: VialModifier): string {
  switch (modifier) {
    case 'in-only':
      return 'IN';
    case 'out-only':
      return 'OUT';
    default:
      return '';
  }
}
