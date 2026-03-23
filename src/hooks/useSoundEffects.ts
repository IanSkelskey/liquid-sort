import { useEffect, useCallback } from 'react';
import { playSoundEffect, primeSoundEffects, type SoundEffectName } from '../audio/sfx';

export function useSoundEffects() {
  useEffect(() => {
    primeSoundEffects();
  }, []);

  const play = useCallback((name: SoundEffectName, options?: { volume?: number }) => {
    playSoundEffect(name, options);
  }, []);

  return { play };
}
