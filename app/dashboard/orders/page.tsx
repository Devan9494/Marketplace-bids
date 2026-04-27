'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Package, Truck, CheckCircle, Clock, AlertCircle, DollarSign, Gavel } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Order {
  id: string
  amount: number
  platformFee: number
  sellerAmount: number
  status: string
  trackingNumber: string | null
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  completedAt: string | null
  listing: { id: string; title: string; images: string; condition: string }
  buyer: { id: string; name: string; email: string }
  seller: { id: string; name: string; email: string }
  review: { rating: number; comment: string } | null
}

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  PAYMENT_PENDING: { label: 'Payment Pending', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAYMENT_RECEIVED: { label: 'Payment Received', class: 'bg-blue-100 text-blue-700', icon: DollarSign },
  SHIPPED: { label: 'Shipped', class: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Delivered', class: 'bg-teal-100 text-teal-700', icon: Package },
  COMPLETED: { label: 'Completed', class: 'bg-green-100 text-green-700', icon: CheckCircle },
  DISPUTED: { label: 'Disputed', class: 'bg-red-100 text-red-700', icon: AlertCircle },
  REFUNDED: { label: 'Refunded', class: 'bg-gray-100 text-gray-700', icon: DollarSign },
}

function OrdersContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(searchParams.get('role') || 'all')
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  const fetchOrders = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders${role !== 'all' ? `?role=${role}` : ''}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [session, role])

  const handleShip = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      })
      if (res.ok) {
        setShippingOrderId(null)
        setTrackingNumber('')
        fetchOrders()
      }
    } catch (err) {}
  }

  const handleConfirm = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      })
      if (res.ok) {
        setConfirmingId(null)
        fetchOrders()
      }
    } catch (err) {}
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const isBuyer = (order: Order) => order.buyer.id === session?.user.id
  const isSeller = (order: Order) => order.seller.id === session?.user.id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'buyer', label: 'My Purchases' },
          { key: 'seller', label: 'My Sales' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRole(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              role === key ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-4">Orders will appear here when auctions end and payments are made.</p>
          <Link href="/listings" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
            Browse auctions
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const images = JSON.parse(order.listing.images || '[]') as string[]
            const statusInfo = statusConfig[order.status] || { label: order.status, class: 'bg-gray-100 text-gray-600', icon: Package }
            const StatusIcon = statusInfo.icon
            const buyerView = isBuyer(order)
            const sellerView = isSeller(order)

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.class}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                    {buyerView && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">Buyer</span>}
                    {sellerView && !buyerView && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded font-medium">Seller</span>}
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex gap-4 mb-4">
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

                    <div className="flex-1">
                      <Link
                        href={`/listings/${order.listing.id}`}
                        className="font-semibold text-gray-900 hover:text-amber-600 text-sm transition-colors"
                      >
                        {order.listing.title}
                      </Link>
                      <div className="mt-1 text-xs text-gray-500">
                        {buyerView ? `Seller: ${order.seller.name}` : `Buyer: ${order.buyer.name} (${order.buyer.email})`}
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-1 text-xs text-purple-600">
                          Tracking: <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Amounts */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${order.amount.toLocaleString()}</p>
                      {sellerView && !buyerView && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          <p>Fee: -${order.platformFee.toFixed(2)}</p>
                          <p className="text-green-600 font-medium">You get: ${order.sellerAmount.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-1 mb-4 text-xs">
                    {[
                      { label: 'Paid', date: order.paidAt, done: !!order.paidAt },
                      { label: 'Shipped', date: order.shippedAt, done: !!order.shippedAt },
                      { label: 'Delivered', date: order.deliveredAt || order.completedAt, done: !!order.completedAt },
                    ].map(({ label, date, done }, i) => (
                      <div key={label} className="flex items-center gap-1">
                        {i > 0 && <div className={`h-px w-8 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                        <div className={`flex items-center gap-1 ${done ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-3 h-3 rounded-full border-2 ${done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                          <span>{label}</span>
                          {date && <span className="text-gray-400">({formatDistanceToNow(new Date(date), { addSuffix: true })})</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Seller: mark as shipped */}
                    {sellerView && order.status === 'PAYMENT_RECEIVED' && (
                      <div className="w-full">
                        {shippingOrderId === order.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="Tracking number (optional)"
                              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button
                              onClick={() => handleShip(order.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                              Confirm Ship
                            </button>
                            <button
                              onClick={() => setShippingOrderId(null)}
                              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShippingOrderId(order.id)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            <Truck className="h-4 w-4" />
                            Mark as Shipped
                          </button>
                        )}
                      </div>
                    )}

                    {/* Buyer: confirm receipt */}
                    {buyerView && order.status === 'SHIPPED' && (
                      <div className="w-full">
                        {confirmingId === order.id ? (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                            <h4 className="font-medium text-green-800 text-sm">Confirm Receipt & Leave Review</h4>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">Rating:</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                    className={`text-xl ${star <= reviewData.rating ? 'text-amber-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={reviewData.comment}
                              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                              placeholder="Share your experience with this seller..."
                              rows={2}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirm(order.id)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Confirm & Release Payment
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(order.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirm Receipt
                          </button>
                        )}
                      </div>
                    )}

                    {order.status === 'COMPLETED' && order.review && (
                      <div className="w-full bg-amber-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < order.review!.rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
                          ))}
                          <span className="text-gray-500 text-xs ml-1">Your review</span>
                        </div>
                        <p className="text-gray-700 text-xs">{order.review.comment}</p>
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>}>
      <OrdersContent />
    </Suspense>
  )
}
