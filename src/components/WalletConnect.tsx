'use client'

import { useState } from 'react'
import { BrowserProvider } from 'ethers'

interface WalletConnectProps {
  onDonate: (amount: string, txHash: string, address: string) => Promise<void>
  walletAddress: string
  blockchain: string
}

export default function WalletConnect({ onDonate, walletAddress, blockchain }: WalletConnectProps) {
  const [amount, setAmount] = useState('')
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new BrowserProvider((window as any).ethereum)
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        setConnected(true)
        setAccount(address)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask to use this feature')
    }
  }

  const handleDonate = async () => {
    if (!amount || !connected || blockchain !== 'Ethereum') {
      return
    }

    setLoading(true)
    
    try {
      const provider = new BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      
      // Convert amount to wei (assuming ETH)
      const amountInWei = (parseFloat(amount) * 1e18).toString()
      
      const transaction = await signer.sendTransaction({
        to: walletAddress,
        value: amountInWei
      })
      
      await transaction.wait()
      
      // Call the onDonate callback with transaction details
      await onDonate(amount, transaction.hash, account)
      
      setAmount('')
      alert('Donation sent successfully!')
    } catch (error) {
      console.error('Donation failed:', error)
      alert('Donation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Donate (Ethereum)</h3>
      
      {!connected ? (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.01"
            />
          </div>
          
          <button
            onClick={handleDonate}
            disabled={!amount || loading || blockchain !== 'Ethereum'}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md"
          >
            {loading ? 'Processing...' : 'Donate Now'}
          </button>
          
          {blockchain !== 'Ethereum' && (
            <p className="text-xs text-amber-600">
              ⚠️ Quick donate only works for Ethereum addresses. For other blockchains, please send manually.
            </p>
          )}
        </div>
      )}
    </div>
  )
}