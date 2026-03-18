import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "var(--navy)",
        "navy-deep": "var(--navy-deep)",
        caramel: "var(--caramel)",
        "caramel-light": "var(--caramel-light)",
        "caramel-pale": "var(--caramel-pale)",
        "caramel-muted": "var(--caramel-muted)",
        offwhite: "var(--offwhite)",
        "offwhite-2": "var(--offwhite-2)",
        brown: "var(--brown)",
        "text-dark": "var(--text-dark)",
        "text-mid": "var(--text-mid)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      borderWidth: {
        "0.5": "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
