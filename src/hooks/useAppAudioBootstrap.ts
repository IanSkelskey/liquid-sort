import { useEffect, useRef, useState } from 'react';
import { playMusic } from '../audio/music';
import { primeSoundEffects } from '../audio/sfx';

export function useAppAudioBootstrap(): boolean {
  const [musicStarted, setMusicStarted] = useState(false);
  const audioPrimedRef = useRef(false);

  useEffect(() => {
    if (musicStarted) {
      return;
    }

    const startAudio = () => {
      if (!audioPrimedRef.current) {
        primeSoundEffects();
        audioPrimedRef.current = true;
      }

      void playMusic().then((ok) => {
        if (ok) {
          setMusicStarted(true);
        }
      });
    };

    document.addEventListener('pointerdown', startAudio);
    document.addEventListener('keydown', startAudio);

    return () => {
      document.removeEventListener('pointerdown', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
  }, [musicStarted]);

  return musicStarted;
}
