/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1B2A56",
        "navy-dark": "#121D3F",
        cred: "#EE243A",
      },
    },
  },
  plugins: [],
};
