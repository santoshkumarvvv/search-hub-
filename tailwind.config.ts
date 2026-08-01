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
        danger:    '#f85149',
        // Cyberpunk specific colors
        cyber: {
          neon: '#00ffff',
          magenta: '#ff00ff',
          yellow: '#ffff00',
          green: '#00ff00',
          red: '#ff0040',
          blue: '#0080ff',
          purple: '#8000ff',
          orange: '#ff8000'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
      },
      animation: {
        'fade-in':  'fadeIn .25s ease',
        'slide-up': 'slideUp .3s ease',
        'shimmer':  'shimmer 1.5s infinite',
        // Cyberpunk animations
        'cyber-pulse': 'cyberPulse 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scan': 'scan 4s linear infinite',
        'flicker': 'flicker 0.1s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        // Cyberpunk keyframes
        cyberPulse: {
          '0%, 100%': { 
            opacity: '1',
            filter: 'brightness(1)',
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
          },
          '50%': { 
            opacity: '0.9',
            filter: 'brightness(1.3)',
            textShadow: '0 0 15px currentColor, 0 0 30px currentColor, 0 0 45px currentColor'
          }
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' }
        }
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(88, 166, 255, 0.3), 0 0 40px rgba(88, 166, 255, 0.1)',
        'cyber-lg': '0 0 30px rgba(88, 166, 255, 0.4), 0 0 60px rgba(88, 166, 255, 0.2)',
        'cyber-magenta': '0 0 20px rgba(255, 0, 255, 0.3), 0 0 40px rgba(255, 0, 255, 0.1)',
        'cyber-neon': '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)'
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)',
        'neon-gradient': 'linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff)',
        'magenta-glow': 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)',
        'cyan-glow': 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)'
      }
    }
  },
  plugins: []
} satisfies Config;
