import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink:       "#05060a",
        panel:     "#0e1017",
        panel2:    "#131620",
        line:      "rgba(255, 255, 255, 0.05)",
        muted:     "rgba(255, 255, 255, 0.50)",
        accent:    "#7c5cff",
        accent2:   "#00d2a0",
        highlight: "#f5c542",
        purple:    "#7c5cff",
        danger:    "#ff6b6b",
        gold:      "#f5c542"
      },
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      animation: {
        "fade-in": "fadeIn .45s cubic-bezier(0.16, 1, 0.3, 1) both"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
