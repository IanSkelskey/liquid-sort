import { memo } from 'react';
import type { VialGeometry, VialVariant } from './vialGeometry';

type VialDefinitionIds = {
  glassGradientId: string;
  rimGradientId: string;
  shineGradientId: string;
  liquidGlossId: string;
  liquidClipId: string;
  glassShadowId: string;
  glowId: string;
};

interface VialDefinitionsProps {
  geometry: VialGeometry;
  ids: VialDefinitionIds;
  variant: VialVariant;
  liquidPath: string;
  completeColor: string;
  showGlow: boolean;
}

export const VialDefinitions = memo(function VialDefinitions({
  geometry,
  ids,
  variant,
  liquidPath,
  completeColor,
  showGlow,
}: VialDefinitionsProps) {
  return (
    <defs>
      <linearGradient id={ids.glassGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={{ stopColor: 'var(--vial-glass-top)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--vial-glass-bottom)' }} />
      </linearGradient>
      <linearGradient id={ids.rimGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={{ stopColor: 'var(--vial-rim-top)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--vial-rim-bottom)' }} />
      </linearGradient>
      <linearGradient
        id={ids.shineGradientId}
        x1={geometry.shineX}
        y1={geometry.shineY}
        x2={geometry.shineX}
        y2={geometry.shineY + geometry.shineHeight}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" style={{ stopColor: 'var(--vial-shine-top)' }} />
        <stop offset="28%" style={{ stopColor: 'var(--vial-shine-top)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--vial-shine-bottom)' }} />
      </linearGradient>
      <linearGradient id={ids.liquidGlossId} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" style={{ stopColor: 'var(--vial-liquid-highlight-strong)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--vial-liquid-highlight-soft)' }} />
      </linearGradient>
      <clipPath id={ids.liquidClipId}>
        <path d={liquidPath} />
      </clipPath>
      <filter id={ids.glassShadowId} x="-35%" y="-20%" width="170%" height="170%">
        <feDropShadow
          dx="0"
          dy={variant === 'splash' ? '10' : '8'}
          stdDeviation={variant === 'splash' ? '6' : '5'}
          floodColor="var(--vial-glass-shadow)"
          floodOpacity="0.9"
        />
      </filter>
      {showGlow && (
        <filter id={ids.glowId} x="-60%" y="-60%" width="220%" height="220%">
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
  );
});
