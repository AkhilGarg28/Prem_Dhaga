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
    },
  },
  plugins: [],
};
export default config;
