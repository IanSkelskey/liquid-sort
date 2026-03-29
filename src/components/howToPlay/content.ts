import {
  Check,
  Droplets,
  FlaskConical,
  MoveRight,
  Shuffle,
  Undo2,
  type LucideIcon,
} from 'lucide-react';

export type HowToPlaySection = 'basics' | 'rules' | 'tools';

export type HowToPlayTab = {
  key: HowToPlaySection;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HowToPlayItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const HOW_TO_PLAY_SECTIONS: HowToPlayTab[] = [
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

export const HOW_TO_PLAY_RULES: HowToPlayItem[] = [
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

export const HOW_TO_PLAY_TOOLS: HowToPlayItem[] = [
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
