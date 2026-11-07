import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink:       "#0a0a0a",
        panel:     "#ffffff",
        panel2:    "#f8f8f8",
        line:      "#e5e5e5",
        muted:     "#525252",
        accent:    "#7c5cff",
        accent2:   "#00d2a0",
        highlight: "#f5c542",
        purple:    "#7c5cff",
        danger:    "#ef4444",
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
