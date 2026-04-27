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

    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the seller can mark as shipped' }, { status: 403 })
    }

    if (order.status !== 'PAYMENT_RECEIVED') {
      return NextResponse.json({ error: 'Order must be in PAYMENT_RECEIVED status to ship' }, { status: 400 })
    }

    const body = await request.json()
    const { trackingNumber } = body

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'SHIPPED',
        trackingNumber: trackingNumber || null,
        shippedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
