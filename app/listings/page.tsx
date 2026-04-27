'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, SlidersHorizontal, Gavel, ChevronLeft, ChevronRight } from 'lucide-react'
import ListingCard from '@/components/ListingCard'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

interface Listing {
  id: string
  title: string
  images: string
  condition: string
  minBid: number
  currentBid: number
  status: string
  endsAt: string
  location: string
  category: { name: string; icon: string }
  seller: { name: string }
  _count: { bids: number }
}

function ListingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const condition = searchParams.get('condition') || ''
  const sort = searchParams.get('sort') || 'endsAt'
  const page = parseInt(searchParams.get('page') || '1')

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (condition) params.set('condition', condition)
    params.set('sort', sort)
    params.set('page', String(page))

    fetch(`/api/listings?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data.listings || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      })
      .finally(() => setLoading(false))
  }, [search, category, condition, sort, page])

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/listings?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams('search', searchInput)
  }

  const conditions = [
    { value: '', label: 'All Conditions' },
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
  ]

  const sortOptions = [
    { value: 'endsAt', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Auctions</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${total} auction${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link
          href="/listings/create"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Gavel className="h-4 w-4" />
          List an Item
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParams('category', '')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !category ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams('category', cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === cat.slug ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <select
              value={condition}
              onChange={(e) => updateParams('condition', e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse">
              <div className="h-48 bg-gray-100 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-6 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Gavel className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No auctions found</h3>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => router.push('/listings')}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => updateParams('page', String(page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button
            onClick={() => updateParams('page', String(page + 1))}
            disabled={page >= pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>}>
      <ListingsContent />
    </Suspense>
  )
}
