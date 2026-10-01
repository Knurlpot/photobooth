import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FCEFCB",
        cream2: "#F7E6B8",
        red: "#E5342A",
        redDeep: "#C9281F",
        frame: "#211C22",
        frame2: "#2C2630",
        ink: "#2A2117",
        muted: "#8A7F66",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
