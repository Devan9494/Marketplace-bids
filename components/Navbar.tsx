'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Search, Gavel, User, Menu, X, ChevronDown, Bell, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-amber-500 rounded-lg p-1.5">
              <Gavel className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BidMarket</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="w-full bg-[#1e3a5f] text-white placeholder-gray-400 rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 border border-[#2d5a8c]"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400 hover:text-amber-400 transition-colors" />
              </button>
            </div>
          </form>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/listings"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Browse
            </Link>

            {session ? (
              <>
                <Link
                  href="/listings/create"
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Sell Item
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1e3a5f] border border-[#2d5a8c] flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{session.user.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/my-listings"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Listings
                      </Link>
                      <Link
                        href="/dashboard/my-bids"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Bids
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Orders
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="w-full bg-[#1e3a5f] text-white placeholder-gray-400 rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </form>
            <Link href="/listings" className="block py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Browse Auctions</Link>
            {session ? (
              <>
                <Link href="/listings/create" className="block py-2 text-amber-400 hover:text-amber-300 text-sm font-semibold" onClick={() => setMobileOpen(false)}>+ Sell Item</Link>
                <Link href="/dashboard" className="block py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/dashboard/my-listings" className="block py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>My Listings</Link>
                <Link href="/dashboard/my-bids" className="block py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>My Bids</Link>
                <Link href="/dashboard/orders" className="block py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Orders</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="block py-2 text-red-400 hover:text-red-300 text-sm w-full text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/auth/register" className="block py-2 text-amber-400 hover:text-amber-300 text-sm font-semibold" onClick={() => setMobileOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
