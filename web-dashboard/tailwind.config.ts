import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0f172a", light: "#1e293b" },
        brand: { DEFAULT: "#2563eb", light: "#3b82f6" },
      },
    },
  },
  plugins: [],
};

export default config;
