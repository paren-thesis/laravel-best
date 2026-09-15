/** @type {import('tailwindcss').Config} */

// Every colour is a raw "R G B" triplet in a CSS variable, so Tailwind's
// opacity modifiers still work: bg-panel/60, border-line/40, and so on.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Surfaces, from furthest back to nearest front. */
        canvas: token('--canvas'),
        panel: token('--panel'),
        sunken: token('--sunken'),
        raised: token('--raised'),
        'raised-hover': token('--raised-hover'),

        /* Lines and separators. */
        line: token('--line'),
        'line-strong': token('--line-strong'),

        /* Text, from strongest to faintest. */
        ink: token('--ink'),
        'ink-body': token('--ink-body'),
        'ink-muted': token('--ink-muted'),
        'ink-subtle': token('--ink-subtle'),

        /* Brand and status. Each needs a different shade per theme: a tint
           that reads on a dark ground is usually too pale on a white one. */
        accent: token('--accent'),
        'accent-strong': token('--accent-strong'),
        ok: token('--ok'),
        warn: token('--warn'),
        danger: token('--danger'),
      },
    },
  },
  plugins: [],
}
