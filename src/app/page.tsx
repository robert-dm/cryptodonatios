'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Users, Clock } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  imageUrl?: string
  createdAt: string
  user: {
    name: string
    avatar?: string
  }
  _count: {
    donations: number
  }
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progressPercentage = (campaign.currentAmount / campaign.goalAmount) * 100

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        {campaign.imageUrl && (
          <div className="h-48 bg-gray-200 overflow-hidden">
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{campaign.description}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>${campaign.currentAmount.toLocaleString()} raised</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="text-sm text-gray-500 mt-1">
              of ${campaign.goalAmount.toLocaleString()} goal
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {campaign._count.donations} donations
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              by {campaign.user.name}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns')
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data.campaigns)
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Fund dreams with <span className="text-blue-600">crypto</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              CryptoDonatios is a decentralized platform where people can share their needs and receive crypto donations from the community.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/auth/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="#campaigns" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Browse campaigns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div id="campaigns" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Active Campaigns</h2>
            <p className="mt-2 text-gray-600">Support meaningful causes and make a difference</p>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating the first campaign.</p>
              <div className="mt-6">
                <Link href="/campaigns/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Create Campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
