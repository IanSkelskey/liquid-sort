import { lazy, startTransition, Suspense, useCallback, useEffect, useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { SceneBackground } from './components/SceneBackground';
import { awaitLevelDefinition, preloadLevelDefinition } from './game/levelGeneration/preload';
import { getSavedLevel } from './game/storage';
import SplashScreen from './components/SplashScreen';
import { useAppAudioBootstrap } from './hooks/useAppAudioBootstrap';

const GameScreen = lazy(() => import('./components/GameScreen'));

type Screen = 'splash' | 'howToPlay' | 'game';

function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('splash');
  useAppAudioBootstrap();

  useEffect(() => {
    const savedLevel = getSavedLevel();
    preloadLevelDefinition(savedLevel);
    preloadLevelDefinition(savedLevel + 1);
  }, []);

  const handleStartGame = useCallback(() => {
    const savedLevel = getSavedLevel();
    awaitLevelDefinition(savedLevel).then(() => {
      startTransition(() => setActiveScreen('game'));
    });
  }, []);

  const backgroundVariant = activeScreen === 'game' ? 'game' : 'splash';

  return (
    <SceneBackground variant={backgroundVariant}>
      {activeScreen === 'splash' ? (
        <SplashScreen
          onStart={handleStartGame}
          onHowToPlay={() => startTransition(() => setActiveScreen('howToPlay'))}
        />
      ) : activeScreen === 'howToPlay' ? (
        <HowToPlayScreen
          onBack={() => startTransition(() => setActiveScreen('splash'))}
          onStart={handleStartGame}
        />
      ) : (
        <Suspense>
          <GameScreen onReturnToSplash={() => startTransition(() => setActiveScreen('splash'))} />
        </Suspense>
      )}
      <AudioControls />
    </SceneBackground>
  );
}

export default App;
