import { memo, useCallback, useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import { getVialModifierLabel, getVialModifierShortLabel, hasVialModifier } from '../game/modifiers';
import { VIAL_CAPACITY, type VialModifier } from '../game/types';
import { VialDefinitions } from './vial/VialDefinitions';
import { VialLiquidLayers } from './vial/VialLiquidLayers';
import { buildLiquidRuns } from './vial/liquidRuns';
import { useRevealedSegments } from './vial/useRevealedSegments';
import {
  buildBottomRoundedPath,
  buildSideShinePath,
  VIAL_GEOMETRY,
  type VialVariant,
} from './vial/vialGeometry';
import './Vial.css';

interface VialProps {
  segments: string[];
  hiddenMask?: boolean[];
  modifier?: VialModifier;
  isSelected?: boolean;
  onClick?: ((index: number) => void) | (() => void);
  index?: number;
  isComplete?: boolean;
  capacity?: number;
  variant?: VialVariant;
  className?: string;
}

export const Vial = memo(function Vial({
  segments,
  hiddenMask = [],
  modifier = 'none',
  isSelected = false,
  onClick,
  index,
  isComplete = false,
  capacity = VIAL_CAPACITY,
  variant = 'game',
  className,
}: VialProps) {
  const isGameVariant = variant === 'game';
  const shouldAnimateSegments = isGameVariant;
  const shouldShowBadge = isGameVariant && isComplete && segments.length > 0;
  const shouldShowModifierBadge = hasVialModifier(modifier);
  const revealedIndices = useRevealedSegments(hiddenMask, segments.length, isGameVariant);
  const geometry = VIAL_GEOMETRY[variant];
  const id = useId().replace(/:/g, '-');

  const liquidRuns = useMemo(
    () => buildLiquidRuns(segments, hiddenMask, revealedIndices),
    [segments, hiddenMask, revealedIndices]
  );

  const interactive = typeof onClick === 'function';
  const completeColor = segments[0] ?? 'var(--vial-outline-selected)';
  const modifierLabel = getVialModifierLabel(modifier);
  const modifierShortLabel = getVialModifierShortLabel(modifier);
  const outlineColor = isComplete && segments.length > 0
    ? completeColor
    : isSelected
      ? 'var(--vial-outline-selected)'
      : 'var(--vial-outline)';
  const outlineWidth = isComplete ? 2.6 : isSelected ? 2.9 : 2.2;
  const segmentHeight = geometry.liquidHeight / capacity;

  const ids = {
    glassGradientId: `${id}-glass`,
    rimGradientId: `${id}-rim`,
    shineGradientId: `${id}-shine`,
    liquidGlossId: `${id}-liquid-gloss`,
    liquidClipId: `${id}-liquid-clip`,
    glassShadowId: `${id}-glass-shadow`,
    glowId: `${id}-glow`,
  };

  const glassPath = buildBottomRoundedPath(
    geometry.glassX,
    geometry.glassY,
    geometry.glassWidth,
    geometry.glassHeight,
    geometry.glassRadius
  );
  const liquidPath = buildBottomRoundedPath(
    geometry.liquidX,
    geometry.liquidY,
    geometry.liquidWidth,
    geometry.liquidHeight,
    geometry.liquidRadius
  );
  const shinePath = buildSideShinePath(geometry);

  const handleClick = useCallback(() => {
    if (onClick) {
      if (index !== undefined) {
        (onClick as (index: number) => void)(index);
      } else {
        (onClick as () => void)();
      }
    }
  }, [onClick, index]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [interactive, handleClick]);

  const classes = [
    'vial',
    `vial--${variant}`,
    interactive ? 'vial--interactive' : '',
    isSelected ? 'vial--selected' : '',
    isComplete ? 'vial--complete' : '',
    shouldShowModifierBadge ? `vial--modifier-${modifier}` : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive && shouldShowModifierBadge ? `${modifierLabel} vial` : undefined}
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
      {shouldShowModifierBadge && (
        <motion.div
          className={`vial__modifier-badge vial__modifier-badge--${modifier}`}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          title={modifierLabel}
        >
          <span className="vial__modifier-icon" aria-hidden="true">
            {modifier === 'in-only' ? <ArrowDown /> : <ArrowUp />}
          </span>
          <span className="vial__modifier-label">{modifierShortLabel}</span>
        </motion.div>
      )}

      <svg
        className="vial__svg"
        viewBox={`0 0 ${geometry.viewBoxWidth} ${geometry.viewBoxHeight}`}
        aria-hidden="true"
      >
        <VialDefinitions
          geometry={geometry}
          ids={ids}
          variant={variant}
          liquidPath={liquidPath}
          completeColor={completeColor}
          showGlow={isComplete && segments.length > 0}
        />

        {isComplete && segments.length > 0 && (
          <motion.path
            d={buildBottomRoundedPath(
              geometry.glassX - geometry.glassGlowInset,
              geometry.glassY - geometry.glassGlowInset,
              geometry.glassWidth + geometry.glassGlowInset * 2,
              geometry.glassHeight + geometry.glassGlowInset * 2,
              geometry.glassRadius + geometry.glassGlowInset
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
          fill={`url(#${ids.glassGradientId})`}
          filter={`url(#${ids.glassShadowId})`}
        />

        <g clipPath={`url(#${ids.liquidClipId})`}>
          <VialLiquidLayers
            liquidRuns={liquidRuns}
            geometry={geometry}
            variant={variant}
            segmentCount={segments.length}
            segmentHeight={segmentHeight}
            liquidGlossId={ids.liquidGlossId}
            shouldAnimateSegments={shouldAnimateSegments}
          />
        </g>

        <path
          d={glassPath}
          fill="none"
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          filter={isComplete && segments.length > 0 ? `url(#${ids.glowId})` : undefined}
        />

        <rect
          x={geometry.rimX}
          y={geometry.rimY}
          width={geometry.rimWidth}
          height={geometry.rimHeight}
          rx={geometry.rimHeight / 2}
          fill={`url(#${ids.rimGradientId})`}
          stroke={isComplete ? completeColor : 'var(--vial-rim-stroke)'}
          strokeWidth={outlineWidth * 0.55}
          filter={isComplete && segments.length > 0 ? `url(#${ids.glowId})` : undefined}
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

        <path
          d={shinePath}
          fill="none"
          stroke={`url(#${ids.shineGradientId})`}
          strokeWidth={variant === 'splash' ? geometry.shineWidth : geometry.shineWidth * 1.04}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.26}
        />

        <path
          d={shinePath}
          fill="none"
          stroke={`url(#${ids.shineGradientId})`}
          strokeWidth={variant === 'splash' ? geometry.shineWidth * 0.52 : geometry.shineWidth * 0.58}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.92}
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
});
