export interface LiquidRun {
  color: string;
  count: number;
  startIndex: number;
  topIndex: number;
  hidden: boolean;
  justRevealed: boolean;
}

export function buildLiquidRuns(
  segments: string[],
  hiddenMask: boolean[],
  revealedIndices: Set<number>
): LiquidRun[] {
  return segments.reduce<LiquidRun[]>((runs, color, index) => {
    const hidden = hiddenMask[index] ?? false;
    const previousRun = runs[runs.length - 1];

    if (previousRun && !hidden && !previousRun.hidden && previousRun.color === color) {
      previousRun.count += 1;
      previousRun.topIndex = index;
      previousRun.justRevealed = previousRun.justRevealed || revealedIndices.has(index);
      return runs;
    }

    runs.push({
      color: hidden ? 'var(--vial-hidden-fill)' : color,
      count: 1,
      startIndex: index,
      topIndex: index,
      hidden,
      justRevealed: revealedIndices.has(index),
    });

    return runs;
  }, []);
}
