import type { Metadata } from 'next'
import {
    Inter,
    Outfit,
    Playfair_Display,
    Montserrat,
    Roboto,
    Poppins,
    Lora,
    Raleway,
    Bebas_Neue,
    Dancing_Script,
    // NEW FONTS FOR POSTER MAKING
    Oswald,
    Anton,
    Righteous,
    Archivo_Black,
    Permanent_Marker,
    Pacifico,
    Lobster,
    Bangers,
    Russo_One,
    Barlow_Condensed,
    Fjalla_One,
    Merriweather,
    Open_Sans,
    Source_Sans_3,
    Ubuntu,
} from 'next/font/google'
import '../styles/globals.css'
import ConvexClientProvider from './ConvexClientProvider'
import { CSPostHogProvider } from './providers'

// Sans-serif fonts
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
})

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
})

const roboto = Roboto({
    weight: ['300', '400', '500', '700', '900'],
    subsets: ['latin'],
    variable: '--font-roboto',
    display: 'swap',
})

const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
    variable: '--font-poppins',
    display: 'swap',
})

const raleway = Raleway({
    subsets: ['latin'],
    variable: '--font-raleway',
    display: 'swap',
})

const openSans = Open_Sans({
    subsets: ['latin'],
    variable: '--font-opensans',
    display: 'swap',
})

const sourceSans = Source_Sans_3({
    subsets: ['latin'],
    variable: '--font-sourcesans',
    display: 'swap',
})

const ubuntu = Ubuntu({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    variable: '--font-ubuntu',
    display: 'swap',
})

// Serif fonts
const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
})

const lora = Lora({
    subsets: ['latin'],
    variable: '--font-lora',
    display: 'swap',
})

const merriweather = Merriweather({
    weight: ['300', '400', '700', '900'],
    subsets: ['latin'],
    variable: '--font-merriweather',
    display: 'swap',
})

// Display fonts (BEST FOR POSTERS!)
const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bebas',
    display: 'swap',
})

const oswald = Oswald({
    subsets: ['latin'],
    variable: '--font-oswald',
    display: 'swap',
})

const anton = Anton({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-anton',
    display: 'swap',
})

const righteous = Righteous({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-righteous',
    display: 'swap',
})

const archivoBlack = Archivo_Black({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-archivoblack',
    display: 'swap',
})

const russoOne = Russo_One({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-russoone',
    display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
    weight: ['300', '400', '600', '700', '800'],
    subsets: ['latin'],
    variable: '--font-barlowcondensed',
    display: 'swap',
})

const fjallaOne = Fjalla_One({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-fjallaone',
    display: 'swap',
})

const bangers = Bangers({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bangers',
    display: 'swap',
})

// Script/Handwriting
const dancingScript = Dancing_Script({
    subsets: ['latin'],
    variable: '--font-dancing',
    display: 'swap',
})

const pacifico = Pacifico({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-pacifico',
    display: 'swap',
})

const lobster = Lobster({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-lobster',
    display: 'swap',
})

const permanentMarker = Permanent_Marker({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-permanentmarker',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'RetailGen AI - AI-Powered Creative Campaign Generator',
    description: 'Democratizing retail media creative production with AI-powered compliance validation and multi-format export',
    keywords: ['retail media', 'AI', 'creative automation', 'compliance', 'advertising'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`
            ${inter.variable} 
            ${outfit.variable} 
            ${montserrat.variable} 
            ${roboto.variable} 
            ${poppins.variable} 
            ${raleway.variable} 
            ${openSans.variable}
            ${sourceSans.variable}
            ${ubuntu.variable}
            ${playfair.variable} 
            ${lora.variable} 
            ${merriweather.variable}
            ${bebasNeue.variable} 
            ${oswald.variable}
            ${anton.variable}
            ${righteous.variable}
            ${archivoBlack.variable}
            ${russoOne.variable}
            ${barlowCondensed.variable}
            ${fjallaOne.variable}
            ${bangers.variable}
            ${dancingScript.variable}
            ${pacifico.variable}
            ${lobster.variable}
            ${permanentMarker.variable}
        `}>
            <body className="font-sans antialiased">
                <CSPostHogProvider>
                    <ConvexClientProvider>
                        {children}
                    </ConvexClientProvider>
                </CSPostHogProvider>
            </body>
        </html>
    )
}