import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import { prisma } from './prisma'

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'

export class SolanaWalletService {
  private connection: Connection

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed')
  }

  generateWallet() {
    const keypair = Keypair.generate()
    return {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: bs58.encode(keypair.secretKey)
    }
  }

  async createCampaignWallet(campaignId: string) {
    const wallet = this.generateWallet()
    
    const solanaWallet = await prisma.solanaWallet.create({
      data: {
        campaignId,
        publicKey: wallet.publicKey,
        secretKey: wallet.secretKey,
        balance: 0
      }
    })

    return solanaWallet
  }

  async getWalletBalance(publicKey: string): Promise<number> {
    try {
      const balance = await this.connection.getBalance(new PublicKey(publicKey))
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error fetching Solana balance:', error)
      return 0
    }
  }

  async updateWalletBalance(campaignId: string) {
    const solanaWallet = await prisma.solanaWallet.findUnique({
      where: { campaignId }
    })

    if (!solanaWallet) {
      throw new Error('Solana wallet not found')
    }

    const balance = await this.getWalletBalance(solanaWallet.publicKey)
    
    await prisma.solanaWallet.update({
      where: { campaignId },
      data: { balance }
    })

    return balance
  }

  async getAllWalletBalances() {
    const solanaWallets = await prisma.solanaWallet.findMany({
      include: {
        campaign: {
          select: { title: true, id: true }
        }
      }
    })

    const balances = await Promise.all(
      solanaWallets.map(async (wallet) => {
        const balance = await this.getWalletBalance(wallet.publicKey)
        
        // Update balance in database
        await prisma.solanaWallet.update({
          where: { id: wallet.id },
          data: { balance }
        })

        return {
          ...wallet,
          balance
        }
      })
    )

    return balances
  }
}

export const solanaService = new SolanaWalletService()