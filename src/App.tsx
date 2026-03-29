import { useEffect, useRef, useState } from 'react';
import { playMusic } from './audio/music';
import { primeSoundEffects } from './audio/sfx';
import { AudioControls } from './components/AudioControls';
import { GameScreen } from './components/GameScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { SceneBackground } from './components/SceneBackground';
import SplashScreen from './components/SplashScreen';

type Screen = 'splash' | 'howToPlay' | 'game';

function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('splash');
  const [musicStarted, setMusicStarted] = useState(false);
  const audioPrimedRef = useRef(false);

  useEffect(() => {
    if (musicStarted) return;

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

  const backgroundVariant = activeScreen === 'game' ? 'game' : 'splash';

  return (
    <SceneBackground variant={backgroundVariant}>
      {activeScreen === 'splash' ? (
        <SplashScreen
          onStart={() => setActiveScreen('game')}
          onHowToPlay={() => setActiveScreen('howToPlay')}
        />
      ) : activeScreen === 'howToPlay' ? (
        <HowToPlayScreen
          onBack={() => setActiveScreen('splash')}
          onStart={() => setActiveScreen('game')}
        />
      ) : (
        <GameScreen onReturnToSplash={() => setActiveScreen('splash')} />
      )}
      <AudioControls />
    </SceneBackground>
  );
}

export default App;
