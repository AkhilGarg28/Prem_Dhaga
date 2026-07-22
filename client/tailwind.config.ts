import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "var(--ivory)",
        cream: "var(--cream)",
        "warm-beige": "var(--warm-beige)",
        "royal-gold": "var(--royal-gold)",
        "temple-bronze": "var(--temple-bronze)",
        brass: "var(--brass)",
        "peacock-blue": "var(--peacock-blue)",
        "vrindavan-green": "var(--vrindavan-green)",
        "lotus-pink": "var(--lotus-pink)",
        "deep-charcoal": "var(--deep-charcoal)",
        "temple-black": "var(--temple-black)",
        "off-white": "var(--off-white)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        "serif-head": ["var(--font-playfair)", "serif"],
        body: ["var(--font-dmsans)", "sans-serif"],
        utility: ["var(--font-jost)", "sans-serif"],
        hindi: ["var(--font-devanagari)", "serif"],
      },
      // ─── Animation Keyframes ───────────────────────────────────────────────
      // All animations are disabled when prefers-reduced-motion: reduce is set
      // (handled in globals.css with animation-duration: 0.01ms override).
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gold-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(196,161,90,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(196,161,90,0.18)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "drawer-out": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-slow": "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.45s ease both",
        "fade-down": "fade-down 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-right": "slide-right 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "shimmer": "shimmer 2.2s linear infinite",
        "gold-pulse": "gold-pulse 2.4s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "drawer-in": "drawer-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "drawer-out": "drawer-out 0.35s cubic-bezier(0.4,0,1,1) both",
      },
      // ─── Transition Timing ─────────────────────────────────────────────────
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
        "luxury": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      // ─── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;

