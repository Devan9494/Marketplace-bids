'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, Plus, X, AlertCircle, Camera } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

const conditions = [
  { value: 'NEW', label: 'New', desc: 'Never used, in original packaging' },
  { value: 'LIKE_NEW', label: 'Like New', desc: 'Used once or twice, no signs of wear' },
  { value: 'GOOD', label: 'Good', desc: 'Minor signs of use, fully functional' },
  { value: 'FAIR', label: 'Fair', desc: 'Visible wear but fully functional' },
  { value: 'POOR', label: 'Poor', desc: 'Heavy wear, may need repairs' },
]

const durations = [
  { value: '1', label: '1 Hour' },
  { value: '3', label: '3 Hours' },
  { value: '6', label: '6 Hours' },
  { value: '12', label: '12 Hours' },
  { value: '24', label: '1 Day' },
  { value: '48', label: '2 Days' },
  { value: '72', label: '3 Days' },
  { value: '120', label: '5 Days' },
  { value: '168', label: '7 Days' },
]

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    condition: 'GOOD',
    minBid: '',
    duration: '24',
    location: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/listings/create')
    }
  }, [status, router])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title || !form.description || !form.categoryId || !form.minBid) {
      setError('Please fill in all required fields.')
      return
    }

    const validImages = imageUrls.filter((url) => url.trim() !== '')
    if (validImages.length === 0) {
      setError('Please add at least one photo URL.')
      return
    }

    setLoading(true)

    try {
      const endsAt = new Date(Date.now() + parseInt(form.duration) * 60 * 60 * 1000)

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          images: validImages,
          categoryId: form.categoryId,
          condition: form.condition,
          minBid: parseFloat(form.minBid),
          endsAt: endsAt.toISOString(),
          location: form.location,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create listing')
        return
      }

      router.push(`/listings/${data.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">List an Item for Auction</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below to start your auction. Only a 10% fee on successful sales.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Apple MacBook Pro 16-inch M3 Max"
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your item in detail - condition, features, accessories included, reason for selling..."
                rows={5}
                maxLength={2000}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City, State"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Photos</h2>
          <p className="text-gray-500 text-xs mb-4">Add photo URLs (from Unsplash, Imgur, etc.). First photo is the main image.</p>

          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...imageUrls]
                      newUrls[i] = e.target.value
                      setImageUrls(newUrls)
                    }}
                    placeholder={`Photo ${i + 1} URL (https://...)`}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {imageUrls.length < 6 && (
            <button
              type="button"
              onClick={() => setImageUrls([...imageUrls, ''])}
              className="mt-3 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add another photo
            </button>
          )}

          {/* Preview */}
          {imageUrls.some((u) => u.trim() !== '') && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {imageUrls.filter((u) => u.trim() !== '').map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="h-16 w-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x64?text=Error'
                    }}
                  />
                  {i === 0 && (
                    <span className="absolute -top-1 -left-1 bg-amber-500 text-white text-xs px-1 rounded font-bold">Main</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Condition */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Condition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {conditions.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, condition: c.value })}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  form.condition === c.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm text-gray-900">{c.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pricing & Duration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Starting Bid <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={form.minBid}
                  onChange={(e) => setForm({ ...form, minBid: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
              {form.minBid && (
                <p className="text-xs text-gray-400 mt-1">
                  You&apos;ll receive: ${(parseFloat(form.minBid) * 0.9).toFixed(2)} (after 10% fee)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Auction Duration <span className="text-red-500">*</span>
              </label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {durations.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Ends: {new Date(Date.now() + parseInt(form.duration) * 60 * 60 * 1000).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Fee info box */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-1">💡 Platform Fee: 10%</p>
            <p className="text-xs text-blue-600">
              We only charge a 10% fee on successful sales. No listing fees. No hidden charges.
              If your item doesn&apos;t sell, you pay nothing.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/listings"
            className="flex-1 text-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Creating listing...' : 'List Item for Auction'}
          </button>
        </div>
      </form>
    </div>
  )
}
