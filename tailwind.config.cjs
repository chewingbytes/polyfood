const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "paper": "#fdfbf7",
        "ink": "#2d2d2d",
        "muted": "#e5e0d8",
        "accent": "#ff4d4d",
        "blue-pen": "#2d5da1",
      },
      fontFamily: {
        heading: ["Kalam", "cursive"],
        body: ["Patrick Hand", "cursive"],
        sans: ["Patrick Hand", "cursive", ...fontFamily.sans],
      },
      boxShadow: {
        "sketch": "4px 4px 0px 0px #2d2d2d",
        "sketch-md": "6px 6px 0px 0px #2d2d2d",
        "sketch-lg": "8px 8px 0px 0px #2d2d2d",
        "sketch-hover": "2px 2px 0px 0px #2d2d2d",
      },
      borderRadius: {
        none: "0",
        full: "9999px",
        wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
        wobblyMd: "15px 225px 15px 255px / 225px 15px 255px 15px",
        wobblyLg: "225px 15px 255px 15px / 15px 255px 15px 225px",
        wobblyPill: "50px 40px 50px 40px / 40px 50px 40px 50px",
      },
      transitionDuration: {
        100: "100ms",
        200: "200ms",
      },
    },
  },
  plugins: [],
};