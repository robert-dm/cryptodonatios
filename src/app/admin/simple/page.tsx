'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react'

// Mock admin data for demonstration
const mockAdminData = {
  user: { isAdmin: true, name: 'Administrator' },
  wallets: [
    {
      id: '1',
      publicKey: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLmkHSy3TGfDxCcD',
      secretKey: 'E4PrPfxF8hGCPQ1yLHDhBJvKzLiVCzXs7HUwZm9yF2vBaPqRdT3G8N5KjLmW',
      balance: 2.5432,
      campaign: {
        id: 'camp1',
        title: 'Help Build Clean Water Wells'
      }
    },
    {
      id: '2', 
      publicKey: 'DjVE1hL2Z3bKs8fW9YuXt7QpRn4MmGcAsE6VqHwNxBzP2TuF',
      secretKey: 'A9XhR2LmBvYp7KfW8ZuGq3TqMn5CcDsE6VhUxNzP4LbWmHtJ',
      balance: 5.1234,
      campaign: {
        id: 'camp2',
        title: 'Education for Underprivileged Children'
      }
    },
    {
      id: '3',
      publicKey: 'FqNxBzP2TuHjVE1hL2Z3bKs8fW9YuXt7QpRn4MmGcAsE6Vw',
      secretKey: 'M5CcDsE6VhUxNzP4LbWmHtJA9XhR2LmBvYp7KfW8ZuGq3Tq',
      balance: 0.8765,
      campaign: {
        id: 'camp3',
        title: 'Medical Equipment for Rural Hospitals'
      }
    }
  ]
}

export default function SimpleAdminDashboard() {
  const [wallets, setWallets] = useState(mockAdminData.wallets)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [refreshing, setRefreshing] = useState(false)

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

  const refreshBalances = async () => {
    setRefreshing(true)
    // Simulate refresh with random balance changes
    setTimeout(() => {
      setWallets(prev => prev.map(wallet => ({
        ...wallet,
        balance: Math.random() * 10
      })))
      setRefreshing(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage Solana wallets and campaign funds</p>
              <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg inline-block text-sm">
                ✅ Logged in as: Administrator (Demo Mode)
              </div>
            </div>
            <div className="flex space-x-3">
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
                        ID: {wallet.campaign.id}
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
                        Copy Full Key
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
                          Copy Full Secret
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
                        href={`https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`}
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
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Balance</h3>
            <div className="text-3xl font-bold text-blue-600">
              {wallets.reduce((sum, wallet) => sum + wallet.balance, 0).toFixed(4)} SOL
            </div>
            <div className="text-sm text-gray-500">
              ${(wallets.reduce((sum, wallet) => sum + wallet.balance, 0) * 100).toFixed(2)} USD
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Campaigns</h3>
            <div className="text-3xl font-bold text-green-600">
              {wallets.length}
            </div>
            <div className="text-sm text-gray-500">
              With auto-generated wallets
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Fee</h3>
            <div className="text-3xl font-bold text-purple-600">
              0.5%
            </div>
            <div className="text-sm text-gray-500">
              From each donation
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode - Security Notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This is a demonstration version. In production:
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Secret keys would be encrypted and secured</li>
                  <li>Proper authentication would be required</li>
                  <li>Real Solana RPC connections would fetch live balances</li>
                  <li>Admin access would be restricted and logged</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Main Application
          </Link>
        </div>
      </div>
    </div>
  )
}