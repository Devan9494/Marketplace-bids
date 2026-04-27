import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to bid' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: 'You cannot bid on your own listing' }, { status: 400 })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'This auction has ended' }, { status: 400 })
    }

    if (new Date(listing.endsAt) < new Date()) {
      await prisma.listing.update({ where: { id: params.id }, data: { status: 'ENDED' } })
      return NextResponse.json({ error: 'This auction has ended' }, { status: 400 })
    }

    const body = await request.json()
    const amount = parseFloat(body.amount)

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 })
    }

    const minimumBid = listing.currentBid > 0 ? listing.currentBid + 1 : listing.minBid

    if (amount < minimumBid) {
      return NextResponse.json(
        { error: `Bid must be at least $${minimumBid.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create bid and update listing in transaction
    const [bid, updatedListing] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount,
          bidderId: session.user.id,
          listingId: params.id,
        },
        include: {
          bidder: { select: { id: true, name: true } },
        },
      }),
      prisma.listing.update({
        where: { id: params.id },
        data: { currentBid: amount },
      }),
    ])

    return NextResponse.json({ bid, listing: updatedListing }, { status: 201 })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
  }
}
