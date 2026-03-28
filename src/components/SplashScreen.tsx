import { COLOR_VALUES } from "../game/types";
import { SceneBackground } from "./SceneBackground";

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

export default function SplashScreen({
    onStart,
    onHowToPlay,
    soundOn = true,
    onToggleSound,
}: SplashScreenProps) {
    return (
        <SceneBackground variant="splash">
            <div className="splash-screen">
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
        </SceneBackground>
    );
}
