import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink:    '#0b0d14',
        panel:  '#141824',
        panel2: '#1c2130',
        line:   '#252b3b',
        muted:  '#8b93a7',
        accent: '#22c55e',
        accent2:'#38bdf8'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn .25s ease',
        'slide-up': 'slideUp .3s ease'
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } }
      }
    }
  },
  plugins: []
} satisfies Config;
