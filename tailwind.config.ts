import type { Config } from 'tailwindcss';

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: {
          from: withAlpha('--page-from'),
          to: withAlpha('--page-to'),
        },
        shell: withAlpha('--shell'),
        surface: {
          DEFAULT: withAlpha('--surface'),
          raised: withAlpha('--surface-raised'),
          sunken: withAlpha('--surface-sunken'),
        },
        ink: {
          DEFAULT: withAlpha('--ink'),
          soft: withAlpha('--ink-soft'),
          mute: withAlpha('--ink-mute'),
        },
        accent: {
          DEFAULT: withAlpha('--accent'),
          hover: withAlpha('--accent-hover'),
          soft: withAlpha('--accent-soft'),
          deep: withAlpha('--accent-deep'),
        },
        success: withAlpha('--success'),
        warning: withAlpha('--warning'),
        danger: withAlpha('--danger'),
        info: withAlpha('--info'),
        line: withAlpha('--line'),
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        card: '22px',
        shell: '28px',
        pill: '999px',
      },
      boxShadow: {
        shell: '0 20px 60px rgba(90,70,170,0.15)',
        card: '0 8px 24px rgba(80,65,150,0.06)',
        kpi: '0 10px 30px rgba(90,70,170,0.07)',
        pop: '0 24px 60px rgba(35,25,80,0.18)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      spacing: {
        18: '4.5rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-24' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'dash-flow': 'dash-flow 1.2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
