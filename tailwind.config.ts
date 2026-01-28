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
        background: {
          DEFAULT: '#0f0818',
          light: '#1a1025',
          lighter: '#251832',
        },
        primary: {
          DEFAULT: '#c084fc',
          light: '#d8b4fe',
          dark: '#a855f7',
        },
        accent: {
          DEFAULT: '#fb7185',
          light: '#fda4af',
          dark: '#f43f5e',
        },
        text: {
          DEFAULT: '#f3e8ff',
          muted: '#c4b5fd',
          dimmed: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
};

export default config;
