/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // --- Do'kon (storefront) - iliq, "bozor" kayfiyati ---
        paper: "#FBF6EC",
        ink: "#23202B",
        "tile-blue": {
          DEFAULT: "#14607A",
          deep: "#0B3B4D",
          light: "#3D8AA6",
        },
        saffron: {
          DEFAULT: "#E2933B",
          deep: "#C97620",
          light: "#F0B876",
        },
        melon: {
          DEFAULT: "#6B8F3C",
          deep: "#516C2C",
        },
        sand: "#E4D9C3",

        // --- Admin panel - to'q, glassmorphism ---
        admin: {
          bg: "#0B1521",
          bg2: "#0F2233",
          surface: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          text: "#E8ECF1",
          muted: "#94A3B8",
        },

        // --- Klassik neon aksentlar: header, katalog menyusi, tugmalar ---
        neon: {
          green: "#00E676",
          "green-deep": "#00B85C",
          "green-light": "#8CFFC4",
          blue: "#00C2FF",
          "blue-deep": "#0090C7",
        },
      },
      fontFamily: {
        display: ["Unbounded", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "tile-pattern":
          "radial-gradient(circle at 1px 1px, rgba(20,96,122,0.14) 1px, transparent 0)",
      },
      backgroundSize: {
        tile: "22px 22px",
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(0,230,118,0.45), 0 6px 24px -4px rgba(0,230,118,0.5)",
        "neon-sm": "0 0 0 1px rgba(0,230,118,0.35), 0 2px 12px -2px rgba(0,230,118,0.4)",
        "neon-blue": "0 0 0 1px rgba(0,194,255,0.35), 0 4px 20px -2px rgba(0,194,255,0.45)",
      },
    },
  },
  plugins: [],
};
