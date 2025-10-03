/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // enable class-based dark mode
    content: [
        './index.html',             // include your main HTML
        './src/**/*.{js,ts,jsx,tsx}', // include all source files
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {}, // add custom colors, fonts, spacing here if needed
    },
    plugins: [], // add Tailwind plugins like forms, typography if needed
};
