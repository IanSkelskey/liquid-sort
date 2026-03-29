import './LiquidSortWordmark.css';

type LiquidSortWordmarkProps = {
  variant?: 'hero' | 'header';
  className?: string;
};

export function LiquidSortWordmark({
  variant = 'hero',
  className,
}: LiquidSortWordmarkProps) {
  const classes = ['liquid-sort-wordmark', `liquid-sort-wordmark--${variant}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      <span className="liquid-sort-wordmark__liquid">Liquid</span>
      <span className="liquid-sort-wordmark__sort">Sort</span>
    </span>
  );
}
