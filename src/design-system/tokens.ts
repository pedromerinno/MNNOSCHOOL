/**
 * Design System Tokens
 * Tokens reutilizáveis baseados nas páginas favoritas: Home, My Courses e Dashboard
 */

// ============================================================================
// Cores
// ============================================================================

export const colors = {
  // Backgrounds principais
  background: {
    light: '#F8F7F4',
    dark: '#191919',
  },
  // Cards
  card: {
    light: '#FFFFFF',
    dark: '#222222',
    hoverLight: '#F5F5F5',
    hoverDark: '#2C2C2C',
  },
  // Texto
  text: {
    primaryLight: '#1A1A1A',
    primaryDark: '#FFFFFF',
    secondaryLight: '#6B7280',
    secondaryDark: '#9CA3AF',
    mutedLight: '#757576',
  },
} as const;

// ============================================================================
// Espaçamento
// ============================================================================

export const spacing = {
  // Padding
  container: {
    mobile: '1rem',      // px-4
    desktop: '2rem',     // lg:px-8
  },
  card: {
    default: '1.5rem',   // p-6
    compact: '1rem',     // p-4
  },
  // Gaps
  gap: {
    small: '1rem',       // gap-4
    medium: '1.5rem',    // gap-6
    large: '2rem',       // gap-8
  },
  // Margins
  section: {
    small: '2rem',      // mb-8
    large: '4rem',      // mb-16
  },
} as const;

// ============================================================================
// Tipografia
// ============================================================================

export const typography = {
  fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
  // Tamanhos
  sizes: {
    hero: {
      mobile: '24px',
      desktop: '40px',
    },
    h1: {
      mobile: '1.5rem',    // text-2xl
      desktop: '1.875rem', // md:text-3xl
    },
    h2: '1.25rem',         // text-xl
    body: '1rem',          // text-base
    small: '0.875rem',     // text-sm
    tiny: '0.75rem',       // text-xs
  },
  // Pesos
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  // Line heights
  lineHeights: {
    tight: '1.1',
    normal: '1.5',
  },
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  small: '0.5rem',      // rounded-lg
  medium: '1rem',      // rounded-xl
  large: '1.5rem',     // rounded-2xl
  extraLarge: '1.875rem', // rounded-[30px]
  full: '9999px',      // rounded-full
} as const;

// ============================================================================
// Transições e Animações
// ============================================================================

export const transitions = {
  duration: {
    fast: '300ms',
    medium: '500ms',
    slow: '700ms',      // Padrão das páginas favoritas
  },
  easing: {
    default: 'ease-out',
    smooth: 'ease-in-out',
  },
  // Delays para animações sequenciais
  delays: {
    sequential: (index: number, baseDelay: number = 100) => 
      `${index * baseDelay}ms`,
  },
} as const;

// ============================================================================
// Breakpoints
// ============================================================================

export const breakpoints = {
  mobile: '640px',
  tablet: '768px',      // md
  desktop: '1024px',    // lg
  wide: '1280px',      // xl
  extraWide: '1536px', // 2xl
} as const;

// ============================================================================
// Layout
// ============================================================================

export const layout = {
  container: {
    maxWidth: '1600px',
    padding: {
      mobile: '1rem',
      desktop: '2rem',
    },
  },
  sidebar: {
    width: '16rem',     // w-64 (256px)
  },
  // Aspect ratios comuns
  aspectRatios: {
    hero: '16/7',
    card: '16/9',
    square: '1/1',
  },
} as const;

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  // Shadows customizadas das páginas
  cardHover: {
    light: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
    dark: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
  },
} as const;

// ============================================================================
// Z-Index
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// Helpers para Classes Tailwind
// ============================================================================

/**
 * Gera classes para background padrão das páginas
 */
export const getPageBackgroundClasses = () => 
  'bg-[#F8F7F4] dark:bg-[#191919]';

/**
 * Gera classes para card padrão
 */
export const getCardClasses = (variant: 'default' | 'hover' = 'default') => {
  const base = 'bg-white dark:bg-[#222222]';
  if (variant === 'hover') {
    return `${base} hover:bg-gray-50 dark:hover:bg-[#2C2C2C]`;
  }
  return base;
};

/**
 * Gera classes para transição padrão
 */
export const getTransitionClasses = (duration: 'fast' | 'medium' | 'slow' = 'slow') => {
  const durations = {
    fast: 'duration-300',
    medium: 'duration-500',
    slow: 'duration-700',
  };
  return `transition-all ${durations[duration]} ease-out`;
};

/**
 * Gera classes para animação de entrada
 */
export const getFadeInClasses = (isVisible: boolean) => 
  `transition-all duration-700 ease-out ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`;

/**
 * Gera classes para container responsivo
 */
export const getContainerClasses = () => 
  'w-full max-w-[1600px] mx-auto px-4 lg:px-8';

/**
 * Gera classes para grid responsivo
 */
export const getGridClasses = (cols: { mobile: number; tablet: number; desktop: number }) => 
  `grid grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} gap-6`;






