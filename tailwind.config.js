/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./app/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Palette principale SparkFit
        primary: {
          50: '#f3f4f6',   // Gris très clair
          100: '#f9fafb',  // Gris très clair variation
          200: '#e5e7eb',  // Gris clair
          300: '#d1d5db',  // Gris clair moyen
          400: '#9ca3af',  // Gris moyen
          500: '#6b7280',  // Gris moyen foncé
          600: '#4b5563',  // Gris foncé
          700: '#374151',  // Gris très foncé
          800: '#1f2937',  // Gris ultra foncé
          900: '#111827',  // Noir grisâtre
        },
        // Couleurs d'accent par section
        activity: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        nutrition: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        statistics: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        profile: {
          light: '#e9d5ff',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
        // États et feedback
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
      fontFamily: {
        'sans': ['System'],
        'mono': ['Courier New', 'monospace'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        '5xl': '36px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },
      spacing: {
        '18': '72px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'header': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
        'ultra': '0.5px',
      },
    },
  },
  plugins: [],
}