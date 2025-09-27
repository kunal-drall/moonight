import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        zk: {
          purple: '#8b5cf6',
          'purple-dark': '#7c3aed',
        },
        trust: {
          green: '#10b981',
          'green-dark': '#059669',
        },
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'privacy-gradient': 'linear-gradient(135deg, var(--zk-purple), var(--midnight-800))',
        'trust-gradient': 'linear-gradient(135deg, var(--trust-green), var(--midnight-700))',
        'midnight-gradient': 'linear-gradient(180deg, var(--midnight-950), var(--midnight-900))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in-privacy': 'fadeInPrivacy 0.4s ease-out',
        'zk-processing': 'zkProofGeneration 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'privacy': '0 8px 32px -8px rgba(139, 92, 246, 0.2)',
        'trust': '0 8px 32px -8px rgba(16, 185, 129, 0.2)',
        'midnight': '0 8px 32px -8px rgba(15, 23, 42, 0.8)',
      },
    },
  },
  plugins: [],
} satisfies Config;