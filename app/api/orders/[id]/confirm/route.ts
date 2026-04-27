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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the buyer can confirm receipt' }, { status: 403 })
    }

    if (order.status !== 'SHIPPED') {
      return NextResponse.json({ error: 'Order must be in SHIPPED status to confirm receipt' }, { status: 400 })
    }

    const body = await request.json()
    const { rating, comment } = body

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          deliveredAt: new Date(),
          completedAt: new Date(),
        },
      })

      // Create review if provided
      if (rating && comment) {
        await tx.review.create({
          data: {
            rating: parseInt(rating),
            comment,
            reviewerId: session.user.id,
            listingId: order.listingId,
            orderId: params.id,
          },
        })
      }

      return updatedOrder
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to confirm receipt' }, { status: 500 })
  }
}
