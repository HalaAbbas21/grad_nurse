/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          soft: "var(--primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          soft: "var(--secondary-soft)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          soft: "var(--accent-soft)",
        },
        highlight: {
          DEFAULT: "var(--highlight)",
          foreground: "var(--highlight-foreground)",
          soft: "var(--highlight-soft)",
        },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        success: { DEFAULT: "var(--success)", foreground: "var(--success-foreground)" },
        warning: { DEFAULT: "var(--warning)", foreground: "var(--warning-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 0.25rem)",
        md: "calc(var(--radius) - 0.125rem)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 0.25rem)",
        "2xl": "calc(var(--radius) + 0.5rem)",
        "3xl": "calc(var(--radius) + 0.75rem)",
        "4xl": "calc(var(--radius) + 1rem)",
      },
      fontFamily: {
        body: ["Tajawal", "Nunito", "system-ui", "sans-serif"],
        display: ["Quicksand", "Tajawal", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(17 36 56 / 0.06), 0 1px 2px -1px rgb(17 36 56 / 0.05)",
        soft: "0 4px 16px -4px rgb(17 36 56 / 0.10)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #008FD2, #B25EC5, #51C672)",
        "sun-gradient": "linear-gradient(135deg, #FACB39, #F5C06A)",
        "hope-gradient": "linear-gradient(135deg, #51C672, #008FD2)",
        "care-gradient": "linear-gradient(135deg, #B25EC5, #008FD2)",
      },
    },
  },
  plugins: [],
};
