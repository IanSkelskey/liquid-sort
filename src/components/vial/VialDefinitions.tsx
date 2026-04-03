import { memo } from 'react';
import type { VialGeometry } from './vialGeometry';

type VialDefinitionIds = {
  glassGradientId: string;
  rimGradientId: string;
  shineGradientId: string;
  liquidGlossId: string;
  liquidClipId: string;
};

interface VialDefinitionsProps {
  geometry: VialGeometry;
  ids: VialDefinitionIds;
  liquidPath: string;
}

export const VialDefinitions = memo(function VialDefinitions({
  geometry,
  ids,
  liquidPath,
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
    </defs>
  );
});
