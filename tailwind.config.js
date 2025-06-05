/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './*.{html,js,jsx,ts,tsx}',
        "./styles/**/*.css"
    ],
    theme: {
        extend: {
            fontFamily: {
                'zcool-kuaile': ['var(--font-zcool-kuai-le)', 'ZCOOL KuaiLe', 'cursive'],
                raleway: ['var(--font-raleway)', 'Raleway', 'sans-serif'],
                lato: ['var(--font-lato)', 'Lato', 'sans-serif'],
                caveat: ['var(--font-caveat)', 'Caveat', 'cursive'],
                'noto-sc': ['var(--font-noto-sans-sc)', 'Noto Sans SC', 'system-ui', 'sans-serif'],
            },
            colors: {
                'primary': '#123456',
                'secondary': '#456789',
                'sky-blue': '#4a88c6',
                'light-blue': '#e8f4ff',
                
            },
            boxShadow: {
                'all': '0px 0px 5px 0px rgba(0, 0, 0, 0.1), 0px 0px 1px 0px rgba(0, 0, 0, 0.1)',
            },
            animation: {
                'bounce': 'bounce 2s infinite',
                'gradient-x': 'gradient-x 2s ease-in-out infinite',
                'modal-appear': 'modal-appear 0.3s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'breathing-halo-500': 'breathingHalo500 2s ease-in-out infinite',
                'breathing-halo-700': 'breathingHalo700 2s ease-in-out infinite'
            },
            keyframes: {
                bounce: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'gradient-x': {
                    '0%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                    '100%': { 'background-position': '0% 50%' }
                },
                'modal-appear': {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' }
                },
                breathingHalo500: {
                    '0%, 100%': { boxShadow: '0 0 12px 2px theme(colors.purple.500/25)' },
                    '50%': { boxShadow: '0 0 18px 4px theme(colors.purple.500/35)' },
                },
                breathingHalo700: {
                    '0%, 100%': { boxShadow: '0 0 12px 2px theme(colors.purple.700/25)' },
                    '50%': { boxShadow: '0 0 18px 4px theme(colors.purple.700/35)' },
                }
            }
        }
    },
    // safelist: [
    //     { pattern: /^pac-/ }, // Keep all Google Places classes
    //     { pattern: /^gm-/ } // Keep Google Maps classes if needed
    // ],  
    // purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    plugins: [],
}