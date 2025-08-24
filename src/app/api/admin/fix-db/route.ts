import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Fixing database schema...')
    
    // Add the missing enum type
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    // If campaigns table exists but status column is wrong type, fix it
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "campaigns" ALTER COLUMN "status" TYPE "CampaignStatus" USING "status"::"CampaignStatus";
      EXCEPTION
        WHEN others THEN null;
      END $$;
    `
    
    return NextResponse.json(
      { message: 'Database schema fixed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fixing database:', error)
    return NextResponse.json(
      { error: 'Failed to fix database', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET()
}