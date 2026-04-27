'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, MapPin, Gavel, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    images: string
    condition: string
    minBid: number
    currentBid: number
    status: string
    endsAt: Date | string
    location: string
    category: { name: string; icon: string }
    seller: { name: string }
    _count: { bids: number }
  }
}

function getTimeLeft(endsAt: Date | string) {
  const end = new Date(endsAt)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return { text: 'Ended', isUrgent: false, isEnded: true }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours < 1) {
    return {
      text: `${minutes}m ${seconds}s`,
      isUrgent: true,
      isEnded: false,
    }
  }
  if (hours < 24) {
    return {
      text: `${hours}h ${minutes}m`,
      isUrgent: hours < 1,
      isEnded: false,
    }
  }
  const days = Math.floor(hours / 24)
  return {
    text: `${days}d ${hours % 24}h`,
    isUrgent: false,
    isEnded: false,
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(listing.endsAt))
  const images = JSON.parse(listing.images || '[]') as string[]
  const firstImage = images[0]

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(listing.endsAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [listing.endsAt])

  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-100 text-green-700',
    LIKE_NEW: 'bg-blue-100 text-blue-700',
    GOOD: 'bg-yellow-100 text-yellow-700',
    FAIR: 'bg-orange-100 text-orange-700',
    POOR: 'bg-red-100 text-red-700',
  }

  const conditionLabels: Record<string, string> = {
    NEW: 'New',
    LIKE_NEW: 'Like New',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
  }

  const displayBid = listing.currentBid > 0 ? listing.currentBid : listing.minBid

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-amber-200 transition-all duration-200">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <Gavel className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {listing.status === 'ACTIVE' && !timeLeft.isEnded && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
            )}
            {timeLeft.isUrgent && !timeLeft.isEnded && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">ENDING SOON</span>
            )}
          </div>
          {/* Category */}
          <div className="absolute top-2 right-2">
            <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {listing.category.icon} {listing.category.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-amber-600 transition-colors">
              {listing.title}
            </h3>
            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-700'}`}>
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          </div>

          {listing.location && (
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </div>
          )}

          {/* Bid info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{listing.currentBid > 0 ? 'Current bid' : 'Starting bid'}</p>
              <p className="text-xl font-bold text-amber-600">${displayBid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-xs font-semibold ${timeLeft.isUrgent ? 'text-red-500' : timeLeft.isEnded ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="h-3.5 w-3.5" />
                {timeLeft.text}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 justify-end">
                <TrendingUp className="h-3 w-3" />
                {listing._count.bids} bid{listing._count.bids !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
            Seller: {listing.seller.name}
          </div>
        </div>
      </div>
    </Link>
  )
}
