import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D0D0D",
        surface: "#181818",
        surface2: "#222222",
        border: "rgba(255,255,255,0.08)",
        border2: "rgba(255,255,255,0.14)",
        accent: "#C8F135",
        "accent-dim": "rgba(200,241,53,0.1)",
        "text-primary": "#F2F0E8",
        "text-secondary": "#888070",
        "text-muted": "#4A4A44",
        success: "#4ADE80",
        danger: "#F87171",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      maxWidth: {
        app: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
