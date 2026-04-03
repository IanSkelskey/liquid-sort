import { memo } from 'react';
import { motion } from 'framer-motion';
import type { LiquidRun } from './liquidRuns';
import type { VialGeometry, VialVariant } from './vialGeometry';

interface VialLiquidLayersProps {
  liquidRuns: LiquidRun[];
  geometry: VialGeometry;
  variant: VialVariant;
  segmentCount: number;
  segmentHeight: number;
  liquidGlossId: string;
  shouldAnimateSegments: boolean;
}

export const VialLiquidLayers = memo(function VialLiquidLayers({
  liquidRuns,
  geometry,
  variant,
  segmentCount,
  segmentHeight,
  liquidGlossId,
  shouldAnimateSegments,
}: VialLiquidLayersProps) {
  return (
    <>
      {liquidRuns.map((run) => {
        const runHeight = run.count * segmentHeight;
        const runY =
          geometry.liquidY + geometry.liquidHeight - (run.startIndex + run.count) * segmentHeight;
        const isTopRun = run.topIndex === segmentCount - 1;

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
                x={geometry.liquidX + geometry.liquidWidth * 0.08}
                width={geometry.liquidWidth * (variant === 'splash' ? 0.24 : 0.22)}
                height={Math.max(runHeight - 8, 0)}
                y={runY + 4}
                rx={999}
                fill={`url(#${liquidGlossId})`}
                opacity={variant === 'splash' ? 0.34 : 0.3}
                initial={shouldAnimateSegments ? { y: runY - 18, opacity: 0 } : false}
                animate={{ y: runY + 4, opacity: variant === 'splash' ? 0.34 : 0.3 }}
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
    </>
  );
});
