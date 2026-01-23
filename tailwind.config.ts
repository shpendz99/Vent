import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          primary: "var(--background-primary)",
          secondary: "var(--background-secondary)",
          tertiary: "var(--background-tertiary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        borderc: {
          default: "var(--border-default)",
          muted: "var(--border-muted)",
          accent: "var(--border-accent)",
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          gratitude: "var(--accent-gratitude)",
          anxiety: "var(--accent-anxiety)",
          overthinking: "var(--accent-overthinking)",
          venting: "var(--accent-venting)",
          relationship: "var(--accent-relationship)",
        },
      },
      animation: {
        verticalMarquee: "verticalMarquee 20s linear infinite",
        verticalMarqueeDown: "verticalMarqueeDown 20s linear infinite",
      },
      keyframes: {
        verticalMarquee: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        verticalMarqueeDown: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
