/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        panel: '#0a0a0a',
        sidebar: '#050505',
        accent: '#a3a3a3',
        'accent-hover': '#d4d4d4',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        border: '#1a1a1a',
        input: '#141414',
        ring: '#525252',
        foreground: '#fafafa',
        muted: { DEFAULT: '#171717', foreground: '#737373' },
        card: { DEFAULT: '#0a0a0a', foreground: '#fafafa' },
        popover: { DEFAULT: '#0a0a0a', foreground: '#fafafa' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { lg: '0.5rem', md: '0.375rem', sm: '0.25rem' },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 255, 255, 0.03)',
        'glow-sm': '0 0 10px rgba(255, 255, 255, 0.02)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateY(-8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
