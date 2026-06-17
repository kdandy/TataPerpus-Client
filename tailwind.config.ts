import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        infobase: {
          black: "#000000",
          dark: "#00765a",
          primary: "#048c6b",
          accent: "#07b98e",
          white: "#ffffff",
          forest: "#00765a",
          leaf: "#048c6b",
          mint: "#07b98e",
          pale: "#eefaf5",
          ink: "#000000"
        },
        surface: {
          DEFAULT: "#00765a",
          50: "#006b52",
          100: "#005e48",
          200: "#004d3b",
          300: "#003d2f"
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.08)",
          light: "rgba(255,255,255,0.12)",
          medium: "rgba(255,255,255,0.16)",
          strong: "rgba(255,255,255,0.22)"
        },
        border: {
          subtle: "rgba(255,255,255,0.12)",
          medium: "rgba(255,255,255,0.18)",
          accent: "rgba(7,185,142,0.4)"
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0, 60, 45, 0.2)",
        glass: "0 8px 32px rgba(0, 50, 38, 0.3)",
        "glass-lg": "0 16px 48px rgba(0, 50, 38, 0.35)",
        glow: "0 0 20px rgba(7,185,142,0.2)",
        "glow-lg": "0 0 40px rgba(7,185,142,0.25)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(7,185,142,0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(7,185,142,0.4)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" }
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(10px, -15px) scale(1.05)" },
          "50%": { transform: "translate(-5px, 10px) scale(0.95)" },
          "75%": { transform: "translate(-15px, -5px) scale(1.02)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out both",
        "fadeIn-d1": "fadeIn 0.4s ease-out 0.05s both",
        "fadeIn-d2": "fadeIn 0.4s ease-out 0.1s both",
        "fadeIn-d3": "fadeIn 0.4s ease-out 0.15s both",
        slideUp: "slideUp 0.5s ease-out both",
        slideDown: "slideDown 0.3s ease-out both",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        spin: "spin 1s linear infinite",
        drift: "drift 20s ease-in-out infinite"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
