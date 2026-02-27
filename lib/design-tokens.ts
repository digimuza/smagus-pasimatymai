// Design Tokens — single source of truth for the design system
// Referenced by tailwind.config.ts and used directly in components

export const colors = {
  background: {
    DEFAULT: '#0f0818',
    light: '#1a1025',
    lighter: '#251832',
  },
  primary: {
    DEFAULT: '#c084fc',
    light: '#d8b4fe',
    dark: '#a855f7',
  },
  accent: {
    DEFAULT: '#fb7185',
    light: '#fda4af',
    dark: '#f43f5e',
  },
  text: {
    DEFAULT: '#f3e8ff',
    muted: '#c4b5fd',
    dimmed: '#a78bfa',
  },
  success: '#34d399',
  warning: '#fbbf24',
  info: '#60a5fa',
  mode: {
    couples: {
      DEFAULT: '#9B59B6',
      light: '#BB8FCE',
      dark: '#7D3C98',
    },
    family: {
      DEFAULT: '#3498DB',
      light: '#7FB3D8',
      dark: '#2471A3',
    },
    friends: {
      DEFAULT: '#E67E22',
      light: '#F0B27A',
      dark: '#CA6F1E',
    },
  },
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
  md: '0 4px 16px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
  glow: {
    primary: `0 4px 20px ${colors.primary.DEFAULT}25`,
    accent: `0 4px 20px ${colors.accent.DEFAULT}25`,
  },
} as const;

export const typography = {
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  subheading: {
    fontSize: '1.5rem',
    fontWeight: '300',
    lineHeight: '1.3',
  },
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  caption: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.4',
  },
} as const;
