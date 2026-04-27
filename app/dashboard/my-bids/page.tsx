'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Clock, Gavel, Trophy, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Bid {
  id: string
  amount: number
  createdAt: string
  listing: {
    id: string
    title: string
    images: string
    status: string
    endsAt: string
    currentBid: number
    minBid: number
    seller: { id: string; name: string }
  }
}

export default function MyBidsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch('/api/bids')
      .then((r) => r.json())
      .then((data) => setBids(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  // Group bids by listing - show only the latest bid per listing
  const bidsByListing = bids.reduce<Record<string, Bid>>((acc, bid) => {
    if (!acc[bid.listing.id] || bid.amount > acc[bid.listing.id].amount) {
      acc[bid.listing.id] = bid
    }
    return acc
  }, {})

  const uniqueBids = Object.values(bidsByListing)

  const isWinning = (bid: Bid) => bid.amount >= bid.listing.currentBid && bid.listing.status === 'ACTIVE'
  const hasWon = (bid: Bid) =>
    bid.amount >= bid.listing.currentBid &&
    (bid.listing.status === 'ENDED' || bid.listing.status === 'SOLD')
  const isOutbid = (bid: Bid) => bid.amount < bid.listing.currentBid

  const filtered =
    filter === 'ALL'
      ? uniqueBids
      : filter === 'WINNING'
      ? uniqueBids.filter(isWinning)
      : filter === 'OUTBID'
      ? uniqueBids.filter(isOutbid)
      : filter === 'WON'
      ? uniqueBids.filter(hasWon)
      : uniqueBids

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-500 text-sm mt-1">{uniqueBids.length} item{uniqueBids.length !== 1 ? 's' : ''} bid on</p>
        </div>
        <Link href="/listings" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          Browse more auctions →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bids', value: bids.length, color: 'text-gray-900' },
          { label: 'Winning', value: uniqueBids.filter(isWinning).length, color: 'text-green-600' },
          { label: 'Outbid', value: uniqueBids.filter(isOutbid).length, color: 'text-red-600' },
          { label: 'Won', value: uniqueBids.filter(hasWon).length, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['ALL', 'WINNING', 'OUTBID', 'WON'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              filter === f
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No bids yet</h3>
          <p className="text-gray-400 text-sm mb-4">
            {filter === 'ALL' ? "You haven't placed any bids yet." : `No ${filter.toLowerCase()} bids found.`}
          </p>
          <Link href="/listings" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
            Browse auctions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((bid) => {
            const images = JSON.parse(bid.listing.images || '[]') as string[]
            const isActive = bid.listing.status === 'ACTIVE' && new Date(bid.listing.endsAt) > new Date()
            const winning = isWinning(bid)
            const outbid = isOutbid(bid)
            const won = hasWon(bid)

            return (
              <div
                key={bid.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                  won ? 'border-amber-200' : winning ? 'border-green-200' : outbid ? 'border-red-100' : 'border-gray-100'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Gavel className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        href={`/listings/${bid.listing.id}`}
                        className="font-semibold text-gray-900 hover:text-amber-600 text-sm line-clamp-1 transition-colors"
                      >
                        {bid.listing.title}
                      </Link>
                      {won && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          <Trophy className="h-3 w-3" /> Won
                        </span>
                      )}
                      {winning && isActive && (
                        <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ Winning
                        </span>
                      )}
                      {outbid && isActive && (
                        <span className="flex-shrink-0 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          Outbid
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>
                        Your bid: <strong className="text-gray-900">${bid.amount.toLocaleString()}</strong>
                      </span>
                      <span>
                        Current: <strong className={outbid ? 'text-red-600' : 'text-gray-900'}>${bid.listing.currentBid.toLocaleString()}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isActive
                          ? `Ends ${formatDistanceToNow(new Date(bid.listing.endsAt), { addSuffix: true })}`
                          : `Ended ${formatDistanceToNow(new Date(bid.listing.endsAt), { addSuffix: true })}`}
                      </span>
                    </div>

                    {outbid && isActive && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        You&apos;ve been outbid!{' '}
                        <Link href={`/listings/${bid.listing.id}`} className="underline hover:no-underline font-medium">
                          Bid again →
                        </Link>
                      </div>
                    )}

                    {won && (
                      <div className="mt-2 text-xs text-amber-700 font-medium">
                        🎉 Congratulations! You won this auction.{' '}
                        <Link href="/dashboard/orders" className="underline hover:no-underline">
                          View order →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
