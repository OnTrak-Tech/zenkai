// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  celoSepolia: {
    cUSD: "0x954cBA141f21760751E3065ACC250c38fb9f5e61",
    escrow: "0x1B0c52BaF90c57b8604D08EbA9CB36e3db25E4DD",
    verifier: "0xac732F3cdc457af934Dd03D04132119c0505fAe3",
    treasury: "0x43D0056A8f1C6a1Dcf3e48f7A8b486F3D00eae83",
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
  // Use 'celoSepolia' for testnet, 'celo' for mainnet
  network: (import.meta.env.VITE_NETWORK || 'celoSepolia') as 'celoSepolia' | 'celo',
  serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
};