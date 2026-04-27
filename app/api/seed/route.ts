import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Wipe existing data
    await prisma.review.deleteMany()
    await prisma.order.deleteMany()
    await prisma.bid.deleteMany()
    await prisma.listing.deleteMany()
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()

    // Categories
    const categories = await Promise.all([
      prisma.category.create({ data: { name: 'Electronics', slug: 'electronics', icon: '💻' } }),
      prisma.category.create({ data: { name: 'Vehicles', slug: 'vehicles', icon: '🚗' } }),
      prisma.category.create({ data: { name: 'Furniture', slug: 'furniture', icon: '🛋️' } }),
      prisma.category.create({ data: { name: 'Fashion', slug: 'fashion', icon: '👗' } }),
      prisma.category.create({ data: { name: 'Sports', slug: 'sports', icon: '⚽' } }),
      prisma.category.create({ data: { name: 'Home & Garden', slug: 'home-garden', icon: '🏡' } }),
      prisma.category.create({ data: { name: 'Books', slug: 'books', icon: '📚' } }),
      prisma.category.create({ data: { name: 'Other', slug: 'other', icon: '📦' } }),
    ])

    // Users
    const sellerPw = await bcrypt.hash('password123', 10)
    const buyerPw = await bcrypt.hash('password123', 10)
    const adminPw = await bcrypt.hash('admin123', 10)

    const seller = await prisma.user.create({
      data: { name: 'John Seller', email: 'seller@example.com', password: sellerPw, role: 'USER' },
    })
    const buyer = await prisma.user.create({
      data: { name: 'Jane Buyer', email: 'buyer@example.com', password: buyerPw, role: 'USER' },
    })
    await prisma.user.create({
      data: { name: 'Admin User', email: 'admin@example.com', password: adminPw, role: 'ADMIN' },
    })

    const now = new Date()

    const listings = await Promise.all([
      prisma.listing.create({
        data: {
          title: 'Apple MacBook Pro 16" M3 Max - Like New',
          description: 'Selling my MacBook Pro 16" with M3 Max chip. Only 3 months old, in perfect condition. Comes with original box, charger, and all accessories. 36GB RAM, 1TB SSD.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800']),
          condition: 'LIKE_NEW', minBid: 2500, currentBid: 2750, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          location: 'San Francisco, CA', categoryId: categories[0].id, sellerId: seller.id,
        },
      }),
      prisma.listing.create({
        data: {
          title: 'Sony PlayStation 5 Console Bundle',
          description: 'PS5 Disc Edition with 2 controllers, 5 games. All in excellent condition.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800']),
          condition: 'GOOD', minBid: 400, currentBid: 520, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 18 * 60 * 60 * 1000),
          location: 'New York, NY', categoryId: categories[0].id, sellerId: seller.id,
        },
      }),
      prisma.listing.create({
        data: {
          title: '2019 BMW 3 Series 330i - Excellent Condition',
          description: 'Beautiful 2019 BMW 330i in Alpine White. 42,000 miles, full service history, premium package.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800']),
          condition: 'GOOD', minBid: 28000, currentBid: 31500, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 47 * 60 * 60 * 1000),
          location: 'Los Angeles, CA', categoryId: categories[1].id, sellerId: seller.id,
        },
      }),
      prisma.listing.create({
        data: {
          title: 'Mid-Century Modern Walnut Dining Table Set',
          description: 'Stunning mid-century modern dining table with 6 chairs. Solid walnut wood.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800']),
          condition: 'GOOD', minBid: 800, currentBid: 950, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 30 * 60 * 1000),
          location: 'Chicago, IL', categoryId: categories[2].id, sellerId: seller.id,
        },
      }),
      prisma.listing.create({
        data: {
          title: 'Vintage Rolex Submariner Watch 1969',
          description: 'Rare 1969 Rolex Submariner. Running perfectly, recently serviced. Comes with papers.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800']),
          condition: 'GOOD', minBid: 15000, currentBid: 18200, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
          location: 'Miami, FL', categoryId: categories[3].id, sellerId: seller.id,
        },
      }),
      prisma.listing.create({
        data: {
          title: 'Trek Madone SLR 9 Road Bike 2023',
          description: 'Top-of-the-line Trek Madone SLR 9 carbon road bike. Shimano Dura-Ace Di2. Only 500 miles.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800']),
          condition: 'LIKE_NEW', minBid: 5000, currentBid: 5800, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
          location: 'Seattle, WA', categoryId: categories[4].id, sellerId: seller.id,
        },
      }),
      prisma.listing.create({
        data: {
          title: 'Weber Genesis II E-435 Gas Grill',
          description: 'Weber Genesis II 4-burner propane grill. Used only one season.',
          images: JSON.stringify(['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']),
          condition: 'LIKE_NEW', minBid: 400, currentBid: 0, status: 'ACTIVE',
          endsAt: new Date(now.getTime() + 36 * 60 * 60 * 1000),
          location: 'Austin, TX', categoryId: categories[5].id, sellerId: seller.id,
        },
      }),
    ])

    // Create bids
    await prisma.bid.createMany({
      data: [
        { amount: 2600, bidderId: buyer.id, listingId: listings[0].id },
        { amount: 2700, bidderId: buyer.id, listingId: listings[0].id },
        { amount: 2750, bidderId: buyer.id, listingId: listings[0].id },
        { amount: 450, bidderId: buyer.id, listingId: listings[1].id },
        { amount: 490, bidderId: buyer.id, listingId: listings[1].id },
        { amount: 520, bidderId: buyer.id, listingId: listings[1].id },
        { amount: 29000, bidderId: buyer.id, listingId: listings[2].id },
        { amount: 30500, bidderId: buyer.id, listingId: listings[2].id },
        { amount: 31500, bidderId: buyer.id, listingId: listings[2].id },
        { amount: 860, bidderId: buyer.id, listingId: listings[3].id },
        { amount: 910, bidderId: buyer.id, listingId: listings[3].id },
        { amount: 950, bidderId: buyer.id, listingId: listings[3].id },
        { amount: 16000, bidderId: buyer.id, listingId: listings[4].id },
        { amount: 17500, bidderId: buyer.id, listingId: listings[4].id },
        { amount: 18200, bidderId: buyer.id, listingId: listings[4].id },
        { amount: 5200, bidderId: buyer.id, listingId: listings[5].id },
        { amount: 5500, bidderId: buyer.id, listingId: listings[5].id },
        { amount: 5800, bidderId: buyer.id, listingId: listings[5].id },
      ],
    })

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        categories: categories.length,
        users: 3,
        listings: listings.length,
        bids: 18,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 })
  }
}
