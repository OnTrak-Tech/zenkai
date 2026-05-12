// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  alfajores: {
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    escrow: "", // Will be filled after deployment
    verifier: "", // Will be filled after deployment
    treasury: "", // Will be filled after deployment
  },
  celo: {
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a0", // Mainnet cUSD
    escrow: "", // Will be filled after deployment
    verifier: "", // Will be filled after deployment
    treasury: "", // Will be filled after deployment
  }
};

// Environment configuration
export const CONFIG = {
  // Use 'alfajores' for testnet, 'celo' for mainnet
  network: (import.meta.env.VITE_NETWORK || 'alfajores') as 'alfajores' | 'celo',
  serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
};