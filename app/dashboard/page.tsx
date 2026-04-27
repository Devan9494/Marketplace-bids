'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gavel, TrendingUp, Package, ShoppingCart, Plus, ArrowRight, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DashboardData {
  listings: number
  bids: number
  buyerOrders: number
  sellerOrders: number
}

interface RecentListing {
  id: string
  title: string
  currentBid: number
  minBid: number
  status: string
  endsAt: string
  _count: { bids: number }
}

interface RecentBid {
  id: string
  amount: number
  createdAt: string
  listing: { id: string; title: string; status: string; endsAt: string; currentBid: number }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      try {
        const [userRes, listingsRes, bidsRes] = await Promise.all([
          fetch('/api/users'),
          fetch(`/api/listings?status=ALL`),
          fetch(`/api/bids?userId=${session.user.id}`),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setStats(userData._count)
        }

        if (listingsRes.ok) {
          const listData = await listingsRes.json()
          const myListings = (listData.listings || []).filter(
            (l: RecentListing & { seller?: { id: string } }) => l.seller?.id === session.user.id
          )
          setRecentListings(myListings.slice(0, 3))
        }

        if (bidsRes.ok) {
          const bidData = await bidsRes.json()
          setRecentBids(bidData.slice(0, 3))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!session) return null

  const statCards = [
    {
      label: 'My Listings',
      value: stats?.listings ?? 0,
      icon: Gavel,
      color: 'bg-amber-50 text-amber-600',
      href: '/dashboard/my-listings',
    },
    {
      label: 'Bids Placed',
      value: stats?.bids ?? 0,
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600',
      href: '/dashboard/my-bids',
    },
    {
      label: 'Purchases',
      value: stats?.buyerOrders ?? 0,
      icon: ShoppingCart,
      color: 'bg-green-50 text-green-600',
      href: '/dashboard/orders?role=buyer',
    },
    {
      label: 'Sales',
      value: stats?.sellerOrders ?? 0,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
      href: '/dashboard/orders?role=seller',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">{session.user.email}</p>
        </div>
        <Link
          href="/listings/create"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          List New Item
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="group">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/listings/create', icon: Plus, label: 'List an item for auction', desc: 'Start earning from items you no longer need' },
              { href: '/listings', icon: Gavel, label: 'Browse active auctions', desc: 'Find great deals and place bids' },
              { href: '/dashboard/my-listings', icon: Package, label: 'Manage my listings', desc: 'View and manage your active auctions' },
              { href: '/dashboard/orders', icon: ShoppingCart, label: 'View my orders', desc: 'Track purchases and sales' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Icon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* How Escrow Works */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-xl p-6 text-white">
          <h2 className="font-semibold text-white mb-4">How Payments Work</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Auction ends', desc: 'Winner is notified and has 24 hours to pay' },
              { step: 2, title: 'Payment held in escrow', desc: 'Funds are securely held by the platform' },
              { step: 3, title: 'Seller ships item', desc: 'Mark as shipped with tracking number' },
              { step: 4, title: 'Buyer confirms receipt', desc: '90% released to seller, 10% platform fee' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
