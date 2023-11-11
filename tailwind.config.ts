import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: {
          primary: "#101114",
          secondary: "#1C2026",
          modal: "#1a1b1f",
          tertiary: "#303742",
          errorForeground: "#452A2A",
        },
        label: {
          1: "white",
          2: "#ffffff79",
          3: "#FFFFFF50",
        },
        separator: {
          0: "#ffffff13",
          1: "#FFFFFF33",
          2: "#FFFFFF20",
          primary: "#202733",
        },
        accent: {
          primary: "#67FCC3",
          foreground: "#375449",
        },
        status: {
          error: "rgb(239 68 68)",
          green: "#0B972A",
          yellow: "#D6AA0D",
        },
      },
    },
  },
  plugins: [],
}
export default config
