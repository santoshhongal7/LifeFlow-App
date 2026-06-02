/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gradient-fitness-start': '#f093fb',
        'gradient-fitness-end': '#f5576c',
        'gradient-wellness-start': '#4facfe',
        'gradient-wellness-end': '#00f2fe',
        'gradient-mindfulness-start': '#a18cd1',
        'gradient-mindfulness-end': '#fbc2eb',
        'gradient-sports-start': '#43e97b',
        'gradient-sports-end': '#38f9d7',
        'gradient-diet-start': '#fa709a',
        'gradient-diet-end': '#fee140',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'pill': '100px',
        'btn': '12px',
      },
      backdropBlur: {
        'glass': '24px',
      },
    },
  },
  plugins: [],
}
