import { useEffect, useRef, useState } from 'react';
import { playMusic, primeMusic } from '../audio/music';
import { primeSoundEffects, resumeSoundEffects } from '../audio/sfx';

export function useAppAudioBootstrap(): boolean {
  const [musicStarted, setMusicStarted] = useState(false);
  const audioPrimedRef = useRef(false);
  const audioStartInFlightRef = useRef(false);
  const deferredPrimeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    primeMusic();
  }, []);

  useEffect(() => {
    if (musicStarted) {
      return;
    }

    const scheduleDeferredSoundPrime = () => {
      if (deferredPrimeTimerRef.current !== null) {
        return;
      }

      deferredPrimeTimerRef.current = window.setTimeout(() => {
        primeSoundEffects();
        deferredPrimeTimerRef.current = null;
      }, 180);
    };

    const startAudio = () => {
      if (!audioPrimedRef.current) {
        audioPrimedRef.current = true;
        scheduleDeferredSoundPrime();
      }

      void resumeSoundEffects();
      if (audioStartInFlightRef.current) {
        return;
      }

      audioStartInFlightRef.current = true;
      void playMusic().then((ok) => {
        audioStartInFlightRef.current = false;
        if (ok) {
          setMusicStarted(true);
        }
      });
    };

    document.addEventListener('pointerdown', startAudio);
    document.addEventListener('touchstart', startAudio, { passive: true });
    document.addEventListener('mousedown', startAudio);
    document.addEventListener('keydown', startAudio);

    return () => {
      document.removeEventListener('pointerdown', startAudio);
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('mousedown', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
  }, [musicStarted]);

  return musicStarted;
}
