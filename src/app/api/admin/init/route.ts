import { NextResponse } from 'next/server'
import { createAdminUser } from '@/lib/auth'

export async function POST() {
  try {
    const adminUser = await createAdminUser()
    
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Admin user already exists or missing configuration' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Admin user created successfully', user: adminUser },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}