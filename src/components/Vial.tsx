import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { type Vial as VialType, COLOR_VALUES, VIAL_CAPACITY } from '../game/types';
import { playSoundEffect } from '../audio/sfx';

interface VialProps {
  vial: VialType;
  hiddenMask: boolean[];
  isSelected: boolean;
  onClick: () => void;
  isComplete: boolean;
}

const VIAL_WIDTH = 52;
const VIAL_HEIGHT = 160;
const SEGMENT_HEIGHT = 30;
const BOTTOM_Y = 140;
const INNER_WIDTH = 38;
const INNER_X = (VIAL_WIDTH - INNER_WIDTH) / 2;
const CORNER_RADIUS = 10;

export function Vial({ vial, hiddenMask, isSelected, onClick, isComplete }: VialProps) {
  const prevHiddenRef = useRef(hiddenMask);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const prev = prevHiddenRef.current;
    const justRevealed = new Set<number>();
    for (let i = 0; i < vial.length; i++) {
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
  }, [hiddenMask, vial.length]);

  return (
    <motion.div
      onClick={onClick}
      animate={{
        y: isSelected ? -18 : 0,
        scale: isComplete ? [1, 1.05, 1] : 1,
      }}
      transition={{
        y: { type: 'spring', stiffness: 400, damping: 25 },
        scale: { duration: 0.4, ease: 'easeInOut' },
      }}
      style={{ cursor: 'pointer', display: 'inline-block' }}
    >
      <svg
        width={VIAL_WIDTH}
        height={VIAL_HEIGHT + 20}
        viewBox={`0 0 ${VIAL_WIDTH} ${VIAL_HEIGHT + 20}`}
      >
        {/* Glow filter for completed vials */}
        {isComplete && vial.length > 0 && (
          <defs>
            <filter id={`glow-${COLOR_VALUES[vial[0]].replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={COLOR_VALUES[vial[0]]} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {/* Completed vial background glow */}
        {isComplete && vial.length > 0 && (
          <motion.rect
            x={INNER_X - 5}
            y={BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT - 5}
            width={INNER_WIDTH + 10}
            height={VIAL_CAPACITY * SEGMENT_HEIGHT + CORNER_RADIUS + 10}
            rx={CORNER_RADIUS + 5}
            fill={COLOR_VALUES[vial[0]]}
            opacity={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}

        {/* Liquid segments */}
        {vial.map((color, i) => {
          const segY = BOTTOM_Y - (i + 1) * SEGMENT_HEIGHT;
          const isBottomSegment = i === 0;
          const isTopSegment = i === vial.length - 1;
          const isHidden = hiddenMask[i] ?? false;
          const justRevealed = revealedIndices.has(i);
          const fillColor = isHidden ? '#888888' : COLOR_VALUES[color];

          return (
            <motion.g key={i}>
              {/* Main segment rectangle */}
              <motion.rect
                x={INNER_X}
                width={INNER_WIDTH}
                height={SEGMENT_HEIGHT}
                fill={fillColor}
                initial={{ y: segY - 20, opacity: 0 }}
                animate={{ y: segY, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: i * 0.03,
                }}
                rx={isBottomSegment ? CORNER_RADIUS : 0}
                ry={isBottomSegment ? CORNER_RADIUS : 0}
              />
              {/* Square fill for bottom corners that round */}
              {isBottomSegment && (
                <motion.rect
                  x={INNER_X}
                  y={segY}
                  width={INNER_WIDTH}
                  height={CORNER_RADIUS}
                  fill={fillColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                />
              )}
              {/* Reveal flash overlay */}
              {justRevealed && (
                <motion.rect
                  x={INNER_X}
                  width={INNER_WIDTH}
                  height={SEGMENT_HEIGHT}
                  y={segY}
                  fill="white"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  rx={i === 0 ? CORNER_RADIUS : 0}
                  ry={i === 0 ? CORNER_RADIUS : 0}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {/* Question mark for hidden segments */}
              {isHidden && (
                <motion.text
                  x={VIAL_WIDTH / 2}
                  y={segY + SEGMENT_HEIGHT / 2 + 5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.8)"
                  fontSize="16"
                  fontWeight="800"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 + 0.1 }}
                >
                  ?
                </motion.text>
              )}
              {/* Top surface highlight */}
              {isTopSegment && !isHidden && (
                <motion.rect
                  x={INNER_X + 4}
                  y={segY + 2}
                  width={INNER_WIDTH - 8}
                  height={3}
                  rx={1.5}
                  fill="rgba(255,255,255,0.35)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                />
              )}
            </motion.g>
          );
        })}

        {/* Vial outline — test tube shape */}
        <path
          d={`
            M ${INNER_X} ${BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT}
            L ${INNER_X} ${BOTTOM_Y - CORNER_RADIUS}
            Q ${INNER_X} ${BOTTOM_Y} ${INNER_X + CORNER_RADIUS} ${BOTTOM_Y}
            L ${INNER_X + INNER_WIDTH - CORNER_RADIUS} ${BOTTOM_Y}
            Q ${INNER_X + INNER_WIDTH} ${BOTTOM_Y} ${INNER_X + INNER_WIDTH} ${BOTTOM_Y - CORNER_RADIUS}
            L ${INNER_X + INNER_WIDTH} ${BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT}
          `}
          fill="none"
          stroke={
            isComplete && vial.length > 0
              ? COLOR_VALUES[vial[0]]
              : isSelected
                ? 'var(--vial-stroke-selected)'
                : 'var(--vial-stroke)'
          }
          strokeWidth={isComplete ? 2.5 : isSelected ? 3 : 2}
          strokeLinecap="round"
          filter={isComplete && vial.length > 0 ? `url(#glow-${COLOR_VALUES[vial[0]].replace('#', '')})` : undefined}
        />

        {/* Vial rim */}
        <line
          x1={INNER_X - 3}
          y1={BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT}
          x2={INNER_X + 3}
          y2={BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT}
          stroke={
            isComplete && vial.length > 0
              ? COLOR_VALUES[vial[0]]
              : isSelected
                ? 'var(--vial-stroke-selected)'
                : 'var(--vial-stroke)'
          }
          strokeWidth={isComplete ? 2.5 : isSelected ? 3 : 2}
          strokeLinecap="round"
        />
        <line
          x1={INNER_X + INNER_WIDTH - 3}
          y1={BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT}
          x2={INNER_X + INNER_WIDTH + 3}
          y2={BOTTOM_Y - VIAL_CAPACITY * SEGMENT_HEIGHT}
          stroke={
            isComplete && vial.length > 0
              ? COLOR_VALUES[vial[0]]
              : isSelected
                ? 'var(--vial-stroke-selected)'
                : 'var(--vial-stroke)'
          }
          strokeWidth={isComplete ? 2.5 : isSelected ? 3 : 2}
          strokeLinecap="round"
        />

        {/* Checkmark for completed vials */}
        {isComplete && vial.length > 0 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
            style={{ transformOrigin: `${VIAL_WIDTH / 2}px ${BOTTOM_Y + 12}px` }}
          >
            <circle
              cx={VIAL_WIDTH / 2}
              cy={BOTTOM_Y + 12}
              r={8}
              fill={COLOR_VALUES[vial[0]]}
            />
            <path
              d={`M ${VIAL_WIDTH / 2 - 3.5} ${BOTTOM_Y + 12} l 2.5 2.5 l 4.5 -5`}
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
