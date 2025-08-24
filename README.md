# CryptoDonatios - Crypto Donation Platform

A decentralized platform for crypto donations and fundraising, built with Next.js, TypeScript, and Prisma.

## Features

✅ **User Authentication**
- User registration and login
- JWT-based authentication
- Secure password hashing

✅ **Campaign Management**
- Create campaigns with descriptions and goals
- Multiple wallet addresses per campaign
- Support for various blockchains (Ethereum, Bitcoin, Polygon, BSC, Solana, Cardano, Avalanche)
- Campaign progress tracking
- **Auto-generated Solana wallets for each campaign**

✅ **Donation System**
- Direct wallet-to-wallet donations
- Automatic admin fee deduction (0.5%)
- Real-time donation tracking
- MetaMask integration for Ethereum donations
- **Solana balance tracking and monitoring**

✅ **Admin System**
- **Admin user authentication**
- **Private admin dashboard**
- **View Solana wallet secrets and balances**
- **Campaign fund monitoring**

✅ **Modern UI/UX**
- AngelList-inspired design
- Responsive layout
- Real-time progress bars
- Campaign browsing and discovery

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Crypto**: Ethers.js for Web3 integration, Solana Web3.js for Solana
- **Authentication**: JWT with bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension (for crypto donations)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Update the `.env` file with your settings:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-jwt-secret-key-change-this-in-production"
   ADMIN_WALLET_ADDRESS="your-admin-wallet-address"
   ADMIN_FEE_PERCENTAGE=0.5
   ADMIN_EMAIL="admin@cryptodonatios.com"
   ADMIN_PASSWORD="admin123"
   SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Fundraisers

1. **Create an account** - Register with your email and password
2. **Create a campaign** - Click "Create Campaign" and fill in:
   - Campaign title and description
   - Funding goal amount (in USD)
   - Image URL (optional)
   - Wallet addresses for different blockchains
3. **Share your campaign** - Copy the campaign URL and share it
4. **Track donations** - Monitor real-time progress and donations

### For Donors

1. **Browse campaigns** - View all active campaigns on the homepage
2. **Select a campaign** - Click on any campaign to view details
3. **Donate crypto** - Two options:
   - **Quick donate** (Ethereum only): Connect MetaMask and donate directly
   - **Manual donation**: Copy wallet addresses and send crypto manually
4. **Track impact** - See your donation reflected in campaign progress

### For Administrators

1. **Admin user created** - Admin account is already initialized:
   - Email: `admin@cryptodonatios.com`
   - Password: `admin123`
2. **Access admin dashboard** - Navigate to `/admin/simple` to view the working admin dashboard
3. **Monitor funds** - View wallet balances, public keys, and secret keys (admin only)
4. **Refresh balances** - Click "Refresh Balances" to update Solana wallet balances

**Note**: Due to Node.js v19 compatibility issues, use `/admin/simple` for the working admin dashboard.

**Important**: Each campaign automatically gets a unique Solana wallet that only admins can see the private keys for.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign (authenticated)
- `GET /api/campaigns/[id]` - Get campaign details

### Donations
- `POST /api/donations` - Record a donation

### Admin (Protected)
- `GET /api/admin/wallets` - Get all Solana wallets with secrets (admin only)
- `POST /api/admin/init` - Initialize admin user

## Supported Blockchains

- Ethereum (with MetaMask integration)
- Bitcoin
- Polygon
- Binance Smart Chain (BSC)
- Solana
- Cardano
- Avalanche

## Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── campaigns/         # Campaign pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   └── prisma.ts         # Database client
└── prisma/
    └── schema.prisma     # Database schema
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open database viewer
- `npx prisma db push` - Push schema changes

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection protection with Prisma
- Admin fee system prevents fee evasion

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
