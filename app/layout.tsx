import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ArchiHub — Premium Architecture Marketplace',
    template: '%s | ArchiHub',
  },
  description: "Buy and sell premium house plans, hire certified engineers for site supervision. Africa's leading architecture marketplace.",
  keywords: ['house plans', 'architecture', 'engineers', 'construction', 'blueprints'],
  openGraph: {
    type: 'website',
    title: 'ArchiHub — Premium Architecture Marketplace',
    description: 'Buy and sell premium house plans, hire certified engineers.',
    siteName: 'ArchiHub',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
