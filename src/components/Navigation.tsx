'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Plus, LogOut, Menu, X, Shield } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

export default function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in by checking localStorage or making an API call
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CryptoDonatios</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/campaigns/new" className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Campaign
                </Link>
                {user.isAdmin && (
                  <Link href="/admin/simple" className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center text-gray-600 px-3 py-2">
                  <User className="w-4 h-4 mr-2" />
                  {user.name}
                  {user.isAdmin && <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link href="/" className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                Browse
              </Link>
              {user ? (
                <>
                  <Link href="/campaigns/new" className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                    Create Campaign
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin/simple" className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="block text-gray-600 px-3 py-2 text-base font-medium">
                    {user.name} {user.isAdmin && <span className="text-red-600">(Admin)</span>}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link href="/auth/register" className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}