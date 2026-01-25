/**
 * Design System V2 - UzzAI Peladeiros
 *
 * Sistema de design centralizado com tokens de cores, espaçamentos,
 * tipografia e gradientes por feature.
 *
 * Baseado em ARQUITETURA-V2.md
 */

// ============================================================================
// CORES BASE - UzzAI Brand
// ============================================================================

export const colors = {
  // Cores principais da marca
  brand: {
    mint: '#1ABC9C',      // Ações principais, sucesso
    blue: '#2E86AB',      // Navegação, informação
    gold: '#FFD700',      // Premium, créditos
    silver: '#C0C0C0',    // Secundário
    black: '#0A0A0A',     // Background principal
  },

  // Cores por feature/seção
  features: {
    modalities: {
      primary: '#3B82F6',     // Blue-500
      secondary: '#06B6D4',   // Cyan-500
      gradient: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
    },
    athletes: {
      primary: '#10B981',     // Green-500
      secondary: '#14B8A6',   // Teal-500
      gradient: 'from-green-500 to-teal-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-500',
    },
    trainings: {
      primary: '#8B5CF6',     // Violet-500
      secondary: '#A855F7',   // Purple-500
      gradient: 'from-violet-500 to-purple-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-500',
    },
    games: {
      primary: '#F59E0B',     // Amber-500
      secondary: '#F97316',   // Orange-500
      gradient: 'from-amber-500 to-orange-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-500',
    },
    financial: {
      primary: '#EAB308',     // Yellow-500
      secondary: '#F59E0B',   // Amber-500
      gradient: 'from-yellow-500 to-amber-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-500',
    },
    attendance: {
      primary: '#EC4899',     // Pink-500
      secondary: '#F472B6',   // Pink-400
      gradient: 'from-pink-500 to-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-500',
    },
    rankings: {
      primary: '#6366F1',     // Indigo-500
      secondary: '#8B5CF6',   // Violet-500
      gradient: 'from-indigo-500 to-violet-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-500',
    },
    analytics: {
      primary: '#06B6D4',     // Cyan-500
      secondary: '#0EA5E9',   // Sky-500
      gradient: 'from-cyan-500 to-sky-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-500',
    },
  },

  // Estados
  status: {
    success: '#10B981',   // Green-500
    warning: '#F59E0B',   // Amber-500
    error: '#EF4444',     // Red-500
    info: '#3B82F6',      // Blue-500
  },
} as const;

// ============================================================================
// ESPAÇAMENTOS
// ============================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const typography = {
  fonts: {
    heading: 'var(--font-poppins)',   // Poppins para títulos
    body: 'var(--font-inter)',        // Inter para corpo
    mono: 'var(--font-mono)',         // Monospace para código
    metric: 'var(--font-exo2)',       // Exo 2 para números/métricas
  },

  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// ============================================================================
// BORDAS E RAIOS
// ============================================================================

export const borders = {
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },

  width: {
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
} as const;

// ============================================================================
// SOMBRAS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// TRANSIÇÕES
// ============================================================================

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// BREAKPOINTS (Tailwind defaults)
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// HELPERS - Funções utilitárias
// ============================================================================

/**
 * Retorna as classes de cores para uma feature específica
 */
export function getFeatureColors(feature: keyof typeof colors.features) {
  return colors.features[feature];
}

/**
 * Retorna classe de gradiente para uma feature
 */
export function getFeatureGradient(feature: keyof typeof colors.features) {
  return `bg-gradient-to-br ${colors.features[feature].gradient}`;
}

/**
 * Retorna classes completas para um card de métrica por feature
 */
export function getMetricCardClasses(feature: keyof typeof colors.features) {
  const featureColors = colors.features[feature];
  return {
    container: `rounded-lg border ${featureColors.border} ${featureColors.bg} p-6`,
    gradient: `bg-gradient-to-br ${featureColors.gradient}`,
    text: featureColors.text,
    bg: featureColors.bg,
    border: featureColors.border,
  };
}

// ============================================================================
// ÍCONES POR FEATURE
// ============================================================================

export const featureIcons = {
  modalities: 'Dumbbell',
  athletes: 'Users',
  trainings: 'Calendar',
  games: 'Trophy',
  financial: 'DollarSign',
  attendance: 'CheckCircle',
  rankings: 'Medal',
  analytics: 'BarChart3',
} as const;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export const designSystem = {
  colors,
  spacing,
  typography,
  borders,
  shadows,
  transitions,
  breakpoints,
  featureIcons,
  getFeatureColors,
  getFeatureGradient,
  getMetricCardClasses,
} as const;

export default designSystem;
