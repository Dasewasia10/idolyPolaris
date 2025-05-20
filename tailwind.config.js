/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/index.html", "./src/**/*.{vue,js,ts,jsx,tsx,css}"],
  theme: {
    fontFamily: {
      sans: [
        "Arial",
        // Fallback fonts
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "sans-serif",
      ],
    },
    extend: {
      animation: {
        "gradient-rotate": "gradientRotate 8s linear infinite",
        "gradient-pulse": "gradientPulse 12s ease infinite",
      },
      keyframes: {
        gradientRotate: {
          "0%": { "background-position": "0% 50%" },
          "100%": { "background-position": "100% 50%" },
        },
        gradientPulse: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
    },
  },
  plugins: [],
  variants: {
    extend: {},
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
    },
  },
  plugins: [require("tailwind-scrollbar")],
};