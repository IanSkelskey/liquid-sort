import { useEffect, useRef, useState } from 'react';
import { playSoundEffect } from '../../audio/sfx';

const REVEAL_FLASH_MS = 500;
const EMPTY_REVEALED_SEGMENTS = new Set<number>();

export function useRevealedSegments(
  hiddenMask: boolean[],
  segmentCount: number,
  enabled: boolean
): Set<number> {
  const previousHiddenRef = useRef(hiddenMask);
  const [revealedSegments, setRevealedSegments] = useState<Set<number>>(EMPTY_REVEALED_SEGMENTS);

  useEffect(() => {
    if (!enabled) {
      previousHiddenRef.current = hiddenMask;
      const clearTimer = window.setTimeout(() => {
        setRevealedSegments(EMPTY_REVEALED_SEGMENTS);
      }, 0);

      return () => {
        window.clearTimeout(clearTimer);
      };
    }

    const previousHidden = previousHiddenRef.current;
    const nextRevealedSegments = new Set<number>();

    for (let index = 0; index < segmentCount; index += 1) {
      if (previousHidden[index] && !hiddenMask[index]) {
        nextRevealedSegments.add(index);
      }
    }

    previousHiddenRef.current = hiddenMask;

    if (nextRevealedSegments.size === 0) {
      return;
    }

    playSoundEffect('reveal');

    const showTimer = window.setTimeout(() => {
      setRevealedSegments(nextRevealedSegments);
    }, 0);

    const clearTimer = window.setTimeout(() => {
      setRevealedSegments(EMPTY_REVEALED_SEGMENTS);
    }, REVEAL_FLASH_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(clearTimer);
    };
  }, [enabled, hiddenMask, segmentCount]);

  return enabled ? revealedSegments : EMPTY_REVEALED_SEGMENTS;
}
