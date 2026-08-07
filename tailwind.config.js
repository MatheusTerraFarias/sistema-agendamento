/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#09124f",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#0d1868",
          700: "#08103f",
          800: "#060b2d",
          900: "#04071f",
        },

        success: { DEFAULT: "#10b981", 50: "#ecfdf5", 100: "#d1fae5", 500: "#10b981", 600: "#059669", 700: "#047857" },
        danger: { DEFAULT: "#ef4444", 50: "#fef2f2", 100: "#fee2e2", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c" },
        warning: { DEFAULT: "#f59e0b", 50: "#fffbeb", 100: "#fef3c7", 500: "#f59e0b", 600: "#d97706", 700: "#b45309" },

        muted: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
        },
      },

      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
        ],
      },

      borderRadius: {
        none: "0",
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
        full: "9999px",
      },

      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.04)",
        sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
        xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
        "2xl": "0 25px 50px -12px rgba(0,0,0,0.15)",
        inner: "inset 0 2px 4px 0 rgba(0,0,0,0.04)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      },

      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.35s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },

  plugins: [forms, typography],
};
