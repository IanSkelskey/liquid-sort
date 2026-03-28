import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { VIAL_CAPACITY } from '../game/types';
import { playSoundEffect } from '../audio/sfx';
import './Vial.css';

type VialVariant = 'game' | 'splash';

interface VialProps {
  segments: string[];
  hiddenMask?: boolean[];
  isSelected?: boolean;
  onClick?: () => void;
  isComplete?: boolean;
  capacity?: number;
  variant?: VialVariant;
  className?: string;
}

type LiquidRun = {
  color: string;
  count: number;
  startIndex: number;
  topIndex: number;
  hidden: boolean;
  justRevealed: boolean;
};

type VialGeometry = {
  viewBoxWidth: number;
  viewBoxHeight: number;
  rimX: number;
  rimY: number;
  rimWidth: number;
  rimHeight: number;
  glassX: number;
  glassY: number;
  glassWidth: number;
  glassHeight: number;
  glassRadius: number;
  liquidX: number;
  liquidY: number;
  liquidWidth: number;
  liquidHeight: number;
  liquidRadius: number;
  shineX: number;
  shineY: number;
  shineWidth: number;
  shineHeight: number;
  glassGlowInset: number;
};

const VIAL_GEOMETRY: Record<VialVariant, VialGeometry> = {
  game: {
    viewBoxWidth: 52,
    viewBoxHeight: 160,
    rimX: 5.6,
    rimY: 1.6,
    rimWidth: 40.8,
    rimHeight: 8.2,
    glassX: 7,
    glassY: 4.2,
    glassWidth: 38,
    glassHeight: 145.3,
    glassRadius: 14,
    liquidX: 11.2,
    liquidY: 12.2,
    liquidWidth: 29.6,
    liquidHeight: 132.2,
    liquidRadius: 11,
    shineX: 14.2,
    shineY: 20,
    shineWidth: 5.4,
    shineHeight: 90,
    glassGlowInset: 3,
  },
  splash: {
    viewBoxWidth: 74,
    viewBoxHeight: 196,
    rimX: 6.75,
    rimY: 0.5,
    rimWidth: 60.5,
    rimHeight: 10,
    glassX: 9,
    glassY: 5,
    glassWidth: 56,
    glassHeight: 178,
    glassRadius: 18,
    liquidX: 15,
    liquidY: 15,
    liquidWidth: 44,
    liquidHeight: 162,
    liquidRadius: 14,
    shineX: 20.5,
    shineY: 22,
    shineWidth: 8.5,
    shineHeight: 116,
    glassGlowInset: 4,
  },
};

function buildRuns(
  segments: string[],
  hiddenMask: boolean[],
  revealedIndices: Set<number>,
): LiquidRun[] {
  return segments.reduce<LiquidRun[]>((runs, color, index) => {
    const hidden = hiddenMask[index] ?? false;
    const lastRun = runs[runs.length - 1];

    if (lastRun && !hidden && !lastRun.hidden && lastRun.color === color) {
      lastRun.count += 1;
      lastRun.topIndex = index;
      lastRun.justRevealed = lastRun.justRevealed || revealedIndices.has(index);
      return runs;
    }

    runs.push({
      color: hidden ? 'var(--vial-hidden-fill)' : color,
      count: 1,
      startIndex: index,
      topIndex: index,
      hidden,
      justRevealed: revealedIndices.has(index),
    });

    return runs;
  }, []);
}

function buildBottomRoundedPath(x: number, y: number, width: number, height: number, radius: number) {
  const bottom = y + height;
  const right = x + width;

  return [
    `M ${x} ${y}`,
    `L ${x} ${bottom - radius}`,
    `Q ${x} ${bottom} ${x + radius} ${bottom}`,
    `L ${right - radius} ${bottom}`,
    `Q ${right} ${bottom} ${right} ${bottom - radius}`,
    `L ${right} ${y}`,
    'Z',
  ].join(' ');
}

export function Vial({
  segments,
  hiddenMask = [],
  isSelected = false,
  onClick,
  isComplete = false,
  capacity = VIAL_CAPACITY,
  variant = 'game',
  className,
}: VialProps) {
  const isGameVariant = variant === 'game';
  const shouldAnimateSegments = isGameVariant;
  const shouldShowBadge = isGameVariant && isComplete && segments.length > 0;
  const prevHiddenRef = useRef(hiddenMask);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const id = useId().replace(/:/g, '-');
  const geometry = VIAL_GEOMETRY[variant];

  useEffect(() => {
    if (!isGameVariant) {
      prevHiddenRef.current = hiddenMask;
      return;
    }

    const prev = prevHiddenRef.current;
    const justRevealed = new Set<number>();

    for (let i = 0; i < segments.length; i += 1) {
      if (prev[i] && !hiddenMask[i]) {
        justRevealed.add(i);
      }
    }

    if (justRevealed.size > 0) {
      setRevealedIndices(justRevealed);
      playSoundEffect('reveal');
      const timer = setTimeout(() => setRevealedIndices(new Set()), 500);
      prevHiddenRef.current = hiddenMask;
      return () => clearTimeout(timer);
    }

    prevHiddenRef.current = hiddenMask;
    return undefined;
  }, [hiddenMask, isGameVariant, segments.length]);

  const liquidRuns = useMemo(
    () => buildRuns(segments, hiddenMask, revealedIndices),
    [segments, hiddenMask, revealedIndices],
  );

  const interactive = typeof onClick === 'function';
  const completeColor = segments[0] ?? 'var(--vial-outline-selected)';
  const outlineColor = isComplete && segments.length > 0
    ? completeColor
    : isSelected
      ? 'var(--vial-outline-selected)'
      : 'var(--vial-outline)';
  const outlineWidth = isComplete ? 2.6 : isSelected ? 2.9 : 2.2;
  const segmentHeight = geometry.liquidHeight / capacity;

  const glassGradientId = `${id}-glass`;
  const rimGradientId = `${id}-rim`;
  const shineGradientId = `${id}-shine`;
  const liquidGlossId = `${id}-liquid-gloss`;
  const liquidClipId = `${id}-liquid-clip`;
  const glassShadowId = `${id}-glass-shadow`;
  const glowId = `${id}-glow`;

  const glassPath = buildBottomRoundedPath(
    geometry.glassX,
    geometry.glassY,
    geometry.glassWidth,
    geometry.glassHeight,
    geometry.glassRadius,
  );
  const liquidPath = buildBottomRoundedPath(
    geometry.liquidX,
    geometry.liquidY,
    geometry.liquidWidth,
    geometry.liquidHeight,
    geometry.liquidRadius,
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const classes = [
    'vial',
    `vial--${variant}`,
    interactive ? 'vial--interactive' : '',
    isSelected ? 'vial--selected' : '',
    isComplete ? 'vial--complete' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={classes}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? isSelected : undefined}
      animate={
        isGameVariant
          ? {
              y: isSelected ? -18 : 0,
              scale: isComplete ? [1, 1.05, 1] : 1,
            }
          : { y: 0, scale: 1 }
      }
      transition={{
        y: { type: 'spring', stiffness: 400, damping: 25 },
        scale: { duration: 0.4, ease: 'easeInOut' },
      }}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      <svg
        className="vial__svg"
        viewBox={`0 0 ${geometry.viewBoxWidth} ${geometry.viewBoxHeight}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={glassGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--vial-glass-top)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--vial-glass-bottom)' }} />
          </linearGradient>
          <linearGradient id={rimGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--vial-rim-top)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--vial-rim-bottom)' }} />
          </linearGradient>
          <linearGradient id={shineGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--vial-shine-top)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--vial-shine-bottom)' }} />
          </linearGradient>
          <linearGradient id={liquidGlossId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--vial-liquid-highlight-strong)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--vial-liquid-highlight-soft)' }} />
          </linearGradient>
          <clipPath id={liquidClipId}>
            <path d={liquidPath} />
          </clipPath>
          <filter id={glassShadowId} x="-35%" y="-20%" width="170%" height="170%">
            <feDropShadow
              dx="0"
              dy={variant === 'splash' ? '10' : '8'}
              stdDeviation={variant === 'splash' ? '6' : '5'}
              floodColor="var(--vial-glass-shadow)"
              floodOpacity="0.9"
            />
          </filter>
          {isComplete && segments.length > 0 && (
            <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={completeColor} floodOpacity="0.45" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {isComplete && segments.length > 0 && (
          <motion.path
            d={buildBottomRoundedPath(
              geometry.glassX - geometry.glassGlowInset,
              geometry.glassY - geometry.glassGlowInset,
              geometry.glassWidth + geometry.glassGlowInset * 2,
              geometry.glassHeight + geometry.glassGlowInset * 2,
              geometry.glassRadius + geometry.glassGlowInset,
            )}
            fill={completeColor}
            opacity={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}

        <path
          d={glassPath}
          fill={`url(#${glassGradientId})`}
          filter={`url(#${glassShadowId})`}
        />

        <path
          d={buildBottomRoundedPath(
            geometry.glassX + 1.6,
            geometry.glassY + 2,
            geometry.glassWidth - 3.2,
            geometry.glassHeight * 0.24,
            Math.max(geometry.glassRadius - 2, 8),
          )}
          fill="rgba(255,255,255,0.05)"
          opacity={0.72}
        />

        <g clipPath={`url(#${liquidClipId})`}>
          {liquidRuns.map((run) => {
            const runHeight = run.count * segmentHeight;
            const runY = geometry.liquidY + geometry.liquidHeight - (run.startIndex + run.count) * segmentHeight;
            const isTopRun = run.topIndex === segments.length - 1;

            return (
              <motion.g key={`${run.startIndex}-${run.count}-${run.color}`}>
                <motion.rect
                  x={geometry.liquidX}
                  width={geometry.liquidWidth}
                  height={runHeight}
                  fill={run.color}
                  initial={shouldAnimateSegments ? { y: runY - 18, opacity: 0 } : false}
                  animate={{ y: runY, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: shouldAnimateSegments ? run.startIndex * 0.03 : 0,
                  }}
                />

                {!run.hidden && (
                  <motion.rect
                    x={geometry.liquidX}
                    width={geometry.liquidWidth}
                    height={Math.min(runHeight, variant === 'splash' ? 18 : 16)}
                    y={runY}
                    fill={`url(#${liquidGlossId})`}
                    opacity={0.8}
                    initial={shouldAnimateSegments ? { y: runY - 18, opacity: 0 } : false}
                    animate={{ y: runY, opacity: 0.8 }}
                    transition={{
                      duration: 0.28,
                      delay: shouldAnimateSegments ? run.startIndex * 0.03 + 0.06 : 0,
                    }}
                  />
                )}

                {!isTopRun && (
                  <motion.rect
                    x={geometry.liquidX + 1}
                    y={runY}
                    width={geometry.liquidWidth - 2}
                    height={1.5}
                    fill="var(--vial-liquid-divider)"
                    initial={shouldAnimateSegments ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ delay: shouldAnimateSegments ? run.topIndex * 0.03 + 0.08 : 0 }}
                  />
                )}

                {run.justRevealed && (
                  <motion.rect
                    x={geometry.liquidX}
                    width={geometry.liquidWidth}
                    height={runHeight}
                    y={runY}
                    fill="white"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {run.hidden && (
                  <motion.text
                    x={geometry.viewBoxWidth / 2}
                    y={runY + runHeight / 2 + 5}
                    textAnchor="middle"
                    fill="var(--vial-hidden-icon)"
                    fontSize={variant === 'splash' ? '16' : '15'}
                    fontWeight="800"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                    initial={shouldAnimateSegments ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ delay: shouldAnimateSegments ? run.startIndex * 0.03 + 0.1 : 0 }}
                  >
                    ?
                  </motion.text>
                )}

                {isTopRun && !run.hidden && (
                  <motion.rect
                    x={geometry.liquidX + 4}
                    y={runY + 2}
                    width={geometry.liquidWidth - 8}
                    height={3}
                    rx={1.5}
                    fill="rgba(255,255,255,0.34)"
                    initial={shouldAnimateSegments ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ delay: shouldAnimateSegments ? run.topIndex * 0.03 + 0.14 : 0 }}
                  />
                )}
              </motion.g>
            );
          })}
        </g>

        <path
          d={glassPath}
          fill="none"
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          filter={isComplete && segments.length > 0 ? `url(#${glowId})` : undefined}
        />

        <rect
          x={geometry.rimX}
          y={geometry.rimY}
          width={geometry.rimWidth}
          height={geometry.rimHeight}
          rx={geometry.rimHeight / 2}
          fill={`url(#${rimGradientId})`}
          stroke={isComplete ? completeColor : 'var(--vial-rim-stroke)'}
          strokeWidth={outlineWidth * 0.55}
          filter={isComplete && segments.length > 0 ? `url(#${glowId})` : undefined}
        />

        <rect
          x={geometry.rimX + 2}
          y={geometry.rimY + 1.4}
          width={geometry.rimWidth - 4}
          height={geometry.rimHeight * 0.42}
          rx={999}
          fill="rgba(255,255,255,0.4)"
          opacity={0.8}
        />

        <rect
          x={geometry.shineX}
          y={geometry.shineY}
          width={geometry.shineWidth}
          height={geometry.shineHeight}
          rx={999}
          fill={`url(#${shineGradientId})`}
          opacity={0.84}
        />
      </svg>

      {shouldShowBadge && (
        <motion.div
          className="vial__complete-badge"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
          style={{ backgroundColor: completeColor }}
        >
          <Check aria-hidden="true" />
        </motion.div>
      )}
    </motion.div>
  );
}
