import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#007A5E',
          deep: '#005C47',
          light: '#00A67E',
          50: '#F0FAF6',
        },
        gold: {
          DEFAULT: '#E8A000',
          light: '#FFB830',
          pale: '#FFF3D0',
        },
        ink: {
          DEFAULT: '#0F1F1A',
          soft: '#1E3329',
        },
        slate: '#3D5A50',
        cream: '#FAF7F2',
        mist: '#F0F4F2',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0, 122, 94, 0.08)',
        elevated: '0 8px 32px rgba(15, 31, 26, 0.12)',
        gold: '0 4px 24px rgba(232, 160, 0, 0.2)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
