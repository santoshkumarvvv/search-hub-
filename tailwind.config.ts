import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink:       '#0d1117',
        panel:     '#161b22',
        panel2:    '#1c2333',
        line:      '#30363d',
        muted:     '#8b949e',
        accent:    '#58a6ff',
        accent2:   '#3fb950',
        highlight: '#f0883e',
        pink:      '#db61a2',
        purple:    '#bc8cff',
        danger:    '#f85149'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in':  'fadeIn .25s ease',
        'slide-up': 'slideUp .3s ease',
        'shimmer':  'shimmer 1.5s infinite'
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
