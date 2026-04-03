export type SoundEffectName =
  | 'pickupVial'
  | 'putDownVial'
  | 'levelComplete'
  | 'pour'
  | 'vialFull'
  | 'addVial'
  | 'popUp'
  | 'reveal'
  | 'shuffle'
  | 'undo'
  | 'noMoves';

const soundEffectSources: Record<SoundEffectName, string> = {
  pickupVial: new URL('../assets/sound/glass_clink.mp3', import.meta.url).href,
  putDownVial: new URL('../assets/sound/glass_clink_3.mp3', import.meta.url).href,
  levelComplete: new URL('../assets/sound/level_complete.mp3', import.meta.url).href,
  pour: new URL('../assets/sound/bubble.mp3', import.meta.url).href,
  vialFull: new URL('../assets/sound/vial_full.mp3', import.meta.url).href,
  addVial: new URL('../assets/sound/glass_clink_2.mp3', import.meta.url).href,
  popUp: new URL('../assets/sound/pop_up.mp3', import.meta.url).href,
  reveal: new URL('../assets/sound/reveal.mp3', import.meta.url).href,
  shuffle: new URL('../assets/sound/shuffle.mp3', import.meta.url).href,
  undo: new URL('../assets/sound/undo.mp3', import.meta.url).href,
  noMoves: new URL('../assets/sound/no_moves.mp3', import.meta.url).href,
};

const defaultVolumes: Record<SoundEffectName, number> = {
  pickupVial: 0.45,
  putDownVial: 0.45,
  levelComplete: 0.6,
  pour: 0.4,
  vialFull: 0.5,
  addVial: 0.5,
  popUp: 0.5,
  reveal: 0.5,
  shuffle: 0.5,
  undo: 0.5,
  noMoves: 0.5,
};

type PlaySoundEffectOptions = {
  volume?: number;
  durationMs?: number;
};

type AudioContextConstructor = new () => AudioContext;
type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

let sfxMasterVolume = 1;
let sfxMuted = false;

const htmlAudioPools = new Map<SoundEffectName, HTMLAudioElement[]>();
const htmlPlaybackStopTimers = new WeakMap<HTMLAudioElement, number>();
const decodedSoundBuffers = new Map<SoundEffectName, AudioBuffer>();
const soundBufferPromises = new Map<SoundEffectName, Promise<AudioBuffer | null>>();

let webAudioContext: AudioContext | null | undefined;
let webAudioMasterGain: GainNode | null = null;

export function setSfxVolume(volume: number): void {
  sfxMasterVolume = Math.max(0, Math.min(1, volume));
  syncWebAudioMasterGain();
}

export function getSfxVolume(): number {
  return sfxMasterVolume;
}

export function setSfxMuted(muted: boolean): void {
  sfxMuted = muted;
  syncWebAudioMasterGain();
}

export function isSfxMuted(): boolean {
  return sfxMuted;
}

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const withWebkit = window as WindowWithWebkitAudioContext;
  return window.AudioContext ?? withWebkit.webkitAudioContext;
}

function getWebAudioContext(): AudioContext | null {
  if (webAudioContext !== undefined) {
    return webAudioContext;
  }

  const AudioContextCtor = getAudioContextConstructor();
  if (!AudioContextCtor) {
    webAudioContext = null;
    return webAudioContext;
  }

  webAudioContext = new AudioContextCtor();
  webAudioMasterGain = webAudioContext.createGain();
  webAudioMasterGain.connect(webAudioContext.destination);
  syncWebAudioMasterGain();

  return webAudioContext;
}

function syncWebAudioMasterGain(): void {
  if (!webAudioMasterGain) {
    return;
  }

  webAudioMasterGain.gain.value = sfxMuted ? 0 : sfxMasterVolume;
}

function getHtmlAudioPool(name: SoundEffectName): HTMLAudioElement[] {
  let pool = htmlAudioPools.get(name);
  if (!pool) {
    pool = [];
    htmlAudioPools.set(name, pool);
  }
  return pool;
}

function createHtmlAudioInstance(name: SoundEffectName): HTMLAudioElement {
  const audio = new Audio(soundEffectSources[name]);
  audio.preload = 'auto';
  return audio;
}

function primeHtmlAudioEffect(name: SoundEffectName): void {
  const pool = getHtmlAudioPool(name);
  if (pool.length === 0) {
    pool.push(createHtmlAudioInstance(name));
  }
  pool[0].load();
}

function playHtmlAudioEffect(name: SoundEffectName, options?: PlaySoundEffectOptions): void {
  if (typeof Audio === 'undefined') {
    return;
  }

  const pool = getHtmlAudioPool(name);
  const reusableAudio = pool.find((audio) => audio.paused || audio.ended);
  const audio = reusableAudio ?? createHtmlAudioInstance(name);

  if (!reusableAudio) {
    pool.push(audio);
  }

  const stopTimer = htmlPlaybackStopTimers.get(audio);
  if (stopTimer !== undefined) {
    window.clearTimeout(stopTimer);
    htmlPlaybackStopTimers.delete(audio);
  }

  if (sfxMuted) {
    return;
  }

  audio.currentTime = 0;
  audio.volume = (options?.volume ?? defaultVolumes[name]) * sfxMasterVolume;

  void audio.play().catch(() => {
    // Ignore browser autoplay rejections until the user interacts.
  });

  if (options?.durationMs !== undefined) {
    const timer = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      htmlPlaybackStopTimers.delete(audio);
    }, options.durationMs);

    htmlPlaybackStopTimers.set(audio, timer);
  }
}

function loadSoundBuffer(name: SoundEffectName): Promise<AudioBuffer | null> {
  const cachedBuffer = decodedSoundBuffers.get(name);
  if (cachedBuffer) {
    return Promise.resolve(cachedBuffer);
  }

  const existingPromise = soundBufferPromises.get(name);
  if (existingPromise) {
    return existingPromise;
  }

  const audioContext = getWebAudioContext();
  if (!audioContext) {
    return Promise.resolve(null);
  }

  const loadPromise = fetch(soundEffectSources[name])
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer.slice(0)))
    .then((decodedBuffer) => {
      decodedSoundBuffers.set(name, decodedBuffer);
      return decodedBuffer;
    })
    .catch(() => null);

  soundBufferPromises.set(name, loadPromise);
  return loadPromise;
}

function playBufferedSoundEffect(
  name: SoundEffectName,
  buffer: AudioBuffer,
  options?: PlaySoundEffectOptions
): boolean {
  const audioContext = getWebAudioContext();
  if (!audioContext || !webAudioMasterGain) {
    return false;
  }

  if (audioContext.state !== 'running') {
    void audioContext.resume().catch(() => {
      // Ignore resume failures and allow the fallback path to handle playback.
    });
    return false;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  gainNode.gain.value = options?.volume ?? defaultVolumes[name];
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(webAudioMasterGain);
  source.start();

  if (options?.durationMs !== undefined) {
    source.stop(audioContext.currentTime + options.durationMs / 1000);
  }

  return true;
}

export function primeSoundEffects(): void {
  const audioContext = getWebAudioContext();

  for (const name of Object.keys(soundEffectSources) as SoundEffectName[]) {
    if (audioContext) {
      void loadSoundBuffer(name);
      continue;
    }

    primeHtmlAudioEffect(name);
  }
}

export async function resumeSoundEffects(): Promise<boolean> {
  const audioContext = getWebAudioContext();

  if (!audioContext) {
    return true;
  }

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext.state === 'running';
  } catch {
    return false;
  }
}

export function playSoundEffect(name: SoundEffectName, options?: PlaySoundEffectOptions): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (sfxMuted || sfxMasterVolume === 0) {
    return;
  }

  const decodedBuffer = decodedSoundBuffers.get(name);
  if (decodedBuffer && playBufferedSoundEffect(name, decodedBuffer, options)) {
    return;
  }

  void loadSoundBuffer(name);
  playHtmlAudioEffect(name, options);
}
