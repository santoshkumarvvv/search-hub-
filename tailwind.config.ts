import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink:       "#0f172a",
        panel:     "#ffffff",
        panel2:    "#f8fafc",
        line:      "#e2e8f0",
        muted:     "#64748b",
        accent:    "#4f46e5",
        accent2:   "#f59e0b",
        highlight: "#f59e0b",
        purple:    "#4f46e5",
        danger:    "#ef4444",
        gold:      "#f59e0b"
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        sans:    ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      animation: {
        "fade-in": "fadeIn .4s cubic-bezier(0.16, 1, 0.3, 1) both"
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
