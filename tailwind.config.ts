import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink:       '#0a0a0f',
        panel:     '#12121a',
        panel2:    '#1a1a28',
        line:      '#2a2a3a',
        muted:     '#8a8a9a',
        accent:    '#6c5ce7',
        accent2:   '#00d2a0',
        highlight: '#f5c542',
        pink:      '#ff6b6b',
        purple:    '#6c5ce7',
        danger:    '#ff6b6b',
        gold:      '#f5c542'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in':  'fadeIn .25s ease',
        'slide-up': 'slideUp .3s ease',
        'shimmer': 'shimmer 1.5s infinite'
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
