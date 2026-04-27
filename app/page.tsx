import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Gavel, Shield, TrendingUp, Clock, ChevronRight, Star } from 'lucide-react'
import ListingCard from '@/components/ListingCard'

async function getFeaturedListings() {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: {
      category: true,
      seller: { select: { id: true, name: true, avatar: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { currentBid: 'desc' },
    take: 6,
  })
  return listings
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { listings: true } } },
  })
  return categories
}

export default async function HomePage() {
  const [listings, categories] = await Promise.all([
    getFeaturedListings(),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-amber-500/30">
              <Gavel className="h-4 w-4" />
              Live Auctions Running Now
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Bid. Win.{' '}
              <span className="text-amber-400">Own It.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Discover unique items at unbeatable prices. Sell your valuables to the highest bidder.
              Secure escrow payments protect every transaction.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/listings"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/25"
              >
                Browse Auctions
              </Link>
              <Link
                href="/listings/create"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-lg transition-colors border border-white/20"
              >
                Sell an Item
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{listings.length} Active Auctions</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span>Verified Sellers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure Escrow', desc: 'Funds held safely until delivery confirmed' },
              { icon: Clock, title: '24-hr Payment', desc: 'Winners have 24 hours to complete payment' },
              { icon: TrendingUp, title: 'Live Bidding', desc: 'Real-time auction countdown timers' },
              { icon: Star, title: 'Buyer Protection', desc: 'Full refund if item not as described' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="bg-amber-50 rounded-lg p-2 flex-shrink-0">
                  <Icon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            <Link href="/listings" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/listings?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 hover:shadow-md hover:border-amber-200 border border-gray-100 transition-all group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-amber-600 transition-colors text-center leading-tight">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat._count.listings}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Auctions</h2>
              <p className="text-gray-500 text-sm mt-1">Ending soon — place your bid now</p>
            </div>
            <Link href="/listings" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
              See all auctions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Gavel className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No active auctions yet</p>
              <p className="text-sm mt-1">Be the first to list an item!</p>
              <Link href="/listings/create" className="mt-4 inline-block bg-amber-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-600 transition-colors">
                Start Selling
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0f172a] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How BidMarket Works</h2>
            <p className="text-gray-400">Simple, secure, and transparent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'List Your Item', desc: 'Upload photos, set a minimum bid, choose auction duration', icon: '📸' },
              { step: '02', title: 'Bids Come In', desc: 'Buyers compete in real-time. Watch your price climb!', icon: '🏆' },
              { step: '03', title: 'Auction Ends', desc: 'Highest bidder wins and has 24 hours to pay via escrow', icon: '⏰' },
              { step: '04', title: 'Funds Released', desc: 'Ship item, buyer confirms receipt, you get 90% of sale price', icon: '💰' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="text-amber-400 text-sm font-bold mb-1">STEP {step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-[#1e3a5f] rounded-2xl p-6 text-center">
            <p className="text-gray-300 mb-2">Platform fee: only <span className="text-amber-400 font-bold text-xl">10%</span> on successful sales</p>
            <p className="text-gray-500 text-sm">Sellers keep 90% · No listing fees · No hidden charges</p>
          </div>
        </div>
      </section>
    </div>
  )
}
