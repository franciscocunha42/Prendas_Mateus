import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta pastel suave e neutra
        cream: "#FBF7F0",
        sky: "#CFE6F0",
        skydark: "#9DC9DD",
        mint: "#D6EBDD",
        mintdark: "#A9D4B8",
        peach: "#F8DCD0",
        peachdark: "#EFBDAB",
        blush: "#F4DDE6",
        sand: "#EFE6D6",
        ink: "#5B5550",
        inksoft: "#8A827B",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -12px rgba(91, 85, 80, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
