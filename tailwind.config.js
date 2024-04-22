/*eslint-env node*/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./index.html",
  ],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dracula"],
  },
}
