type MusicSource = {
  src: string;
  type: string;
};

const musicSources: MusicSource[] = [
  {
    src: new URL('../assets/music/gameplay.mp3', import.meta.url).href,
    type: 'audio/mpeg',
  },
  {
    src: new URL('../assets/music/gameplay.opus', import.meta.url).href,
    type: 'audio/ogg; codecs="opus"',
  },
];

let audio: HTMLAudioElement | null = null;

function resolveMusicSource(): string {
  if (typeof Audio === 'undefined') {
    return musicSources[0].src;
  }

  const probe = new Audio();
  const supportedSource = musicSources.find((source) => probe.canPlayType(source.type) !== '');

  return supportedSource?.src ?? musicSources[0].src;
}

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(resolveMusicSource());
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
  }
  return audio;
}

export function primeMusic(): void {
  if (typeof Audio === 'undefined') {
    return;
  }

  const music = getAudio();
  if (music.readyState === 0) {
    music.load();
  }
}

export function playMusic(): Promise<boolean> {
  const music = getAudio();

  if (music.readyState === 0) {
    music.load();
  }

  if (music.paused) {
    return music.play().then(() => true).catch(() => false);
  }

  return Promise.resolve(true);
}

export function pauseMusic(): void {
  if (audio && !audio.paused) {
    audio.pause();
  }
}

export function setMusicVolume(volume: number): void {
  getAudio().volume = Math.max(0, Math.min(1, volume));
}

export function getMusicVolume(): number {
  return getAudio().volume;
}

export function isMusicPlaying(): boolean {
  return audio ? !audio.paused : false;
}

export function setMusicMuted(muted: boolean): void {
  getAudio().muted = muted;
}

export function isMusicMuted(): boolean {
  return audio ? audio.muted : false;
}
