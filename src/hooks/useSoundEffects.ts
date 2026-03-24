import { useEffect, useCallback } from 'react';
import { playSoundEffect, primeSoundEffects, type SoundEffectName } from '../audio/sfx';

type PlaySoundEffectOptions = {
  volume?: number;
  durationMs?: number;
};

export function useSoundEffects() {
  useEffect(() => {
    primeSoundEffects();
  }, []);

  const play = useCallback((name: SoundEffectName, options?: PlaySoundEffectOptions) => {
    playSoundEffect(name, options);
  }, []);

  return { play };
}
