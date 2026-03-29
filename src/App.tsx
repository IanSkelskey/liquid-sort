import { useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { GameScreen } from './components/GameScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { SceneBackground } from './components/SceneBackground';
import SplashScreen from './components/SplashScreen';
import { useAppAudioBootstrap } from './hooks/useAppAudioBootstrap';

type Screen = 'splash' | 'howToPlay' | 'game';

function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('splash');
  useAppAudioBootstrap();

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
