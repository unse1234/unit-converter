import type { SVGProps } from 'react';

/**
 * Local icon set.
 *
 * An icon library would add a dependency and bundle weight for the dozen
 * glyphs this product actually uses, so these are inlined. They share one
 * geometry (24px grid, 1.5 stroke, round caps) so they sit together evenly.
 *
 * Icons here are decorative: they are marked aria-hidden and the accessible
 * name always comes from adjacent text or the control's own label.
 */

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SwapIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 4v16m0 0-3.5-3.5M7 20l3.5-3.5" />
    <path d="M17 20V4m0 0-3.5 3.5M17 4l3.5 3.5" />
  </Icon>
);

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Icon>
);

export const StarIcon = ({ filled = false, ...props }: IconProps & { filled?: boolean }) => (
  <Icon {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
  </Icon>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </Icon>
);

export const MonitorIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M9 20h6m-3-4v4" />
  </Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const HistoryIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4.5l3 1.8" />
  </Icon>
);

export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5" />
    <circle cx="12" cy="16.25" r="0.75" fill="currentColor" stroke="none" />
  </Icon>
);

export const InfoIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16.5V11" />
    <circle cx="12" cy="7.75" r="0.75" fill="currentColor" stroke="none" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/* Category icons                                                              */
/* -------------------------------------------------------------------------- */

const categoryIcons: Record<string, (props: IconProps) => React.ReactElement> = {
  ruler: (props) => (
    <Icon {...props}>
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <path d="M7 7v3m5-3v4m5-4v3" />
    </Icon>
  ),
  scale: (props) => (
    <Icon {...props}>
      <path d="M12 4v16M7 20h10" />
      <path d="M5 8h14l-3 6H8z" />
    </Icon>
  ),
  thermometer: (props) => (
    <Icon {...props}>
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z" />
    </Icon>
  ),
  beaker: (props) => (
    <Icon {...props}>
      <path d="M9 3v6.5L4.5 17A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-3L15 9.5V3" />
      <path d="M8 3h8M6.5 14h11" />
    </Icon>
  ),
  square: (props) => (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9.5h17M9.5 3.5v17" />
    </Icon>
  ),
  gauge: (props) => (
    <Icon {...props}>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="m12 18 4.5-5" />
    </Icon>
  ),
  'gauge-high': (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 12l4-4M12 3.5v2" />
    </Icon>
  ),
  clock: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.3 2" />
    </Icon>
  ),
  database: (props) => (
    <Icon {...props}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </Icon>
  ),
  bolt: (props) => (
    <Icon {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5 9-11.5h-6.5z" />
    </Icon>
  ),
  plug: (props) => (
    <Icon {...props}>
      <path d="M9 3v6m6-6v6" />
      <path d="M6 9h12v2a6 6 0 0 1-12 0z" />
      <path d="M12 17v4" />
    </Icon>
  ),
  wifi: (props) => (
    <Icon {...props}>
      <path d="M2.5 9a14 14 0 0 1 19 0M6 12.5a9 9 0 0 1 12 0M9.5 16a4 4 0 0 1 5 0" />
      <circle cx="12" cy="19.5" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  ),
  fuel: (props) => (
    <Icon {...props}>
      <path d="M4 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15" />
      <path d="M3 20h11M13 10h3a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V9l-2.5-2.5" />
    </Icon>
  ),
  compass: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-2 5-4 1 2-5z" />
    </Icon>
  ),
  waves: (props) => (
    <Icon {...props}>
      <path d="M2 8c2.5-3 5.5-3 8 0s5.5 3 8 0" />
      <path d="M2 14c2.5-3 5.5-3 8 0s5.5 3 8 0" />
    </Icon>
  ),
  'arrow-down': (props) => (
    <Icon {...props}>
      <path d="M12 4v14m0 0-5-5m5 5 5-5" />
    </Icon>
  ),
  rotate: (props) => (
    <Icon {...props}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20.5 3.5V8H16" />
    </Icon>
  ),
  'trending-up': (props) => (
    <Icon {...props}>
      <path d="M3 17 9.5 10l4 4L21 6" />
      <path d="M15.5 6H21v5.5" />
    </Icon>
  ),
  layers: (props) => (
    <Icon {...props}>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </Icon>
  ),
  droplet: (props) => (
    <Icon {...props}>
      <path d="M12 3.5s6 6.4 6 10.2a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z" />
    </Icon>
  ),
  zap: (props) => (
    <Icon {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5 9-11.5h-6.5z" />
    </Icon>
  ),
  battery: (props) => (
    <Icon {...props}>
      <rect x="2.5" y="7" width="16" height="10" rx="2" />
      <path d="M21.5 10.5v3" />
      <path d="M6 10.5v3m3.5-3v3" />
    </Icon>
  ),
  magnet: (props) => (
    <Icon {...props}>
      <path d="M5 4v8a7 7 0 0 0 14 0V4h-4v8a3 3 0 0 1-6 0V4z" />
    </Icon>
  ),
  sun: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  ),
  lightbulb: (props) => (
    <Icon {...props}>
      <path d="M9 17a6 6 0 1 1 6 0v2H9z" />
      <path d="M10 22h4" />
    </Icon>
  ),
  radiation: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 4.5 9.5 9m5 0L12 4.5M4.8 16l4.7-2.5M19.2 16l-4.7-2.5" />
    </Icon>
  ),
  type: (props) => (
    <Icon {...props}>
      <path d="M4 6V4h16v2M12 4v16M9 20h6" />
    </Icon>
  ),
};

/** Renders a category icon by key, falling back to a neutral glyph. */
export function CategoryIcon({ name, ...props }: IconProps & { name: string }) {
  const Glyph = categoryIcons[name] ?? categoryIcons.square;
  return Glyph ? <Glyph {...props} /> : null;
}
