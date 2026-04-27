'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gavel, Clock, Plus, Eye, XCircle, TrendingUp, Package, CheckCircle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Listing {
  id: string
  title: string
  images: string
  condition: string
  minBid: number
  currentBid: number
  status: string
  endsAt: string
  createdAt: string
  location: string
  _count: { bids: number }
  category: { name: string; icon: string }
}

const statusConfig: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: 'Active', class: 'bg-green-100 text-green-700' },
  ENDED: { label: 'Ended', class: 'bg-yellow-100 text-yellow-700' },
  SOLD: { label: 'Sold', class: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Cancelled', class: 'bg-red-100 text-red-700' },
}

export default function MyListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (!session) return

    fetch('/api/listings?status=ALL&limit=50')
      .then((r) => r.json())
      .then((data) => {
        const mine = (data.listings || []).filter(
          (l: Listing & { seller: { id: string } }) => l.seller?.id === session.user.id
        )
        setListings(mine)
      })
      .finally(() => setLoading(false))
  }, [session])

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this listing?')) return
    setCancellingId(id)
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'CANCELLED' } : l))
      }
    } finally {
      setCancellingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const filtered = filter === 'ALL' ? listings : listings.filter((l) => l.status === filter)
  const counts = {
    ALL: listings.length,
    ACTIVE: listings.filter((l) => l.status === 'ACTIVE').length,
    ENDED: listings.filter((l) => l.status === 'ENDED').length,
    SOLD: listings.filter((l) => l.status === 'SOLD').length,
    CANCELLED: listings.filter((l) => l.status === 'CANCELLED').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} total listing{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/listings/create"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              filter === key
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {key === 'ALL' ? 'All' : key.charAt(0) + key.slice(1).toLowerCase()} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Gavel className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No listings found</h3>
          <p className="text-gray-400 text-sm mb-4">
            {filter === 'ALL' ? "You haven't listed any items yet." : `No ${filter.toLowerCase()} listings.`}
          </p>
          <Link href="/listings/create" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((listing) => {
            const images = JSON.parse(listing.images || '[]') as string[]
            const isEnded = new Date(listing.endsAt) < new Date()
            const statusInfo = statusConfig[listing.status] || { label: listing.status, class: 'bg-gray-100 text-gray-700' }

            return (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-24 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Gavel className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link href={`/listings/${listing.id}`} className="font-semibold text-gray-900 hover:text-amber-600 text-sm line-clamp-1 transition-colors">
                        {listing.title}
                      </Link>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {listing._count.bids} bid{listing._count.bids !== 1 ? 's' : ''}
                      </span>
                      <span className="font-medium text-amber-600">
                        ${listing.currentBid > 0 ? listing.currentBid.toLocaleString() : listing.minBid.toLocaleString()}
                        {listing.currentBid === 0 && <span className="text-gray-400 font-normal"> (starting)</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isEnded || listing.status !== 'ACTIVE'
                          ? `Ended ${formatDistanceToNow(new Date(listing.endsAt), { addSuffix: true })}`
                          : `Ends ${formatDistanceToNow(new Date(listing.endsAt), { addSuffix: true })}`
                        }
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">
                      Listed {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      {' · '}{listing.category.icon} {listing.category.name}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 pb-4">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 border border-gray-200 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                  {listing.status === 'ENDED' && listing._count.bids > 0 && (
                    <Link
                      href="/dashboard/orders"
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors"
                    >
                      <Package className="h-3.5 w-3.5" />
                      View Order
                    </Link>
                  )}
                  {listing.status === 'ACTIVE' && listing._count.bids === 0 && (
                    <button
                      onClick={() => handleCancel(listing.id)}
                      disabled={cancellingId === listing.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {cancellingId === listing.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
