/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#000000",
        primary: "#ffffff",
        body: "#cccccc",
        'body-strong': "#e6e6e6",
        muted: "#999999",
        'muted-soft': "#666666",
        hairline: "#262626",
        'hairline-strong': "#3a3a3a",
        'surface-soft': "#0d0d0d",
        'surface-card': "#141414",
        'surface-elevated': "#1f1f1f",
        link: "#c3d9f3",
        warning: "#d4a017",
        success: "#5fa657",
      },
      fontFamily: {
        display: ['"Bugatti Display"', 'sans-serif'],
        text: ['"Bugatti Text Regular"', 'serif'],
        mono: ['"Bugatti Monospace"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wordmark: '6px',
        display: '2px',
        caption: '2px',
        button: '2.5px',
      },
      borderRadius: {
        none: '0px',
        pill: '9999px',
      },
      spacing: {
        'section': '120px',
      }
    },
  },
  plugins: [],
}
