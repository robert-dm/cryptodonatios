import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, bio: true, avatar: true }
        },
        walletAddresses: true,
        solanaWallet: {
          select: { publicKey: true, balance: true }
        },
        donations: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            donorAddress: true,
            blockchain: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { donations: true }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}