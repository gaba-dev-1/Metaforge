const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}', 
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Solar Eclipse Color System
        'void-core': '#1c1917',
        'eclipse-shadow': '#292524',
        'solar-flare': '#f59e0b',
        'corona-light': '#fef3c7',
        'stellar-white': '#fafafa',
        'cosmic-dust': '#d6d3d1',
        'verdant-success': '#84cc16',
        'burning-warning': '#fb923c',
        'crimson-alert': '#dc2626',
        
        // Legacy colors for backward compatibility
        brown: '#1c1917',
        'brown-light': '#292524',
        cream: '#fef3c7',
        'cream-dark': '#E5D9BC',
        'gold': '#f59e0b',
        'gold-light': '#fb923c',
      },
      backgroundImage: { 
        'main-bg': "url('/assets/app/bg.jpg')",
        'eclipse-gradient': 'linear-gradient(to right, #1c1917, #292524)',
        'solar-horizon': 'linear-gradient(to right, #f59e0b, #fb923c)',
        'dark-matter': 'radial-gradient(circle at center, #292524, #1c1917)',
      },
      fontFamily: {
        sans: ['Exo 2', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'massive': ['42px', '52px'],
        'xlarge': ['32px', '40px'],
        'large': ['24px', '32px'],
      },
      zIndex: { 
        '60': '60', 
        '70': '70' 
      },
      minWidth: { 
        '24': '6rem',
        '16': '4rem',
        '32': '8rem',
      },
      maxWidth: { 
        '28': '7rem', 
        '32': '8rem' 
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'solar': '0 4px 14px rgba(245, 158, 11, 0.25)',
        'inner-solar': 'inset 0 2px 4px 0 rgba(245, 158, 11, 0.05)',
        'eclipse': '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
  safelist: [
    'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'min-w-24',
    'animate-pulse', 'animate-glow-pulse', 'animate-float',
    'opacity-50', 'blur-sm',
    'touch-manipulation', 'touch-pan-y',
    'bg-void-core', 'bg-eclipse-shadow', 'text-corona-light', 'text-solar-flare',
    'border-solar-flare', 'border-solar-flare/30', 'border-solar-flare/50',
    'shadow-solar', 'shadow-inner-solar', 'shadow-eclipse'
  ]
}
