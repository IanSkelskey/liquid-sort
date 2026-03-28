import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Droplets,
  FlaskConical,
  MoveRight,
  Play,
  Shuffle,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { COLOR_VALUES } from '../game/types';
import { Vial } from './Vial';

import './HowToPlayScreen.css';

type HowToPlayScreenProps = {
  onBack: () => void;
  onStart: () => void;
};

type HowToPlaySection = 'basics' | 'rules' | 'tools';

const SECTIONS: Array<{
  key: HowToPlaySection;
  label: string;
  title: string;
  description: string;
  icon: typeof Droplets;
}> = [
  {
    key: 'basics',
    label: 'Basics',
    title: 'Make a valid pour',
    description: 'Choose a source vial, then choose a destination that can accept the top color.',
    icon: Droplets,
  },
  {
    key: 'rules',
    label: 'Rules',
    title: 'Remember the core rules',
    description: 'Every move follows a few simple constraints.',
    icon: Check,
  },
  {
    key: 'tools',
    label: 'Tools',
    title: 'Use helpers when needed',
    description: 'The toolbar can help you recover or create space.',
    icon: FlaskConical,
  },
];

const RULES = [
  {
    icon: Droplets,
    title: 'Only the top liquid moves',
    description: 'You can only pour the color that is currently on top of the source vial.',
  },
  {
    icon: MoveRight,
    title: 'Targets must be compatible',
    description: 'Pour into an empty vial or onto the same top color if there is still room.',
  },
  {
    icon: Check,
    title: 'Finish by grouping colors',
    description: 'You win when each non-empty vial contains only one color.',
  },
];

const TOOLS = [
  {
    icon: Undo2,
    title: 'Undo',
    description: 'Reverse your last move if you make a mistake.',
  },
  {
    icon: Shuffle,
    title: 'Shuffle',
    description: 'Reorder the selected vial when you want a fresh angle.',
  },
  {
    icon: FlaskConical,
    title: 'Add Vial',
    description: 'Spend coins to buy one extra empty vial for more breathing room.',
  },
];

export function HowToPlayScreen({ onBack, onStart }: HowToPlayScreenProps) {
  const [activeSection, setActiveSection] = useState<HowToPlaySection>('basics');
  const activeSectionMeta = SECTIONS.find((section) => section.key === activeSection) ?? SECTIONS[0];
  const activeIndex = SECTIONS.findIndex((section) => section.key === activeSection);
  const ActiveSectionIcon = activeSectionMeta.icon;

  return (
    <div className="how-to-play-screen">
      <div className="how-to-play-card">
        <div className="how-to-play-header">
          <div className="how-to-play-badge">
            <Sparkles className="how-to-play-badge-icon" aria-hidden="true" />
            <span>Quick Start Guide</span>
          </div>
          <h1 className="how-to-play-title">How to Play</h1>
          <p className="how-to-play-subtitle">
            Sort the liquids until every filled vial contains only one color.
          </p>
        </div>

        <div className="how-to-play-tabs" role="tablist" aria-label="How to play sections">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={`how-to-play-tab ${activeSection === key ? 'how-to-play-tab--active' : ''}`}
              aria-selected={activeSection === key}
              aria-label={label}
              onClick={() => setActiveSection(key)}
            >
              <span className="how-to-play-tab-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="how-to-play-tab-label">{label}</span>
            </button>
          ))}
        </div>

        <div className="how-to-play-stage">
          <section className="how-to-play-panel">
            <div className="how-to-play-panel-header">
              <span className="how-to-play-panel-step">Step {activeIndex + 1} of {SECTIONS.length}</span>
              <div className="how-to-play-panel-head">
                <span className="how-to-play-panel-icon" aria-hidden="true">
                  <ActiveSectionIcon />
                </span>
                <div>
                  <h2 className="how-to-play-panel-title">{activeSectionMeta.title}</h2>
                  <p className="how-to-play-panel-copy">{activeSectionMeta.description}</p>
                </div>
              </div>
            </div>

            {activeSection === 'basics' && (
              <div className="how-to-play-panel-body how-to-play-panel-body--basics">
                <div className="how-to-play-demo" aria-hidden="true">
                  <Vial
                    className="how-to-play-demo-vial"
                    segments={[COLOR_VALUES.yellow, COLOR_VALUES.red, COLOR_VALUES.red]}
                  />
                  <span className="how-to-play-demo-arrow">
                    <MoveRight />
                  </span>
                  <Vial
                    className="how-to-play-demo-vial"
                    segments={[COLOR_VALUES.red]}
                  />
                  <Vial className="how-to-play-demo-vial" segments={[]} />
                </div>

                <div className="how-to-play-note-list">
                  <div className="how-to-play-note">
                    <span className="how-to-play-note-title">Source</span>
                    <span className="how-to-play-note-copy">Tap the vial you want to pour from.</span>
                  </div>
                  <div className="how-to-play-note">
                    <span className="how-to-play-note-title">Target</span>
                    <span className="how-to-play-note-copy">Tap an empty vial or one with the same top color.</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'rules' && (
              <div className="how-to-play-panel-body">
                <div className="how-to-play-item-list">
                  {RULES.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="how-to-play-item">
                      <span className="how-to-play-item-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <div className="how-to-play-item-content">
                        <h3 className="how-to-play-item-title">{title}</h3>
                        <p className="how-to-play-item-copy">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'tools' && (
              <div className="how-to-play-panel-body">
                <div className="how-to-play-item-list">
                  {TOOLS.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="how-to-play-item">
                      <span className="how-to-play-item-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <div className="how-to-play-item-content">
                        <h3 className="how-to-play-item-title">{title}</h3>
                        <p className="how-to-play-item-copy">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="how-to-play-actions">
          <button className="how-to-play-btn how-to-play-btn--secondary" onClick={onBack}>
            <span className="how-to-play-btn-icon" aria-hidden="true">
              <ArrowLeft />
            </span>
            <span>Back</span>
          </button>
          <button className="how-to-play-btn how-to-play-btn--primary" onClick={onStart}>
            <span className="how-to-play-btn-icon" aria-hidden="true">
              <Play fill="currentColor" />
            </span>
            <span>Start Playing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
