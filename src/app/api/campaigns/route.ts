import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { solanaService } from '@/lib/solana'

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        walletAddresses: true,
        _count: {
          select: { donations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = verifyJWT(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { title, description, goalAmount, imageUrl, walletAddresses } = await request.json()

    if (!title || !description || !goalAmount || !walletAddresses || walletAddresses.length === 0) {
      return NextResponse.json(
        { error: 'Title, description, goal amount, and at least one wallet address are required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.$transaction(async (tx) => {
      // Create the campaign
      const newCampaign = await tx.campaign.create({
        data: {
          title,
          description,
          goalAmount: parseFloat(goalAmount),
          imageUrl,
          userId: user.id,
          walletAddresses: {
            create: walletAddresses.map((addr: { address: string; blockchain: string }) => ({
              address: addr.address,
              blockchain: addr.blockchain
            }))
          }
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          walletAddresses: true
        }
      })

      // Generate Solana wallet for the campaign within the transaction
      const wallet = solanaService.generateWallet()
      await tx.solanaWallet.create({
        data: {
          campaignId: newCampaign.id,
          publicKey: wallet.publicKey,
          secretKey: wallet.secretKey,
          balance: 0
        }
      })

      return newCampaign
    })

    const campaignWithSolana = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        walletAddresses: true,
        solanaWallet: {
          select: { publicKey: true, balance: true }
        }
      }
    })

    return NextResponse.json({ campaign: campaignWithSolana }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}