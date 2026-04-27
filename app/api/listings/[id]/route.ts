import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatar: true, createdAt: true } },
        bids: {
          include: {
            bidder: { select: { id: true, name: true } },
          },
          orderBy: { amount: 'desc' },
          take: 10,
        },
        _count: { select: { bids: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Auto-end auctions that have passed their end time
    if (listing.status === 'ACTIVE' && new Date(listing.endsAt) < new Date()) {
      await prisma.listing.update({
        where: { id: params.id },
        data: { status: 'ENDED' },
      })
      listing.status = 'ENDED'
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (listing.status === 'ACTIVE' && listing.currentBid > 0) {
      return NextResponse.json({ error: 'Cannot cancel listing with active bids' }, { status: 400 })
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
