import { runGameLevelsTests } from './game-levels.test.mjs';

const testSuites = [
  {
    name: 'game level invariants',
    run: runGameLevelsTests,
  },
];

let failures = 0;

for (const testSuite of testSuites) {
  try {
    await testSuite.run();
    console.log(`PASS ${testSuite.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${testSuite.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
}
