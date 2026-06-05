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

        success: "#16a34a",
        danger: "#ef4444",
        warning: "#f59e0b",

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
        xl: "14px",
        "2xl": "18px",
      },

      boxShadow: {
        sm: "0 1px 2px rgba(2,6,23,0.04)",
        md: "0 6px 18px rgba(2,6,23,0.08)",
        lg: "0 20px 40px rgba(2,6,23,0.12)",
      },
    },
  },

  plugins: [forms, typography],
};