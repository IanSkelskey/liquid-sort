export type SoundEffectName = 'pickupVial' | 'levelComplete' | 'pour' | 'vialFull' | 'addVial' | 'popUp';

const soundEffectSources: Record<SoundEffectName, string> = {
  pickupVial: new URL('../../assets/sound/glass_clink.mp3', import.meta.url).href,
  levelComplete: new URL('../../assets/sound/level_complete.mp3', import.meta.url).href,
  pour: new URL('../../assets/sound/bubble.mp3', import.meta.url).href,
  vialFull: new URL('../../assets/sound/vial_full.mp3', import.meta.url).href,
  addVial: new URL('../../assets/sound/glass_clink_2.mp3', import.meta.url).href,
  popUp: new URL('../../assets/sound/pop_up.mp3', import.meta.url).href,
};

const defaultVolumes: Record<SoundEffectName, number> = {
  pickupVial: 0.45,
  levelComplete: 0.6,
  pour: 0.4,
  vialFull: 0.5,
  addVial: 0.5,
  popUp: 0.5,
};

let sfxMasterVolume = 1;
let sfxMuted = false;

export function setSfxVolume(volume: number): void {
  sfxMasterVolume = Math.max(0, Math.min(1, volume));
}

export function getSfxVolume(): number {
  return sfxMasterVolume;
}

export function setSfxMuted(muted: boolean): void {
  sfxMuted = muted;
}

export function isSfxMuted(): boolean {
  return sfxMuted;
}

const soundPools = new Map<SoundEffectName, HTMLAudioElement[]>();
const playbackStopTimers = new WeakMap<HTMLAudioElement, number>();

function getSoundPool(name: SoundEffectName): HTMLAudioElement[] {
  let pool = soundPools.get(name);
  if (!pool) {
    pool = [];
    soundPools.set(name, pool);
  }
  return pool;
}

function createAudioInstance(name: SoundEffectName): HTMLAudioElement {
  const audio = new Audio(soundEffectSources[name]);
  audio.preload = 'auto';
  return audio;
}

export function primeSoundEffects(): void {
  for (const name of Object.keys(soundEffectSources) as SoundEffectName[]) {
    const pool = getSoundPool(name);
    if (pool.length === 0) {
      pool.push(createAudioInstance(name));
    }
    pool[0].load();
  }
}

export function playSoundEffect(
  name: SoundEffectName,
  options?: { volume?: number; durationMs?: number }
): void {
  if (typeof Audio === 'undefined') return;

  const pool = getSoundPool(name);
  const reusableAudio = pool.find((audio) => audio.paused || audio.ended);
  const audio = reusableAudio ?? createAudioInstance(name);

  if (!reusableAudio) {
    pool.push(audio);
  }

  const stopTimer = playbackStopTimers.get(audio);
  if (stopTimer !== undefined) {
    window.clearTimeout(stopTimer);
    playbackStopTimers.delete(audio);
  }

  if (sfxMuted) return;

  audio.currentTime = 0;
  audio.volume = (options?.volume ?? defaultVolumes[name]) * sfxMasterVolume;

  void audio.play().catch(() => {
    // Ignore browser autoplay rejections until the user interacts.
  });

  if (options?.durationMs !== undefined) {
    const timer = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      playbackStopTimers.delete(audio);
    }, options.durationMs);

    playbackStopTimers.set(audio, timer);
  }
}
