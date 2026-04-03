import LevelPreloadWorker from './preload.worker?worker';
import { cacheLevelDefinition, generateLevelDefinition, hasLevelDefinition } from './generator';
import type { LevelDefinition } from './types';

type WorkerRequest = {
  type: 'preload';
  level: number;
};

type WorkerResponse = {
  type: 'preloaded';
  level: number;
  definition: LevelDefinition;
};

const pendingLevels = new Set<number>();
let preloadWorker: Worker | null | undefined;

function getPreloadWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }

  if (preloadWorker !== undefined) {
    return preloadWorker;
  }

  try {
    preloadWorker = new LevelPreloadWorker();
    preloadWorker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type !== 'preloaded') {
        return;
      }

      cacheLevelDefinition(event.data.level, event.data.definition);
      pendingLevels.delete(event.data.level);
    });
    preloadWorker.addEventListener('error', () => {
      preloadWorker = null;
    });
  } catch {
    preloadWorker = null;
  }

  return preloadWorker;
}

function preloadLevelDefinitionOnMainThread(level: number): void {
  window.setTimeout(() => {
    try {
      generateLevelDefinition(level);
    } finally {
      pendingLevels.delete(level);
    }
  }, 0);
}

export function preloadLevelDefinition(level: number): void {
  if (typeof window === 'undefined' || level < 1) {
    return;
  }

  if (hasLevelDefinition(level) || pendingLevels.has(level)) {
    return;
  }

  pendingLevels.add(level);

  const worker = getPreloadWorker();
  if (!worker) {
    preloadLevelDefinitionOnMainThread(level);
    return;
  }

  const request: WorkerRequest = {
    type: 'preload',
    level,
  };

  worker.postMessage(request);
}
