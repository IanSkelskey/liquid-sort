export type VialVariant = 'game' | 'splash';

export interface VialGeometry {
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
}

export const VIAL_GEOMETRY: Record<VialVariant, VialGeometry> = {
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
    shineWidth: 3,
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
    shineWidth: 6,
    shineHeight: 116,
    glassGlowInset: 4,
  },
};

export function buildBottomRoundedPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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

export function buildSideShinePath(geometry: VialGeometry) {
  const x = geometry.shineX + geometry.shineWidth * 0.52;
  const startY = geometry.shineY;
  const endY = geometry.shineY + geometry.shineHeight;

  return [`M ${x} ${startY}`, `L ${x} ${endY}`].join(' ');
}
