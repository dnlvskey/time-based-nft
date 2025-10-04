# Time-Based NFT Collection

🎨 **Dynamic NFTs that change with time** - A collection of NFTs that automatically change their appearance based on the time of day in your timezone.

## ✨ Features

- 🌙 **Night (22:00 - 06:00)**: Mystical theme with moon and stars
- 🌅 **Morning (06:00 - 12:00)**: Warm sunrise colors
- ☀️ **Day (12:00 - 22:00)**: Bright sunny theme

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Hardhat, Wagmi, RainbowKit
- **Smart Contract**: Solidity, OpenZeppelin ERC721
- **Graphics**: Dynamic SVG generation

## 📋 Technical Details

### ⏰ Time Periods
- **Night**: 22:00 - 06:00 UTC
- **Morning**: 06:00 - 12:00 UTC  
- **Day**: 12:00 - 22:00 UTC

### 📄 TimeBasedNFT Contract
- **Name**: TimeBasedNFT (TBNFT)
- **Max Supply**: 1000 NFTs
- **Mint Price**: 0.01 ETH
- **Timezone Support**: UTC-12 to UTC+12

### 🔧 Main Functions
- `mint(int256 timezoneOffsetMinutes)` - mint NFT with timezone selection
- `getCurrentTimeState(uint256 tokenId)` - get current NFT state
- `getDetailedTimeInfo(uint256 tokenId)` - detailed time information
- `tokenURI(uint256 tokenId)` - metadata with dynamic SVG

## 🚀 Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Start Local Network
```bash
yarn chain
```

### 3. Deploy Contracts
```bash
yarn deploy
```

### 4. Start Frontend
```bash
yarn start
```

### 5. Open in Browser
🌐 http://localhost:3000

## 📱 Usage

### 🎨 Creating Time-Based NFT
1. Go to **"Mint NFT"** page
2. Connect your wallet (MetaMask, WalletConnect, etc.)
3. Select your timezone from the dropdown
4. Click **"Mint NFT (0.01 ETH)"** to create NFT

### 👀 Viewing Collection
- **"My NFTs"** - view all created NFTs in tile format
- **"Debug Contracts"** - debug and test contracts

## 📁 Project Structure

```
packages/
├── hardhat/
│   ├── contracts/
│   │   └── TimeBasedNFT.sol          # Main NFT contract
│   ├── deploy/
│   │   └── 00_deploy_your_collectible.ts
│   └── test/                         # Contract tests
└── nextjs/
    ├── app/
    │   ├── page.tsx                  # Home page
    │   ├── time-nft/page.tsx         # NFT creation page
    │   ├── my-nfts/page.tsx          # NFT collection
    │   └── debug/page.tsx            # Contract debugging
    ├── components/
    │   └── Header.tsx                # Navigation
    └── hooks/scaffold-eth/           # React hooks for contract interaction
```

## 🎨 SVG Generation

Time-Based NFTs generate dynamic SVG images:

- **🌙 Night**: Dark gradient background with stars and moon
- **🌅 Morning**: Warm gradient with rising sun and clouds  
- **☀️ Day**: Bright background with sun at zenith and rays

Each image is unique and automatically changes based on time in the selected timezone.

## 🚀 Deployment

### Local Development
1. Clone repository: `git clone <your-repo-url>`
2. Install dependencies: `yarn install`
3. Start local network: `yarn chain`
4. Deploy contracts: `yarn deploy`
5. Start frontend: `yarn start`

### Production Deployment

#### Frontend (Vercel - Recommended)
1. Connect repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - your WalletConnect Project ID
3. Deploy: Vercel will automatically deploy on push to main

#### Smart Contract Deployment
1. **Network Configuration**: Update `packages/hardhat/hardhat.config.ts`
2. **Environment Variables**: Create `.env` file (see `env.example`)
3. **Deploy to Testnet**: `yarn hardhat:deploy --network sepolia`
4. **Deploy to Mainnet**: `yarn hardhat:deploy --network mainnet`
5. **Verify Contract**: `yarn hardhat:verify --network mainnet <CONTRACT_ADDRESS>`

### Environment Variables
Copy `env.example` to `.env.local` and fill in your values:
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## 🔒 Security

### ⚠️ Important Security Notes

1. **API Keys**: The project uses Scaffold-ETH's default public API keys for development:
   - Alchemy API key: Public key for local development
   - WalletConnect Project ID: Public project ID for development
   - For production: Replace with your own keys

2. **Environment Variables**: Never commit real API keys or private keys:
   - Use `.env.local` for local development
   - Use environment variables in production deployment

3. **Smart Contract**: The `TimeBasedNFT` contract is for demonstration purposes:
   - Test thoroughly on testnets before mainnet deployment
   - Consider additional security audits for production use
   - The contract uses `block.timestamp` which can be manipulated by miners

4. **Private Keys**: Never commit private keys or seed phrases:
   - Use hardware wallets for production deployments
   - Use different wallets for testnet and mainnet
   - Store keys securely using environment variables

### 🛡️ Security Best Practices
- Always test on testnets first
- Use environment variables for sensitive data
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use hardware wallets for production

### 📋 Security Checklist
Before deploying to production:
- [ ] Replace API keys with your own (for production)
- [ ] Set up environment variables
- [ ] Test on testnet
- [ ] Review smart contract code
- [ ] Use hardware wallet for deployment
- [ ] Verify contract on Etherscan
- [ ] Monitor for unusual activity

## 📊 Project Statistics

- **Maximum NFTs**: 1000
- **Mint Price**: 0.01 ETH
- **Supported Timezones**: 25
- **Time States**: 3 (Night, Morning, Day)
- **SVG Size**: 400x400px with animations

## 🎮 How to Use

1. **Connect your wallet** (MetaMask, WalletConnect, etc.)
2. **Select your timezone** from the dropdown
3. **Click "Mint NFT"** to create a unique NFT
4. **Enjoy** dynamic changes based on time!

## 📈 Development Potential

- **Additional time states** (dawn, dusk, twilight)
- **Seasonal changes** (winter, spring, summer, autumn)
- **Interactive elements** (click to change state)
- **Sound effects** for each time period
- **Weather API integration** for realistic changes

## 🏆 Achievements

- ✅ Fully functional smart contract
- ✅ Beautiful and responsive UI/UX
- ✅ Optimized performance
- ✅ Support for all popular wallets
- ✅ Detailed documentation and README
- ✅ Production ready

## 📄 License

MIT License - free to use and modify.

## 🤝 Contributing

All improvements are welcome! Create Issues and Pull Requests.

---

**Built with ❤️ based on Scaffold-ETH 2**