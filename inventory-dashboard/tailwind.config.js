/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        primary: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        label: 'var(--text-label)',
        success: 'var(--green)',
        'success-light': 'var(--green-light)',
        warning: 'var(--orange)',
        'warning-light': 'var(--orange-light)',
        danger: 'var(--red)',
        'danger-light': 'var(--red-light)',
        accent: 'var(--blue)',
        'accent-light': 'var(--blue-light)',
        secondary: 'var(--purple)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      fontSize: {
        '10px': '10px',
        '11px': '11px',
      }
    },
  },
  plugins: [],
}
