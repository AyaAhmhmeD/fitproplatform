/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // "Obsidian & volt" brand palette — see README for usage notes.
        volt: {
          DEFAULT: "#8fef22",
          light: "#aaf94a",
          dark: "#57ab09",
        },
        ink: {
          DEFAULT: "#0a0b11", // dark-mode background
          surface: "#14161f", // dark-mode card/surface
        },
        paper: {
          DEFAULT: "#f6f7f9", // light-mode background
          surface: "#ffffff", // light-mode card/surface
        },
      },
    },
  },
  plugins: [],
};
