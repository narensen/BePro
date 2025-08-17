/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern Professional Elegance Palette
        'deep-navy': '#1A2A48',
        'warm-beige': '#F5F0E6', 
        'muted-terracotta': '#D9822B',
        'cool-teal': '#2A9D8F',
        'light-gray': '#E0E0E0',
        // Variations for better design flexibility
        'navy': {
          50: '#f0f2f7',
          100: '#d4dae9',
          200: '#a9b5d3',
          300: '#7d90bc',
          400: '#526ba6',
          500: '#1A2A48', // Main deep navy
          600: '#15223c',
          700: '#101a30',
          800: '#0b1224',
          900: '#060a18'
        },
        'beige': {
          50: '#fefdfb',
          100: '#F5F0E6', // Main warm beige
          200: '#ece4d3',
          300: '#e3d7c0',
          400: '#dacbad',
          500: '#d1be9a',
          600: '#c8b187',
          700: '#bfa574',
          800: '#b69861',
          900: '#ad8c4e'
        },
        'terracotta': {
          50: '#fef7f0',
          100: '#fcefd9',
          200: '#f8deb3',
          300: '#f4ce8d',
          400: '#f0bd67',
          500: '#D9822B', // Main muted terracotta
          600: '#c7741f',
          700: '#b56613',
          800: '#a35807',
          900: '#914a00'
        },
        'teal': {
          50: '#f0fffe',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#2A9D8F', // Main cool teal
          600: '#0f766e',
          700: '#0d5d56',
          800: '#134e4a',
          900: '#042f2e'
        }
      }
    }
  }
}