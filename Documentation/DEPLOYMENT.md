# Zenkai Deployment Guide

This guide will help you deploy Zenkai to Celo network and Vercel.

## Prerequisites

1. **Node.js** (v18+)
2. **Celo-compatible wallet** (MetaMask or MiniPay)
3. **Testnet funds** for deployment
4. **Vercel account** for hosting

## Quick Start

### 1. Environment Setup

```bash
# Copy environment files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit client/.env with your settings
# Get WalletConnect Project ID from https://cloud.walletconnect.com/
```

### 2. Get Testnet Funds

- Visit [Celo Faucet](https://faucet.celo.org/alfajores)
- Fund your wallet with test CELO and cUSD

### 3. Deploy Everything

```bash
# Set your private key (NEVER commit this!)
export PRIVATE_KEY="your_private_key_here"

# Deploy contracts and update client config
node scripts/deploy-all.js alfajores
```

### 4. Deploy Frontend & Backend

```bash
# Deploy server
cd server
npx vercel --prod

# Copy the server URL and update client/.env
# VITE_SERVER_URL=https://your-server.vercel.app

# Deploy client
cd ../client
npx vercel --prod
```

## Manual Deployment

### Smart Contracts Only

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network alfajores
```

### Update Client Config Manually

```bash
node scripts/update-contracts.js alfajores <escrow_address> <verifier_address> <treasury_address>
```

## Environment Variables

### Client (.env)
- `VITE_NETWORK`: `alfajores` or `celo`
- `VITE_SERVER_URL`: Your deployed server URL
- `VITE_WALLETCONNECT_PROJECT_ID`: From WalletConnect Cloud

### Server (.env)
- `PORT`: Server port (default: 3001)
- Contract addresses are auto-updated by deploy script

## Networks

- **Alfajores**: Celo testnet
- **Celo**: Celo mainnet

## Troubleshooting

- **Deployment fails**: Check your PRIVATE_KEY and wallet balance
- **WebSocket issues**: Vercel has limitations - consider Railway or Render for server
- **Contract verification**: Use Celo Explorer to verify contracts

## Security Notes

- Never commit private keys
- Use environment variables for sensitive data
- Test thoroughly on Alfajores before mainnet deployment