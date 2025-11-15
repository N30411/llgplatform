// Modern dashboard color palette for charts and components
// Updated to a lighter, more modern palette (indigo primary, cyan secondary)
export const COLORS = {
  primary: {
    DEFAULT: '#0ea5e9', // cyan-500
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0ea5e9',
    700: '#0891b2',
    800: '#0e7490',
    900: '#155e75',
  },
  secondary: {
    DEFAULT: '#f59e42', // bright orange
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f59e42',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  accent: {
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#fde047',
    pink: '#ec4899',
  },
  success: {
    DEFAULT: '#10b981',
    light: '#d1fae5',
    dark: '#059669',
  },
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fef3c7',
    dark: '#d97706',
  },
  error: {
    DEFAULT: '#ef4444',
    light: '#fee2e2',
    dark: '#dc2626',
  },
  text: {
    DEFAULT: '#1e293b', // slate-800
    secondary: '#475569',
    light: '#64748b',
  },
  background: '#f8fafc', // clean, light background
};

// Chart color palettes - broader and more modern set
export const CHART_COLORS = [
  COLORS.primary.DEFAULT,
  COLORS.secondary.DEFAULT,
  COLORS.accent.violet,
  COLORS.accent.rose,
  COLORS.success.DEFAULT,
  COLORS.warning.DEFAULT,
];

// Status color mapping (keeps semantic meaning)
export const STATUS_COLORS = {
  completed: COLORS.success.DEFAULT,
  'in-progress': COLORS.secondary.DEFAULT,
  planned: COLORS.warning.DEFAULT,
  blocked: COLORS.error.DEFAULT,
};

// Gradient definitions (kept as tailwind-like tokens where useful, and also provide CSS fallback)
export const GRADIENTS = {
  primary: `from-primary-500 to-primary-600`,
  primaryCSS: `linear-gradient(90deg, ${COLORS.primary[500]} 0%, ${COLORS.primary[600]} 100%)`,
  secondary: `from-secondary-400 to-secondary-600`,
  secondaryCSS: `linear-gradient(90deg, ${COLORS.secondary[400]} 0%, ${COLORS.secondary[600]} 100%)`,
  success: `from-success-light to-success-DEFAULT`,
  warning: `from-warning-light to-warning-DEFAULT`,
  error: `from-error-light to-error-DEFAULT`,
};