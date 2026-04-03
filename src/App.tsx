import { startTransition, useEffect, useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { GameScreen } from './components/GameScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { SceneBackground } from './components/SceneBackground';
import { preloadLevelDefinition } from './game/levelGeneration/preload';
import { getSavedLevel } from './game/storage';
import SplashScreen from './components/SplashScreen';
import { useAppAudioBootstrap } from './hooks/useAppAudioBootstrap';

type Screen = 'splash' | 'howToPlay' | 'game';

function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('splash');
  useAppAudioBootstrap();

  useEffect(() => {
    const savedLevel = getSavedLevel();
    preloadLevelDefinition(savedLevel);
    preloadLevelDefinition(savedLevel + 1);
  }, []);

  const backgroundVariant = activeScreen === 'game' ? 'game' : 'splash';

  return (
    <SceneBackground variant={backgroundVariant}>
      {activeScreen === 'splash' ? (
        <SplashScreen
          onStart={() => startTransition(() => setActiveScreen('game'))}
          onHowToPlay={() => startTransition(() => setActiveScreen('howToPlay'))}
        />
      ) : activeScreen === 'howToPlay' ? (
        <HowToPlayScreen
          onBack={() => startTransition(() => setActiveScreen('splash'))}
          onStart={() => startTransition(() => setActiveScreen('game'))}
        />
      ) : (
        <GameScreen onReturnToSplash={() => startTransition(() => setActiveScreen('splash'))} />
      )}
      <AudioControls />
    </SceneBackground>
  );
}

export default App;
