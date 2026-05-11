import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        neon: {
          cyan:   '#00D4FF',
          purple: '#7B2FFF',
          gold:   '#F0B90B',
          green:  '#00FF88',
          red:    '#FF3366',
          pink:   '#FF2D78',
        },
        crystal: {
          bg:      '#060912',
          surface: '#0D1117',
          card:    '#0F1621',
          border:  '#1A2332',
          hover:   '#141D2B',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
        'gold-gradient': 'linear-gradient(135deg, #F0B90B, #FF8C00)',
        'danger-gradient': 'linear-gradient(135deg, #FF3366, #FF0040)',
        'success-gradient': 'linear-gradient(135deg, #00FF88, #00CC6A)',
      },
      boxShadow: {
        'neon-cyan':   '0 0 8px rgba(0,212,255,0.4), 0 0 24px rgba(0,212,255,0.15)',
        'neon-purple': '0 0 8px rgba(123,47,255,0.4), 0 0 24px rgba(123,47,255,0.15)',
        'neon-gold':   '0 0 8px rgba(240,185,11,0.5), 0 0 24px rgba(240,185,11,0.2)',
        'neon-green':  '0 0 8px rgba(0,255,136,0.4), 0 0 24px rgba(0,255,136,0.15)',
        'neon-red':    '0 0 8px rgba(255,51,102,0.4), 0 0 24px rgba(255,51,102,0.15)',
        'card-glow':   '0 4px 24px rgba(0,0,0,0.4), 0 0 1px rgba(0,212,255,0.1)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.5), 0 0 16px rgba(0,212,255,0.12)',
      },
      animation: {
        'float':          'float 4s ease-in-out infinite',
        'neon-flicker':   'neon-flicker 3s infinite',
        'slide-left':     'slide-in-left 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up':       'slide-in-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'gradient':       'gradient-shift 4s linear infinite',
        'spin-slow':      'rotate-slow 8s linear infinite',
        'spin-reverse':   'rotate-slow 12s linear infinite reverse',
        'pulse-ring':     'pulse-ring 2s ease-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'scan-line':      'scan-line 3s linear infinite',
        'number-tick':    'number-tick 0.3s ease both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'neon-flicker': {
          '0%,19%,21%,23%,25%,54%,56%,100%': { opacity: '1' },
          '20%,24%,55%':                      { opacity: '0.6' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-30px)', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'number-tick': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
