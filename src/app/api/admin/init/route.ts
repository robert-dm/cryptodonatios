import { NextResponse } from 'next/server'
import { createAdminUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function initializeDatabase() {
  try {
    // Check if tables already exist
    await prisma.user.count()
    return { initialized: true, message: 'Database already initialized' }
  } catch (error) {
    // Tables don't exist, create them
    console.log('Initializing database schema...')
    
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");`

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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "donations_txHash_key" ON "donations"("txHash");`

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "solana_wallets" (
        "id" TEXT NOT NULL,
        "publicKey" TEXT NOT NULL,
        "secretKey" TEXT NOT NULL,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "campaignId" TEXT NOT NULL,
        
        CONSTRAINT "solana_wallets_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "solana_wallets_campaignId_key" ON "solana_wallets"("campaignId");`

    return { initialized: false, message: 'Database initialized successfully' }
  }
}

async function initializeApp() {
  try {
    // First, initialize database if needed
    const dbResult = await initializeDatabase()
    
    // Then create admin user
    const adminUser = await createAdminUser()
    
    if (!adminUser && dbResult.initialized) {
      return NextResponse.json(
        { message: 'Admin user already exists and database already initialized' },
        { status: 200 }
      )
    }

    if (!adminUser) {
      return NextResponse.json(
        { 
          message: 'Database initialized but admin user already exists',
          database: dbResult.message
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Database and admin user initialized successfully', 
        user: adminUser,
        database: dbResult.message
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error during initialization:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return initializeApp()
}

export async function POST() {
  return initializeApp()
}