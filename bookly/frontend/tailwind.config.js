/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        'primary-light': '#8B7FF5',
        'secondary-light': '#FF9B9B',
        'accent-light': '#FFE45E',
        'bg-light': '#F8F9FE',
        'text-primary-light': '#1A1A2E',
        'text-secondary-light': '#6B7280',
        
        // Dark theme colors
        'primary-dark': '#9B8AFF',
        'secondary-dark': '#FF6B9D',
        'accent-dark': '#FFD93D',
        'bg-dark': '#0F0F1E',
        'text-primary-dark': '#FFFFFF',
        'text-secondary-dark': '#9CA3AF',
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
        'element': '12px',
      }
    },
  },
  plugins: [],
}