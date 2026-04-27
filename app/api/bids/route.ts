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

    const bids = await prisma.bid.findMany({
      where: { bidderId: session.user.id },
      include: {
        listing: {
          select: {
            id: true, title: true, images: true, status: true,
            endsAt: true, currentBid: true, minBid: true,
            seller: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bids)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 })
  }
}
