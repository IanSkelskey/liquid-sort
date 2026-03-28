import type { ReactNode } from 'react';

import './SceneBackground.css';

type BubbleSpec = {
  size: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
};

type SceneBackgroundProps = {
  children: ReactNode;
  variant?: 'splash' | 'game';
};

const BUBBLE_LAYOUTS: Record<NonNullable<SceneBackgroundProps['variant']>, BubbleSpec[]> = {
  splash: [
    { size: 20, top: '14%', left: '12%', delay: '0s', duration: '8s' },
    { size: 10, top: '22%', left: '18%', delay: '1s', duration: '7s' },
    { size: 16, top: '68%', left: '10%', delay: '2s', duration: '9s' },
    { size: 14, top: '18%', left: '80%', delay: '1.5s', duration: '8s' },
    { size: 24, top: '70%', left: '84%', delay: '0.5s', duration: '10s' },
    { size: 12, top: '58%', left: '72%', delay: '2.5s', duration: '7s' },
  ],
  game: [
    { size: 18, top: '10%', left: '10%', delay: '0s', duration: '9s' },
    { size: 10, top: '19%', left: '20%', delay: '1.2s', duration: '7s' },
    { size: 16, top: '66%', left: '12%', delay: '2.1s', duration: '8.5s' },
    { size: 14, top: '14%', left: '82%', delay: '0.8s', duration: '8.2s' },
    { size: 26, top: '71%', left: '86%', delay: '1.6s', duration: '10.5s' },
    { size: 12, top: '56%', left: '74%', delay: '2.8s', duration: '7.2s' },
  ],
};

export function SceneBackground({
  children,
  variant = 'splash',
}: SceneBackgroundProps) {
  const bubbles = BUBBLE_LAYOUTS[variant];

  return (
    <div className={`scene-background scene-background--${variant}`}>
      <div className="scene-background__layer scene-background__layer--atmosphere" />
      <div className="scene-background__layer scene-background__layer--vignette" />

      <div className="scene-background__glow scene-background__glow--1" />
      <div className="scene-background__glow scene-background__glow--2" />
      <div className="scene-background__glow scene-background__glow--3" />

      <div className="scene-background__stars" />

      {bubbles.map((bubble, index) => (
        <div
          key={`bubble-${index}`}
          className="scene-background__bubble"
          style={{
            width: bubble.size,
            height: bubble.size,
            top: bubble.top,
            left: bubble.left,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        />
      ))}

      <div className="scene-background__content">{children}</div>
    </div>
  );
}
