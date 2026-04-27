import Link from 'next/link'
import { Gavel, Facebook, Twitter, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-amber-500 rounded-lg p-1.5">
                <Gavel className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BidMarket</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4">
              The trusted online auction marketplace. Buy and sell with confidence.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-600 hover:text-gray-300 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-300 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-300 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-300 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Buy */}
          <div>
            <h3 className="text-white font-semibold mb-4">Buy</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings" className="hover:text-white transition-colors">Browse Auctions</Link></li>
              <li><Link href="/listings?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/listings?category=vehicles" className="hover:text-white transition-colors">Vehicles</Link></li>
              <li><Link href="/listings?category=furniture" className="hover:text-white transition-colors">Furniture</Link></li>
              <li><Link href="/dashboard/my-bids" className="hover:text-white transition-colors">My Bids</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="text-white font-semibold mb-4">Sell</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings/create" className="hover:text-white transition-colors">List an Item</Link></li>
              <li><Link href="/dashboard/my-listings" className="hover:text-white transition-colors">My Listings</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-white transition-colors">Orders</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Seller Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Fee Calculator</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Buyer Protection</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Escrow Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2024 BidMarket. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#1e3a5f] rounded-lg text-center text-xs text-gray-500">
          🔒 Secure Escrow Payment · 10% Platform Fee · Buyer & Seller Protection
        </div>
      </div>
    </footer>
  )
}
