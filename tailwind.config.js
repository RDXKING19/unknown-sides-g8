/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka One"', 'Nunito', 'sans-serif'],
        body: ['Nunito', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.35rem' }],
        'sm': ['1rem', { lineHeight: '1.5rem' }],
        'base': ['1.125rem', { lineHeight: '1.7rem' }],
        'lg': ['1.25rem', { lineHeight: '1.8rem' }],
        'xl': ['1.45rem', { lineHeight: '1.95rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.2rem' }],
        '3xl': ['2.15rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.65rem', { lineHeight: '2.9rem' }],
      },
      colors: {
        primary: '#8b5cf6',
        gold: '#facc15',
        wonder: '#c084fc',
        story: '#fb923c',
        simulate: '#38bdf8',
        play: '#4ade80',
        reflect: '#818cf8',
        world0: '#f472b6',
        world1: '#fb923c',
        world2: '#fbbf24',
        world3: '#4ade80',
        world4: '#38bdf8',
        world5: '#818cf8',
        world6: '#c084fc',
        world7: '#22d3ee',
        world8: '#facc15',
        world9: '#f43f5e',
        'tri-leg-a': '#38bdf8',
        'tri-leg-b': '#fb923c',
        'tri-hyp': '#c084fc',
        'tri-known': '#facc15',
        'tri-unknown': '#f43f5e',
        'tri-ok': '#4ade80'
      }
    },
  },
  plugins: [],
}
