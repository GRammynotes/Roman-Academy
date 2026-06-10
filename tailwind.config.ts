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
          950: "#021B3A",
          900: "#0A274F",
          850: "#0e3466",
          800: "#13427f"
        },
        gold: {
          600: "#B8942A",
          500: "#C6A131",
          400: "#D4AF37",
          300: "#E2BD4D"
        },
        ivory: {
          50: "#FAF9F5",
          100: "#F8F6F0",
          200: "#EFECE0"
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
