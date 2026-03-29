import { STARTER_COINS } from './types';

const LEVEL_STORAGE_KEY = 'liquid-sort-level';
const COINS_STORAGE_KEY = 'liquid-sort-coins';

function readStoredNumber(key: string, fallback: number, isValid: (value: number) => boolean): number {
  try {
    const savedValue = localStorage.getItem(key);

    if (!savedValue) {
      return fallback;
    }

    const parsedValue = Number.parseInt(savedValue, 10);

    return Number.isFinite(parsedValue) && isValid(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage failures so gameplay still works in restricted environments.
  }
}

export function getSavedLevel(): number {
  return readStoredNumber(LEVEL_STORAGE_KEY, 1, (value) => value >= 1);
}

export function saveLevel(level: number): void {
  writeStoredNumber(LEVEL_STORAGE_KEY, level);
}

export function getSavedCoins(): number {
  return readStoredNumber(COINS_STORAGE_KEY, STARTER_COINS, (value) => value >= 0);
}

export function saveCoins(coins: number): void {
  writeStoredNumber(COINS_STORAGE_KEY, coins);
}

export function clearSave(): void {
  try {
    localStorage.removeItem(LEVEL_STORAGE_KEY);
    localStorage.removeItem(COINS_STORAGE_KEY);
  } catch {
    // Ignore storage failures so gameplay still works in restricted environments.
  }
}
