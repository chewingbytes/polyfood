const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "neo-bg": "#FFFDF5", // Cream/Off-White
        "neo-ink": "#000000", // Pure Black
        "neo-accent": "#FF6B6B", // Hot Red
        "neo-secondary": "#FFD93D", // Vivid Yellow
        "neo-muted": "#C4B5FD", // Soft Violet
        "neo-white": "#FFFFFF", // White
      },
      fontFamily: {
        sans: ["Space Grotesk", ...fontFamily.sans],
      },
      fontWeight: {
        bold: "700",
        black: "900",
      },
      boxShadow: {
        "neo-sm": "4px 4px 0px 0px #000",
        "neo-md": "8px 8px 0px 0px #000",
        "neo-lg": "12px 12px 0px 0px #000",
        "neo-xl": "16px 16px 0px 0px #000",
      },
      borderWidth: {
        4: "4px",
        8: "8px",
      },
      borderRadius: {
        none: "0",
        full: "9999px",
      },
      transitionDuration: {
        100: "100ms",
        200: "200ms",
      },
    },
  },
  plugins: [],
};