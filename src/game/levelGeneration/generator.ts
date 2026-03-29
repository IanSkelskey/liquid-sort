import { ALL_COLORS } from '../types';
import type { Color, Vial } from '../types';
import { getDifficultyTargets, getLevelConfig } from './config';
import { generateHidden } from './hidden';
import {
  applyReverseMove,
  buildReverseMoveCandidates,
  createCandidateState,
  estimateMindlessRunStats,
  hasReachableDeadEnd,
} from './simulation';
import { scoreLevelDefinition } from './scoring';
import type { LevelCandidate, LevelDefinition } from './types';
import {
  buildSolvedVials,
  cloneHidden,
  cloneVials,
  createRng,
  getVialLayoutKey,
  hasTargetSilhouette,
  isSolvedLayout,
  normalizeVials,
  pickWeightedCandidate,
} from './utils';

const levelDefinitionCache = new Map<number, LevelDefinition>();

function collectLevelCandidates(
  level: number,
  colors: Color[],
  numEmpty: number,
  reverseSteps: number,
  generationAttempts: number,
  seedOffset: number,
  seenCandidateKeys: Set<string>
): LevelCandidate[] {
  const candidates: LevelCandidate[] = [];

  for (let attempt = 0; attempt < generationAttempts; attempt += 1) {
    const rng = createRng(level * 7919 + 1013 + seedOffset + attempt * 379);
    const hiddenRng = createRng(level * 3571 + 997 + seedOffset + attempt * 733);
    let vials = buildSolvedVials(colors, numEmpty);
    const targetReverseStepCount =
      reverseSteps + Math.floor(rng() * Math.max(12, Math.floor(reverseSteps * 0.25)));
    let appliedReverseSteps = 0;

    for (let step = 0; step < targetReverseStepCount; step += 1) {
      const reverseMoveCandidates = buildReverseMoveCandidates(vials);

      if (reverseMoveCandidates.length === 0) {
        break;
      }

      const candidate = pickWeightedCandidate(reverseMoveCandidates, rng);
      vials = applyReverseMove(vials, candidate);
      appliedReverseSteps += 1;

      if (!hasTargetSilhouette(vials, colors.length, numEmpty)) {
        continue;
      }

      const normalizedVials = normalizeVials(vials);

      if (isSolvedLayout(normalizedVials)) {
        continue;
      }

      const candidateKey = getVialLayoutKey(normalizedVials);

      if (seenCandidateKeys.has(candidateKey)) {
        continue;
      }

      seenCandidateKeys.add(candidateKey);

      const hidden = generateHidden(level, normalizedVials, hiddenRng);
      const score = scoreLevelDefinition(
        level,
        colors.length,
        { vials: normalizedVials, hidden },
        appliedReverseSteps
      );

      candidates.push({
        vials: normalizedVials,
        hidden,
        score,
        deadEndReachable: false,
        appliedReverseSteps,
      });
    }
  }

  return candidates;
}

function rotateTopSegment(vials: Vial[], bufferIndex: number, first: number, second: number, third: number): void {
  const buffer = vials[bufferIndex];
  const firstTop = vials[first].pop();
  const secondTop = vials[second].pop();
  const thirdTop = vials[third].pop();

  if (!firstTop || !secondTop || !thirdTop) {
    return;
  }

  buffer.push(firstTop);
  vials[first].push(secondTop);
  vials[second].push(thirdTop);
  const bufferedSegment = buffer.pop();

  if (bufferedSegment) {
    vials[third].push(bufferedSegment);
  }
}

function buildDeterministicFallbackVials(colors: Color[], numEmpty: number): Vial[] {
  const fallbackVials = buildSolvedVials(colors, numEmpty);
  const bufferIndex = colors.length;
  const cycleCount = Math.max(4, Math.min(colors.length * 2, 12));

  for (let cycle = 0; cycle < cycleCount; cycle += 1) {
    const first = cycle % colors.length;
    const second = (cycle + 1) % colors.length;
    const third = (cycle + 2) % colors.length;

    rotateTopSegment(fallbackVials, bufferIndex, first, second, third);
  }

  return normalizeVials(fallbackVials);
}

export function generateLevelDefinition(level: number): LevelDefinition {
  const cachedDefinition = levelDefinitionCache.get(level);

  if (cachedDefinition) {
    return cachedDefinition;
  }

  const { numColors, numEmpty, reverseSteps, generationAttempts } = getLevelConfig(level);
  const targets = getDifficultyTargets(level, numColors);
  const colors = ALL_COLORS.slice(0, numColors);
  const seenCandidateKeys = new Set<string>();
  const candidates: LevelCandidate[] = [];
  const searchPasses = [
    { reverseSteps, generationAttempts, seedOffset: 0 },
    {
      reverseSteps: Math.ceil(reverseSteps * 1.35),
      generationAttempts: generationAttempts + 4,
      seedOffset: 10_000,
    },
    {
      reverseSteps: Math.ceil(reverseSteps * 1.8),
      generationAttempts: generationAttempts + 8,
      seedOffset: 20_000,
    },
  ];

  for (const searchPass of searchPasses) {
    candidates.push(
      ...collectLevelCandidates(
        level,
        colors,
        numEmpty,
        searchPass.reverseSteps,
        searchPass.generationAttempts,
        searchPass.seedOffset,
        seenCandidateKeys
      )
    );
  }

  if (candidates.length === 0) {
    const fallbackVials = buildDeterministicFallbackVials(colors, numEmpty);
    const fallbackHidden = generateHidden(level, fallbackVials, createRng(level * 9151 + 211));
    const fallbackDefinition: LevelDefinition = {
      vials: fallbackVials,
      hidden: fallbackHidden,
      score: Number.NEGATIVE_INFINITY,
      deadEndReachable: false,
    };

    levelDefinitionCache.set(level, fallbackDefinition);
    return fallbackDefinition;
  }

  candidates.sort((left, right) => right.score - left.score);

  for (const candidate of candidates) {
    candidate.mindlessStats = estimateMindlessRunStats(level, candidate.vials, candidate.hidden);
    candidate.score += candidate.mindlessStats.risky.deadEndRate * targets.deadEndRateBonus;
    candidate.score += candidate.mindlessStats.risky.nonWinRate * (targets.deadEndRateBonus * 0.3);
    candidate.score -=
      Math.abs(candidate.mindlessStats.random.winRate - targets.preferredRandomWinRate) *
      (targets.deadEndRateBonus * 1.2);
    candidate.score -=
      Math.abs(candidate.mindlessStats.trapMoveRate - targets.trapMoveRateTarget) *
      (targets.deadEndRateBonus * 0.8);
    candidate.score -= candidate.mindlessStats.risky.winRate * (targets.deadEndRateBonus * 0.25);
    candidate.score -= candidate.mindlessStats.forcedAutopilotSteps * 18;

    if (candidate.mindlessStats.first.won && level >= 20) {
      candidate.score -= 90;
    }

    if (
      candidate.mindlessStats.random.deadEndRate >= targets.deadEndRateTarget ||
      candidate.mindlessStats.trapMoveRate >= targets.trapMoveRateTarget
    ) {
      candidate.score += targets.deadEndRateBonus * 0.5;
    }
  }

  candidates.sort((left, right) => right.score - left.score);

  for (const candidate of candidates.slice(0, Math.min(12, candidates.length))) {
    const initialState = createCandidateState(level, candidate.vials, candidate.hidden);
    candidate.deadEndReachable = hasReachableDeadEnd(level, initialState);

    if (candidate.deadEndReachable) {
      candidate.score += targets.deadEndBonus;
    }
  }

  candidates.sort((left, right) => right.score - left.score);

  const balancedPressureCandidate = candidates.find(
    (candidate) =>
      (candidate.mindlessStats?.random.winRate ?? 0) >= targets.randomWinFloor &&
      (candidate.mindlessStats?.random.winRate ?? 1) <= targets.randomWinCap &&
      ((candidate.mindlessStats?.random.deadEndRate ?? 0) >= targets.deadEndRateTarget ||
        (candidate.mindlessStats?.trapMoveRate ?? 0) >= targets.trapMoveRateTarget)
  );
  const pressureCandidate = candidates.find(
    (candidate) =>
      (candidate.mindlessStats?.random.winRate ?? 1) <= targets.randomWinCap &&
      ((candidate.mindlessStats?.random.deadEndRate ?? 0) >= targets.deadEndRateTarget ||
        (candidate.mindlessStats?.trapMoveRate ?? 0) >= targets.trapMoveRateTarget ||
        candidate.mindlessStats?.first.deadEnd === true)
  );
  const deadEndCandidate = candidates.find((candidate) => candidate.deadEndReachable);

  const selectedDefinition =
    targets.requireDeadEndRate && balancedPressureCandidate
      ? balancedPressureCandidate
      : targets.requireDeadEndRate && pressureCandidate
        ? pressureCandidate
        : deadEndCandidate && level >= 8
          ? deadEndCandidate
          : candidates[0];

  const cachedSelectedDefinition: LevelDefinition = {
    vials: cloneVials(selectedDefinition.vials),
    hidden: cloneHidden(selectedDefinition.hidden),
    score: selectedDefinition.score,
    deadEndReachable: selectedDefinition.deadEndReachable,
  };

  levelDefinitionCache.set(level, cachedSelectedDefinition);
  return cachedSelectedDefinition;
}
