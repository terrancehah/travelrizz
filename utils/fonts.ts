import { Noto_Sans_SC, Raleway, Caveat, Lato } from "next/font/google";

// Configure Noto Sans SC font
export const notoSansSC = Noto_Sans_SC({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-sc',
    display: 'swap',
});

// Configure Raleway font
export const raleway = Raleway({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-raleway',
    display: 'swap',
});

// Configure Caveat font
export const caveat = Caveat({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-caveat',
    display: 'swap',
    preload: true,
});

// Configure Lato font
export const lato = Lato({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    variable: '--font-lato',
    display: 'swap',
});
