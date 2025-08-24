import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Check if tables already exist by trying to count users
    try {
      await prisma.user.count()
      return NextResponse.json(
        { message: 'Database already initialized' },
        { status: 200 }
      )
    } catch (error) {
      // Tables don't exist, continue with initialization
    }

    // Create the database schema using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "bio" TEXT,
        "avatar" TEXT,
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "campaigns" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "goalAmount" DOUBLE PRECISION NOT NULL,
        "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "imageUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "wallet_addresses" (
        "id" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "blockchain" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "campaignId" TEXT NOT NULL,
        
        CONSTRAINT "wallet_addresses_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "donations" (
        "id" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "adminFee" DOUBLE PRECISION NOT NULL,
        "txHash" TEXT NOT NULL,
        "blockchain" TEXT NOT NULL,
        "donorAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "campaignId" TEXT NOT NULL,
        "userId" TEXT,
        
        CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "donations_txHash_key" ON "donations"("txHash");
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "solana_wallets" (
        "id" TEXT NOT NULL,
        "publicKey" TEXT NOT NULL,
        "secretKey" TEXT NOT NULL,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "campaignId" TEXT NOT NULL,
        
        CONSTRAINT "solana_wallets_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "solana_wallets_campaignId_key" ON "solana_wallets"("campaignId");
    `

    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "campaigns" 
      ADD CONSTRAINT IF NOT EXISTS "campaigns_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    await prisma.$executeRaw`
      ALTER TABLE "wallet_addresses" 
      ADD CONSTRAINT IF NOT EXISTS "wallet_addresses_campaignId_fkey" 
      FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    await prisma.$executeRaw`
      ALTER TABLE "donations" 
      ADD CONSTRAINT IF NOT EXISTS "donations_campaignId_fkey" 
      FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    await prisma.$executeRaw`
      ALTER TABLE "donations" 
      ADD CONSTRAINT IF NOT EXISTS "donations_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `

    await prisma.$executeRaw`
      ALTER TABLE "solana_wallets" 
      ADD CONSTRAINT IF NOT EXISTS "solana_wallets_campaignId_fkey" 
      FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    return NextResponse.json(
      { message: 'Database initialized successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error },
      { status: 500 }
    )
  }
}