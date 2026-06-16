import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
        orbitron: ["Orbitron", "sans-serif"]
      },
      colors: {
        navy: {
          950: "#050B1A",
          900: "#0A2342",
          850: "#08203f",
          800: "#0d2a50"
        },
        gold: {
          600: "#a96d17",
          500: "#ca911f",
          400: "#D4AF37",
          300: "#F7E7A1"
        },
        ivory: {
          50: "#fbf7ee",
          100: "#f4efe5",
          200: "#e8dcc9"
        },
        accent: {
          glow: "#FFE082"
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
