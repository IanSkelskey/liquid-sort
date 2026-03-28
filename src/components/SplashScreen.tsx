import { COLOR_VALUES } from "../game/types";

import './SplashScreen.css';

type SplashScreenProps = {
    onStart: () => void;
    onHowToPlay?: () => void;
    soundOn?: boolean;
    onToggleSound?: () => void;
}

function DecorativeVial({ colors }: { colors: string[] }) {
    const mergedColors = colors.reduce<Array<{ color: string; count: number }>>((runs, color) => {
        const lastRun = runs[runs.length - 1];

        if (lastRun && lastRun.color === color) {
            lastRun.count += 1;
            return runs;
        }

        runs.push({ color, count: 1 });
        return runs;
    }, []);

    return (
        <div className="splash-vial">
            <div className="splash-vial-rim" />
            <div className="splash-vial-glass">
                {mergedColors.map(({ color, count }, index) => (
                    <div
                        key={`${color}-${index}-${count}`}
                        className="splash-liquid-layer"
                        style={{
                            backgroundColor: color,
                            height: `${count * 25}%`,
                        }}
                    />
                ))}
                <div className="splash-vial-shine" />
            </div>
        </div>
    );
}

function FloatingBubble({
    size,
    top,
    left,
    delay,
    duration,
}: {
    size: number;
    top: string;
    left: string;
    delay: string;
    duration: string;
}) {
    return (
        <div
            className="splash-bubble"
            style={{
                width: size,
                height: size,
                top,
                left,
                animationDelay: delay,
                animationDuration: duration,
            }}
        />
    )
}

export default function SplashScreen({
    onStart,
    onHowToPlay,
    soundOn = true,
    onToggleSound,
}: SplashScreenProps) {
    return (
        <div className="splash-screen">
            <div className="splash-bg-glow splash-bg-glow-1" />
            <div className="splash-bg-glow splash-bg-glow-2" />
            <div className="splash-bg-glow splash-bg-glow-3" />

            <div className="splash-stars" />

            <FloatingBubble size={20} top="14%" left="12%" delay="0s" duration="8s" />
            <FloatingBubble size={10} top="22%" left="18%" delay="1s" duration="7s" />
            <FloatingBubble size={16} top="68%" left="10%" delay="2s" duration="9s" />
            <FloatingBubble size={14} top="18%" left="80%" delay="1.5s" duration="8s" />
            <FloatingBubble size={24} top="70%" left="84%" delay="0.5s" duration="10s" />
            <FloatingBubble size={12} top="58%" left="72%" delay="2.5s" duration="7s" />

            <div className="splash-content">
                <div className="splash-badge">✨ Alchemical Puzzle Game</div>
                <h1 className="splash-title">
                    <span className="splash-title-liquid">Liquid</span>
                    <span className="splash-title-sort">Sort</span>
                </h1>
                <div className="splash-vial-row" aria-hidden="true">
                    {Object.values(COLOR_VALUES).slice(0, 5).map((color, index) => (
                        <DecorativeVial key={index} colors={[color, color, color]} />
                    ))}
                </div>

                <div className="splash-actions">
                    <button className="splash-btn splash-btn-primary" onClick={onStart}>▶ Play</button>
                    {onHowToPlay && (
                        <button className="splash-btn splash-btn-secondary" onClick={onHowToPlay}>❔ How to Play</button>
                    )}
                    {onToggleSound && (
                        <button className="splash-btn splash-btn-ghost" onClick={onToggleSound}>
                            {soundOn ? "🔊 Sound On" : "🔈 Sound Off"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
