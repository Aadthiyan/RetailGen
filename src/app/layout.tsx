import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '../styles/globals.css'
import ConvexClientProvider from './ConvexClientProvider'
import { CSPostHogProvider } from './providers'

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
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
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