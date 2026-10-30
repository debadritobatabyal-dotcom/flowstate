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
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        aicte: {
          50: "#f0f4f9",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
        },
        provenance: {
          rule: {
            bg: "#eff6ff",
            text: "#1e40af",
            border: "#bfdbfe",
          },
          verified: {
            bg: "#f0fdf4",
            text: "#166534",
            border: "#bbf7d0",
          },
          suggested: {
            bg: "#faf5ff",
            text: "#6b21a8",
            border: "#e9d5ff",
          },
          simulated: {
            bg: "#fffbeb",
            text: "#92400e",
            border: "#fde68a",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
