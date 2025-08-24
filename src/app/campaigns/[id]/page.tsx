'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, User, Copy, Heart, ExternalLink } from 'lucide-react'
import WalletConnect from '@/components/WalletConnect'

interface Campaign {
  id: string
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  imageUrl?: string
  createdAt: string
  user: {
    id: string
    name: string
    bio?: string
    avatar?: string
  }
  walletAddresses: {
    id: string
    address: string
    blockchain: string
  }[]
  solanaWallet?: {
    publicKey: string
    balance: number
  }
  donations: {
    id: string
    amount: number
    createdAt: string
    donorAddress?: string
    blockchain: string
  }[]
  _count: {
    donations: number
  }
}

function WalletAddress({ address, blockchain }: { address: string, blockchain: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">{blockchain}</div>
        <div className="text-sm text-gray-600 font-mono break-all">{address}</div>
      </div>
      <button
        onClick={copyToClipboard}
        className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <Copy className="w-4 h-4 mr-1" />
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function DonationCard({ donation }: { donation: Campaign['donations'][0] }) {
  const shortAddress = donation.donorAddress 
    ? `${donation.donorAddress.slice(0, 6)}...${donation.donorAddress.slice(-4)}`
    : 'Anonymous'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Heart className="w-5 h-5 text-red-500 mr-2" />
          <div>
            <div className="font-medium text-gray-900">${donation.amount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">from {shortAddress}</div>
            <div className="text-xs text-gray-400">{donation.blockchain}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(donation.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default function CampaignDetail() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleDonation = async (amount: string, txHash: string, donorAddress: string) => {
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: params.id,
          amount,
          txHash,
          blockchain: 'Ethereum',
          donorAddress,
        }),
      })

      if (response.ok) {
        // Refresh campaign data
        const campaignResponse = await fetch(`/api/campaigns/${params.id}`)
        if (campaignResponse.ok) {
          const data = await campaignResponse.json()
          setCampaign(data.campaign)
        }
      }
    } catch (error) {
      console.error('Error recording donation:', error)
      throw error
    }
  }

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCampaign(data.campaign)
        } else {
          setError('Campaign not found')
        }
      } catch (error) {
        setError('Error loading campaign')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCampaign()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const progressPercentage = (campaign.currentAmount / campaign.goalAmount) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {campaign.imageUrl && (
                <div className="h-64 sm:h-80">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
                
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                  <span className="mx-2">•</span>
                  <User className="w-4 h-4 mr-1" />
                  by {campaign.user.name}
                </div>

                <div className="prose prose-blue max-w-none">
                  {campaign.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Donations */}
            {campaign.donations.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Donations</h2>
                <div className="space-y-3">
                  {campaign.donations.slice(0, 10).map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${campaign.currentAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  raised of ${campaign.goalAmount.toLocaleString()} goal
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{progressPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{campaign._count.donations}</div>
                    <div className="text-sm text-gray-500">Donations</div>
                  </div>
                </div>
              </div>

              {/* Quick Donate */}
              {campaign.walletAddresses.find(w => w.blockchain === 'Ethereum') && (
                <WalletConnect
                  onDonate={handleDonation}
                  walletAddress={campaign.walletAddresses.find(w => w.blockchain === 'Ethereum')!.address}
                  blockchain="Ethereum"
                />
              )}

              {/* Wallet Addresses */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Addresses</h3>
                <div className="space-y-3">
                  {campaign.walletAddresses.map((wallet) => (
                    <WalletAddress
                      key={wallet.id}
                      address={wallet.address}
                      blockchain={wallet.blockchain}
                    />
                  ))}
                  
                  {/* Auto-generated Solana wallet */}
                  {campaign.solanaWallet && (
                    <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-purple-900 mb-1">
                            Solana (Auto-Generated) 
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              System Managed
                            </span>
                          </div>
                          <div className="text-sm text-purple-700 font-mono break-all">
                            {campaign.solanaWallet.publicKey}
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            Balance: {campaign.solanaWallet.balance.toFixed(4)} SOL
                          </div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(campaign.solanaWallet!.publicKey)}
                          className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    💡 Send crypto directly to the addresses above. Donations will be automatically tracked when the transaction is confirmed.
                  </p>
                </div>
              </div>

              {/* Campaign Creator */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Creator</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{campaign.user.name}</div>
                    {campaign.user.bio && (
                      <div className="text-sm text-gray-500">{campaign.user.bio}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}