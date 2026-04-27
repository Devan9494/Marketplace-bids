import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'BidMarket - Online Auction Marketplace',
  description: 'Buy and sell through live auctions. Find great deals on electronics, vehicles, furniture, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
