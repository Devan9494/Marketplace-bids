import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const status = searchParams.get('status') || 'ACTIVE'
    const sort = searchParams.get('sort') || 'endsAt'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: Record<string, unknown> = {}

    if (status !== 'ALL') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (category) {
      where.category = { slug: category }
    }

    if (condition) {
      where.condition = condition
    }

    const orderBy: Record<string, string> = {}
    if (sort === 'endsAt') orderBy.endsAt = 'asc'
    else if (sort === 'price-asc') orderBy.currentBid = 'asc'
    else if (sort === 'price-desc') orderBy.currentBid = 'desc'
    else if (sort === 'newest') orderBy.createdAt = 'desc'
    else orderBy.endsAt = 'asc'

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: true,
          seller: { select: { id: true, name: true, avatar: true } },
          _count: { select: { bids: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({ listings, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, images, categoryId, condition, minBid, endsAt, location } = body

    if (!title || !description || !categoryId || !minBid || !endsAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        images: JSON.stringify(images || []),
        condition: condition || 'GOOD',
        minBid: parseFloat(minBid),
        currentBid: 0,
        status: 'ACTIVE',
        endsAt: new Date(endsAt),
        location: location || '',
        categoryId,
        sellerId: session.user.id,
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
