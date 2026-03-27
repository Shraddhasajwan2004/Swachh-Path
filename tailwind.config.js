export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-bg':      '#050505',
        'cyber-accent':  '#00f3ff',
        'cyber-danger':  '#ff003c',
        'cyber-warning': '#ffb800',
        'cyber-success': '#00ff95',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};