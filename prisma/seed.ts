import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics', icon: '💻' } }),
    prisma.category.upsert({ where: { slug: 'vehicles' }, update: {}, create: { name: 'Vehicles', slug: 'vehicles', icon: '🚗' } }),
    prisma.category.upsert({ where: { slug: 'furniture' }, update: {}, create: { name: 'Furniture', slug: 'furniture', icon: '🛋️' } }),
    prisma.category.upsert({ where: { slug: 'fashion' }, update: {}, create: { name: 'Fashion', slug: 'fashion', icon: '👗' } }),
    prisma.category.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports', slug: 'sports', icon: '⚽' } }),
    prisma.category.upsert({ where: { slug: 'home-garden' }, update: {}, create: { name: 'Home & Garden', slug: 'home-garden', icon: '🏡' } }),
    prisma.category.upsert({ where: { slug: 'books' }, update: {}, create: { name: 'Books', slug: 'books', icon: '📚' } }),
    prisma.category.upsert({ where: { slug: 'other' }, update: {}, create: { name: 'Other', slug: 'other', icon: '📦' } }),
  ])

  console.log('Categories created')

  // Create users
  const sellerPassword = await bcrypt.hash('password123', 10)
  const buyerPassword = await bcrypt.hash('password123', 10)
  const adminPassword = await bcrypt.hash('admin123', 10)

  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      name: 'John Seller',
      email: 'seller@example.com',
      password: sellerPassword,
      role: 'USER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
    },
  })

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      name: 'Jane Buyer',
      email: 'buyer@example.com',
      password: buyerPassword,
      role: 'USER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer',
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  })

  console.log('Users created')

  const now = new Date()
  const electronics = categories[0]
  const vehicles = categories[1]
  const furniture = categories[2]
  const fashion = categories[3]
  const sports = categories[4]
  const homeGarden = categories[5]

  // Create listings
  const listing1 = await prisma.listing.create({
    data: {
      title: 'Apple MacBook Pro 16" M3 Max - Like New',
      description: 'Selling my MacBook Pro 16" with M3 Max chip. Only 3 months old, in perfect condition. Comes with original box, charger, and all accessories. 36GB RAM, 1TB SSD. Space Black color.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1611186871525-7e14f5aaa4e9?w=800',
      ]),
      condition: 'LIKE_NEW',
      minBid: 2500,
      currentBid: 2750,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      location: 'San Francisco, CA',
      categoryId: electronics.id,
      sellerId: seller.id,
    },
  })

  const listing2 = await prisma.listing.create({
    data: {
      title: 'Sony PlayStation 5 Console Bundle',
      description: 'PS5 Disc Edition with 2 controllers, 5 games including Spider-Man 2, God of War Ragnarök, and more. All in excellent condition. Selling because upgrading setup.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
        'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
      ]),
      condition: 'GOOD',
      minBid: 400,
      currentBid: 520,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 18 * 60 * 60 * 1000), // 18 hours
      location: 'New York, NY',
      categoryId: electronics.id,
      sellerId: seller.id,
    },
  })

  const listing3 = await prisma.listing.create({
    data: {
      title: '2019 BMW 3 Series 330i - Excellent Condition',
      description: 'Beautiful 2019 BMW 330i in Alpine White. 42,000 miles, full service history, premium package, sunroof, heated seats. No accidents. Recently serviced.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
        'https://images.unsplash.com/photo-1617469955236-a01c7a16f406?w=800',
      ]),
      condition: 'GOOD',
      minBid: 28000,
      currentBid: 31500,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 47 * 60 * 60 * 1000), // ~2 days
      location: 'Los Angeles, CA',
      categoryId: vehicles.id,
      sellerId: seller.id,
    },
  })

  const listing4 = await prisma.listing.create({
    data: {
      title: 'Mid-Century Modern Walnut Dining Table Set',
      description: 'Stunning mid-century modern dining table with 6 chairs. Solid walnut wood, excellent craftsmanship. Table dimensions: 72" x 36". Chairs have original upholstery in great condition.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1549497538-303791108f95?w=800',
      ]),
      condition: 'GOOD',
      minBid: 800,
      currentBid: 950,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes
      location: 'Chicago, IL',
      categoryId: furniture.id,
      sellerId: seller.id,
    },
  })

  const listing5 = await prisma.listing.create({
    data: {
      title: 'Vintage Rolex Submariner Watch 1969',
      description: 'Rare 1969 Rolex Submariner ref. 1680 with original matte dial. Running perfectly, recently serviced by certified watchmaker. Comes with papers and original bracelet.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
      ]),
      condition: 'GOOD',
      minBid: 15000,
      currentBid: 18200,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days
      location: 'Miami, FL',
      categoryId: fashion.id,
      sellerId: seller.id,
    },
  })

  const listing6 = await prisma.listing.create({
    data: {
      title: 'Trek Madone SLR 9 Road Bike 2023',
      description: 'Top-of-the-line Trek Madone SLR 9 carbon road bike. Size 56cm, Shimano Dura-Ace Di2 groupset, Bontrager Aeolus RSL 51 wheels. Only 500 miles. Perfect for serious cyclists.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
      ]),
      condition: 'LIKE_NEW',
      minBid: 5000,
      currentBid: 5800,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours
      location: 'Seattle, WA',
      categoryId: sports.id,
      sellerId: seller.id,
    },
  })

  const listing7 = await prisma.listing.create({
    data: {
      title: 'Weber Genesis II E-435 Gas Grill',
      description: 'Weber Genesis II 4-burner propane grill with side burner. Used only one season, in excellent condition. Includes all original grates, Flavorizer bars, and drip tray. Cover included.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
      ]),
      condition: 'LIKE_NEW',
      minBid: 400,
      currentBid: 0,
      status: 'ACTIVE',
      endsAt: new Date(now.getTime() + 36 * 60 * 60 * 1000), // 36 hours
      location: 'Austin, TX',
      categoryId: homeGarden.id,
      sellerId: seller.id,
    },
  })

  console.log('Listings created')

  // Create bids
  await prisma.bid.createMany({
    data: [
      { amount: 2600, bidderId: buyer.id, listingId: listing1.id },
      { amount: 2700, bidderId: buyer.id, listingId: listing1.id },
      { amount: 2750, bidderId: buyer.id, listingId: listing1.id },
      { amount: 450, bidderId: buyer.id, listingId: listing2.id },
      { amount: 490, bidderId: buyer.id, listingId: listing2.id },
      { amount: 520, bidderId: buyer.id, listingId: listing2.id },
      { amount: 29000, bidderId: buyer.id, listingId: listing3.id },
      { amount: 30500, bidderId: buyer.id, listingId: listing3.id },
      { amount: 31500, bidderId: buyer.id, listingId: listing3.id },
      { amount: 860, bidderId: buyer.id, listingId: listing4.id },
      { amount: 910, bidderId: buyer.id, listingId: listing4.id },
      { amount: 950, bidderId: buyer.id, listingId: listing4.id },
      { amount: 16000, bidderId: buyer.id, listingId: listing5.id },
      { amount: 17500, bidderId: buyer.id, listingId: listing5.id },
      { amount: 18200, bidderId: buyer.id, listingId: listing5.id },
      { amount: 5200, bidderId: buyer.id, listingId: listing6.id },
      { amount: 5500, bidderId: buyer.id, listingId: listing6.id },
      { amount: 5800, bidderId: buyer.id, listingId: listing6.id },
    ],
  })

  console.log('Bids created')
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
