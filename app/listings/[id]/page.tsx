'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock, MapPin, Gavel, TrendingUp, Shield, User, Tag,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Star, Package
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Bid {
  id: string
  amount: number
  createdAt: string
  bidder: { id: string; name: string }
}

interface Listing {
  id: string
  title: string
  description: string
  images: string
  condition: string
  minBid: number
  currentBid: number
  status: string
  endsAt: string
  location: string
  createdAt: string
  category: { name: string; icon: string; slug: string }
  seller: { id: string; name: string; avatar: string | null; createdAt: string }
  bids: Bid[]
  _count: { bids: number }
}

function getTimeLeft(endsAt: string) {
  const end = new Date(endsAt)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return { text: 'Auction Ended', isUrgent: false, isEnded: true, parts: null }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const totalHours = Math.floor(diff / (1000 * 60 * 60))

  return {
    text: days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`,
    isUrgent: totalHours < 1,
    isEnded: false,
    parts: { days, hours, minutes, seconds },
  }
}

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

const conditionColors: Record<string, string> = {
  NEW: 'bg-green-100 text-green-700 border-green-200',
  LIKE_NEW: 'bg-blue-100 text-blue-700 border-blue-200',
  GOOD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  FAIR: 'bg-orange-100 text-orange-700 border-orange-200',
  POOR: 'bg-red-100 text-red-700 border-red-200',
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [bidAmount, setBidAmount] = useState('')
  const [bidLoading, setBidLoading] = useState(false)
  const [bidError, setBidError] = useState('')
  const [bidSuccess, setBidSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(''))

  const fetchListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${params.id}`)
      if (!res.ok) {
        setError('Listing not found')
        return
      }
      const data = await res.json()
      setListing(data)
      setTimeLeft(getTimeLeft(data.endsAt))
    } catch {
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  useEffect(() => {
    if (!listing) return
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(listing.endsAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [listing])

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/auth/login')
      return
    }
    setBidError('')
    setBidSuccess('')
    setBidLoading(true)

    try {
      const res = await fetch(`/api/listings/${params.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(bidAmount) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBidError(data.error || 'Failed to place bid')
      } else {
        setBidSuccess(`Bid of $${parseFloat(bidAmount).toLocaleString()} placed successfully!`)
        setBidAmount('')
        fetchListing()
      }
    } catch {
      setBidError('Failed to place bid. Please try again.')
    } finally {
      setBidLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 w-20 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Gavel className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{error || 'Listing not found'}</h2>
        <Link href="/listings" className="text-amber-600 hover:text-amber-700 font-medium">← Back to listings</Link>
      </div>
    )
  }

  const images = JSON.parse(listing.images || '[]') as string[]
  const minimumBid = listing.currentBid > 0 ? listing.currentBid + 1 : listing.minBid
  const isOwnListing = session?.user?.id === listing.seller.id
  const isActive = listing.status === 'ACTIVE' && !timeLeft.isEnded
  const displayBid = listing.currentBid > 0 ? listing.currentBid : listing.minBid

  const platformFee = displayBid * 0.1
  const sellerAmount = displayBid * 0.9

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-amber-600">Listings</Link>
        <span>/</span>
        <Link href={`/listings?category=${listing.category.slug}`} className="hover:text-amber-600">
          {listing.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-800 truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="relative h-96 bg-gray-50">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImage((a) => (a - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setActiveImage((a) => (a + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {activeImage + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Gavel className="h-24 w-24 text-gray-200" />
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                {listing.status === 'ACTIVE' && isActive && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">● LIVE</span>
                )}
                {listing.status === 'ENDED' && (
                  <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">ENDED</span>
                )}
                {listing.status === 'SOLD' && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">SOLD</span>
                )}
                {timeLeft.isUrgent && isActive && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">ENDING SOON</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 border-t border-gray-50">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? 'border-amber-500' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-amber-500" />
              Item Description
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Condition</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {conditionLabels[listing.condition] || listing.condition}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-800">{listing.category.icon} {listing.category.name}</p>
              </div>
              {listing.location && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {listing.location}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Listed</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Min. Bid</p>
                <p className="text-sm font-medium text-gray-800">${listing.minBid.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Total Bids</p>
                <p className="text-sm font-medium text-gray-800">{listing._count.bids}</p>
              </div>
            </div>
          </div>

          {/* Bid History */}
          {listing.bids.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Bid History ({listing._count.bids} bids)
              </h2>
              <div className="space-y-2">
                {listing.bids.map((bid, i) => (
                  <div key={bid.id} className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {i === 0 ? '👑' : i + 1}
                      </div>
                      <span className="text-sm text-gray-700">{bid.bidder.name}</span>
                      {i === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Leading</span>}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${i === 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                        ${bid.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Bid Panel + Seller */}
        <div className="space-y-4">
          {/* Main bid card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] p-5 text-white">
              <h1 className="text-lg font-bold leading-tight mb-3">{listing.title}</h1>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {listing.currentBid > 0 ? 'Current highest bid' : 'Starting bid'}
                  </p>
                  <p className="text-3xl font-bold text-amber-400">${displayBid.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">{listing._count.bids} bids</p>
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${
                    timeLeft.isEnded ? 'text-gray-400' : timeLeft.isUrgent ? 'text-red-400' : 'text-green-400'
                  }`}>
                    <Clock className="h-4 w-4" />
                    {timeLeft.text}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              {timeLeft.isEnded || listing.status !== 'ACTIVE' ? (
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                    <p className="text-gray-600 font-medium text-sm">
                      {listing.status === 'SOLD' ? '✅ This item has been sold' : '⏰ Auction has ended'}
                    </p>
                    {listing.currentBid > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        Final price: <strong>${listing.currentBid.toLocaleString()}</strong>
                      </p>
                    )}
                  </div>

                  {/* If session user was the winner */}
                  {session && listing.status === 'ENDED' && listing.bids[0]?.bidder.id === session.user.id && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-amber-800 font-semibold text-sm mb-1">🎉 You won this auction!</p>
                      <p className="text-amber-700 text-xs mb-3">Complete payment within 24 hours to secure your item.</p>
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ listingId: listing.id }),
                          })
                          if (res.ok) {
                            router.push('/dashboard/orders')
                          }
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                      >
                        Pay Now — ${listing.currentBid.toLocaleString()}
                      </button>
                    </div>
                  )}
                </div>
              ) : isOwnListing ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                  <p className="text-blue-700 text-sm font-medium">This is your listing</p>
                  <Link href="/dashboard/my-listings" className="text-blue-600 text-xs hover:underline mt-1 block">
                    Manage in dashboard →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBid} className="space-y-3">
                  {bidError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {bidError}
                    </div>
                  )}
                  {bidSuccess && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg border border-green-100">
                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {bidSuccess}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Your bid (min ${minimumBid.toLocaleString()})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                      <input
                        type="number"
                        step="1"
                        min={minimumBid}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={minimumBid.toString()}
                        className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required
                      />
                    </div>
                  </div>

                  {!session ? (
                    <Link
                      href="/auth/login"
                      className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                    >
                      Sign In to Bid
                    </Link>
                  ) : (
                    <button
                      type="submit"
                      disabled={bidLoading}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-colors"
                    >
                      {bidLoading ? 'Placing bid...' : `Place Bid — $${bidAmount ? parseFloat(bidAmount).toLocaleString() : '---'}`}
                    </button>
                  )}
                </form>
              )}

              {/* Fee breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Fee Breakdown</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Sale price</span>
                    <span>${displayBid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Platform fee (10%)</span>
                    <span>-${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600 border-t border-gray-100 pt-1 mt-1">
                    <span>Seller receives</span>
                    <span>${sellerAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  Secure escrow payment protection
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Package className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  Funds held until delivery confirmed
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  24-hour payment window after auction ends
                </div>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Seller
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                {listing.seller.avatar ? (
                  <img src={listing.seller.avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{listing.seller.name}</p>
                <p className="text-xs text-gray-400">
                  Member since {format(new Date(listing.seller.createdAt), 'MMM yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Verified seller</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
