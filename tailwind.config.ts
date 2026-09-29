import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0C0C0B",
        surface: "#141413",
        "surface-hover": "#1B1B19",
        border: "#262624",
        "border-light": "#333330",
        accent: "#FF5B1F",
        "accent-dim": "#FF5B1F20",
        green: "#7BC47F",
        amber: "#E8B04B",
        text: "#EDEBE6",
        muted: "#8A8883",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        micro: "0.08em",
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "6px",
      },
      backgroundImage: {
        "dotted-grid": "radial-gradient(#262624 1px, transparent 1px)",
      },
      backgroundSize: {
        "dotted-grid": "16px 16px",
      },
    },
  },
  plugins: [],
};
export default config;
