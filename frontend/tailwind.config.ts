import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#12101F",
          900: "#181530",
          800: "#211D3F",
          700: "#2C2650",
        },
        accent: {
          DEFAULT: "#6C5CE7",
          light: "#8B7FFF",
          dark: "#4E3FC7",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter",
          "system-ui", "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
