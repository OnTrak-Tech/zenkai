/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline": "#5a5068",
        "on-tertiary-fixed": "#1a1000",
        "secondary-fixed-dim": "#00e6b8",
        "secondary-fixed": "#c0fff4",
        "primary-fixed-dim": "#ff80aa",
        "inverse-surface": "#e8e0f0",
        "surface-container-highest": "#28283e",
        "tertiary-fixed-dim": "#ffe04a",
        "surface-bright": "#1a1a2e",
        "on-tertiary-fixed-variant": "#665200",
        "on-primary": "#1a0010",
        "surface-container-low": "#111118",
        "tertiary-fixed": "#fff0c0",
        "primary-container": "#b3004e",
        "error": "#ff4444",
        "surface-container": "#141422",
        "on-surface": "#e8e0f0",
        "on-primary-fixed": "#3d0020",
        "surface": "#0f0f1a",
        "on-background": "#e8e0f0",
        "on-primary-fixed-variant": "#8c0038",
        "primary": "#ff2d78",
        "error-container": "#3d0f0f",
        "on-secondary-fixed-variant": "#004d4d",
        "on-error": "#1a0000",
        "secondary-container": "#004d3d",
        "surface-tint": "#ff2d78",
        "on-tertiary": "#1a1000",
        "on-primary-container": "#ffe0ec",
        "on-error-container": "#ffa0a0",
        "primary-fixed": "#ffe0ec",
        "on-secondary": "#001a1a",
        "on-surface-variant": "#a098b0",
        "on-secondary-fixed": "#001a1a",
        "secondary": "#00ffcc",
        "inverse-on-surface": "#0a0a12",
        "surface-dim": "#0f0f1a",
        "surface-variant": "#1e1e30",
        "surface-container-lowest": "#0a0a12",
        "inverse-primary": "#8c0038",
        "on-secondary-container": "#c0fff4",
        "surface-container-high": "#1e1e30",
        "on-tertiary-container": "#fff0c0",
        "tertiary": "#ffe04a",
        "outline-variant": "#302840",
        "background": "#0a0a12",
        "tertiary-container": "#665200"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Sora", "sans-serif"],
        "display": ["Sora", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Space Grotesk", "monospace"]
      },
      animation: {
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
