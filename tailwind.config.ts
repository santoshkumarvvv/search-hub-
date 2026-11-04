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
        panel2:    '#181824',
        line:      '#262638',
        muted:     '#a0a0b8',
        accent:    '#7c5cff',
        accent2:   '#00d2a0',
        highlight: '#f5c542',
        pink:      '#ff6b6b',
        purple:    '#7c5cff',
        danger:    '#ff6b6b',
        gold:      '#f5c542'
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      animation: {
        'fade-in':  'fadeIn .45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp .5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':  'shimmer 1.5s infinite'
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
