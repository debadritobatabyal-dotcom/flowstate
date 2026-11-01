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
        surface: "var(--color-surface)",
        paper: "var(--color-paper)",
        neutral: "var(--color-neutral)",
        ink: {
          DEFAULT: "var(--color-primary)",
          secondary: "var(--color-secondary)",
        },
        navy: {
          DEFAULT: "var(--color-navy)",
          light: "var(--color-navy-light)",
          deep: "var(--color-navy-deep)",
        },
        flow: {
          DEFAULT: "var(--color-flow-core)",
          core: "var(--color-flow-core)",
          rim: "var(--color-flow-rim)",
        },
        shallow: {
          DEFAULT: "var(--color-shallow-core)",
          core: "var(--color-shallow-core)",
          rim: "var(--color-shallow-rim)",
        },
        deep: {
          DEFAULT: "var(--color-deep-core)",
          core: "var(--color-deep-core)",
          rim: "var(--color-deep-rim)",
        },
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
        heading: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-geist)", "Geist", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "0.6rem",
        md: "1rem",
        full: "999px",
      },
      boxShadow: {
        "ring-idle": "var(--shadow-ring-idle)",
        "ring-hover": "var(--shadow-ring-hover)",
        "ring-orange": "var(--shadow-ring-orange)",
        "sheet": "var(--shadow-sheet)",
        "inset-ring": "var(--shadow-inset-ring)",
      },
    },
  },
  plugins: [],
};
export default config;
