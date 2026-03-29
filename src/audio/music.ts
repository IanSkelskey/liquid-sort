const musicSrc = new URL('../assets/music/gameplay.opus', import.meta.url).href;

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(musicSrc);
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
  }
  return audio;
}

export function playMusic(): Promise<boolean> {
  const a = getAudio();
  if (a.paused) {
    return a.play().then(() => true).catch(() => false);
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
