import { generateLevelDefinition } from './generator';

type WorkerRequest = {
  type: 'preload';
  level: number;
};

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== 'preload' || event.data.level < 1) {
    return;
  }

  const definition = generateLevelDefinition(event.data.level);

  self.postMessage({
    type: 'preloaded',
    level: event.data.level,
    definition,
  });
});

export {};
