import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'buyer' | 'seller'

    const where: Record<string, string> = {}
    if (role === 'buyer') {
      where.buyerId = session.user.id
    } else if (role === 'seller') {
      where.sellerId = session.user.id
    } else {
      // Return both
    }

    const orders = await prisma.order.findMany({
      where: role === 'buyer'
        ? { buyerId: session.user.id }
        : role === 'seller'
        ? { sellerId: session.user.id }
        : { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
      include: {
        listing: {
          select: {
            id: true, title: true, images: true, condition: true,
          },
        },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
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
    const { listingId } = body

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1 },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'ENDED') {
      return NextResponse.json({ error: 'Auction has not ended yet' }, { status: 400 })
    }

    const winningBid = listing.bids[0]

    if (!winningBid || winningBid.bidderId !== session.user.id) {
      return NextResponse.json({ error: 'You are not the winner of this auction' }, { status: 400 })
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: { listingId },
    })

    if (existingOrder) {
      return NextResponse.json(existingOrder)
    }

    const amount = winningBid.amount
    const platformFee = amount * 0.1
    const sellerAmount = amount * 0.9

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          listingId,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          amount,
          platformFee,
          sellerAmount,
          status: 'PAYMENT_RECEIVED',
          paidAt: new Date(),
        },
        include: {
          listing: { select: { id: true, title: true, images: true } },
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
        },
      })

      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'SOLD' },
      })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
