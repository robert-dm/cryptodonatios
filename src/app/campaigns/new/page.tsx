'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

interface WalletAddress {
  address: string
  blockchain: string
}

const SUPPORTED_BLOCKCHAINS = [
  'Ethereum',
  'Bitcoin',
  'Polygon',
  'BSC',
  'Solana',
  'Cardano',
  'Avalanche'
]

export default function NewCampaign() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    imageUrl: ''
  })
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([
    { address: '', blockchain: 'Ethereum' }
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addWalletAddress = () => {
    setWalletAddresses([...walletAddresses, { address: '', blockchain: 'Ethereum' }])
  }

  const removeWalletAddress = (index: number) => {
    if (walletAddresses.length > 1) {
      setWalletAddresses(walletAddresses.filter((_, i) => i !== index))
    }
  }

  const updateWalletAddress = (index: number, field: keyof WalletAddress, value: string) => {
    const updated = walletAddresses.map((addr, i) => 
      i === index ? { ...addr, [field]: value } : addr
    )
    setWalletAddresses(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate wallet addresses
    const validWalletAddresses = walletAddresses.filter(addr => addr.address.trim() !== '')
    if (validWalletAddresses.length === 0) {
      setError('At least one wallet address is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          walletAddresses: validWalletAddresses
        })
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/campaigns/${data.campaign.id}`)
      } else {
        setError(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Campaign</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Help me fund my education"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell your story and explain what you need the funds for..."
              />
            </div>

            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Amount (USD) *
              </label>
              <input
                id="goalAmount"
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Wallet Addresses *
                </label>
                <button
                  type="button"
                  onClick={addWalletAddress}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Address
                </button>
              </div>
              
              <div className="space-y-3">
                {walletAddresses.map((wallet, index) => (
                  <div key={index} className="flex gap-3">
                    <select
                      value={wallet.blockchain}
                      onChange={(e) => updateWalletAddress(index, 'blockchain', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SUPPORTED_BLOCKCHAINS.map(blockchain => (
                        <option key={blockchain} value={blockchain}>
                          {blockchain}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Wallet address"
                      value={wallet.address}
                      onChange={(e) => updateWalletAddress(index, 'address', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    {walletAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWalletAddress(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Add your crypto wallet addresses where donors can send funds
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}