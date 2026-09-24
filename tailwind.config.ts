import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          navy: {
            50: "#f0f5fa",
            100: "#e0ebf5",
            200: "#c2d7eb",
            300: "#94bde0",
            400: "#609dd1",
            500: "#3b80bf",
            600: "#2a65a3",
            700: "#225184",
            800: "#1e446d",
            900: "#18385a",
            950: "#0c1e34",
          },
          gold: {
            DEFAULT: "#c59b27",
            light: "#dfb845",
            dark: "#997316",
          },
          target: {
            green: "#16a34a",
            amber: "#d97706",
            red: "#dc2626",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
