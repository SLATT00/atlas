import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#0B0E13',
          'bg-secondary': '#121722',
          card: '#181E2B',
          elevated: '#1E2433',
          text: '#FFFFFF',
          'text-secondary': '#AAB3C5',
          muted: '#7D8797',
          success: '#17D97A',
          warning: '#F5B84D',
          error: '#FF5A6B',
          accent: '#3BC6C4',
          'accent-alt': '#4ED7D3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        header: ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        section: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'card-title': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        secondary: ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        label: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};

export default config;
