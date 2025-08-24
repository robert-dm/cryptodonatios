'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react'

interface SolanaWallet {
  id: string
  publicKey: string
  secretKey: string
  balance: number
  campaign: {
    id: string
    title: string
  }
}

interface User {
  isAdmin: boolean
}

export default function AdminDashboard() {
  const [wallets, setWallets] = useState<SolanaWallet[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }

      const data = await response.json()
      if (!data.user.isAdmin) {
        router.push('/')
        return
      }

      setUser(data.user)
      await fetchWallets()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/admin/wallets')
      if (response.ok) {
        const data = await response.json()
        setWallets(data.wallets)
      }
    } catch (error) {
      console.error('Error fetching wallets:', error)
    }
  }

  const refreshBalances = async () => {
    setRefreshing(true)
    await fetchWallets()
    setRefreshing(false)
  }

  const toggleSecretVisibility = (walletId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }))
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard')
  }

  const initializeAdmin = async () => {
    try {
      const response = await fetch('/api/admin/init', { method: 'POST' })
      const data = await response.json()
      alert(data.message)
    } catch (error) {
      console.error('Error initializing admin:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage Solana wallets and campaign funds</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={initializeAdmin}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Initialize Admin
              </button>
              <button
                onClick={refreshBalances}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Balances
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Campaign Solana Wallets</h2>
            <p className="text-sm text-gray-500">Auto-generated wallets for tracking campaign funds</p>
          </div>

          {wallets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No campaign wallets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Public Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Secret Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance (SOL)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wallets.map((wallet) => (
                    <tr key={wallet.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {wallet.campaign.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {wallet.campaign.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {wallet.publicKey.slice(0, 12)}...{wallet.publicKey.slice(-8)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(wallet.publicKey)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-mono text-gray-900">
                            {showSecrets[wallet.id] 
                              ? wallet.secretKey.slice(0, 20) + '...'
                              : '••••••••••••••••••••'
                            }
                          </div>
                          <button
                            onClick={() => toggleSecretVisibility(wallet.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets[wallet.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {showSecrets[wallet.id] && (
                          <button
                            onClick={() => copyToClipboard(wallet.secretKey)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Full Key
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {wallet.balance.toFixed(4)} SOL
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(wallet.balance * 100).toFixed(2)} USD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`https://explorer.solana.com/address/${wallet.publicKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View on Explorer
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Secret keys provide full access to wallet funds. Keep them secure and never share them publicly.
                  This admin interface is for authorized personnel only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}