import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_FEE_PERCENTAGE = parseFloat(process.env.ADMIN_FEE_PERCENTAGE || '0.5')

export async function POST(request: NextRequest) {
  try {
    const { campaignId, amount, txHash, blockchain, donorAddress } = await request.json()

    if (!campaignId || !amount || !txHash || !blockchain) {
      return NextResponse.json(
        { error: 'Campaign ID, amount, transaction hash, and blockchain are required' },
        { status: 400 }
      )
    }

    const existingDonation = await prisma.donation.findUnique({
      where: { txHash }
    })

    if (existingDonation) {
      return NextResponse.json(
        { error: 'Transaction already recorded' },
        { status: 409 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const donationAmount = parseFloat(amount)
    const adminFee = (donationAmount * ADMIN_FEE_PERCENTAGE) / 100
    const netAmount = donationAmount - adminFee

    const donation = await prisma.$transaction(async (tx) => {
      const newDonation = await tx.donation.create({
        data: {
          campaignId,
          amount: donationAmount,
          adminFee,
          txHash,
          blockchain,
          donorAddress
        }
      })

      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          currentAmount: {
            increment: netAmount
          }
        }
      })

      return newDonation
    })

    return NextResponse.json({ donation }, { status: 201 })
  } catch (error) {
    console.error('Error recording donation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}