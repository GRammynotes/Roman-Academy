import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"]
      },
      colors: {
        navy: {
          950: "#020b18",
          900: "#06152b",
          850: "#08203f",
          800: "#0d2a50"
        },
        gold: {
          600: "#a96d17",
          500: "#ca911f",
          400: "#d6a22c",
          300: "#f2d36c"
        },
        ivory: {
          50: "#fbf7ee",
          100: "#f4efe5",
          200: "#e8dcc9"
        }
      },
      boxShadow: {
        elite: "0 18px 60px rgba(2, 8, 23, 0.16)"
      },
      borderRadius: {
        academy: "1rem"
      }
    }
  },
  plugins: [animate]
};

export default config;
