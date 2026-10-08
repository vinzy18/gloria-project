import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d4ed8",
          700: "#1e3a8a",
          800: "#1e3270",
          900: "#172554",
          950: "#0f172a",
        },
        gold: {
          100: "#fef9e7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [typography],
};
