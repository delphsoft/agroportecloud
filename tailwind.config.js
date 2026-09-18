/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f4f5f3",
        surface: "#ffffff",
        muted: { DEFAULT: "#eef0eb", fg: "#666662" },
        "muted-fg": "#666662",
        fg: "#1a1a18",
        border: "#e0e0da",
        primary: { DEFAULT: "#1D9E75", hover: "#0F6E56", foreground: "#fff", soft: "#e8f5ee" },
        "primary-hover": "#0F6E56",
        "primary-foreground": "#ffffff",
        "primary-soft": "#e8f5ee",
        ok: { DEFAULT: "#1D9E75", soft: "#e8f5ee" },
        "ok-soft": "#e8f5ee",
        warn: { DEFAULT: "#BA7517", soft: "#FAEEDA" },
        "warn-soft": "#FAEEDA",
        ring: "#1D9E75",
        mp: { DEFAULT: "#185FA5", hover: "#0C447C" },
        "mp-hover": "#0C447C",
      },
    },
  },
  plugins: [],
};
