import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http, 
  parseAbi, 
  formatEther,
  type Address
} from 'viem';
import { celo, celoSepolia } from 'viem/chains';
import { CONFIG, CONTRACT_ADDRESSES } from '../config';

interface WalletContextType {
  address: Address | null;
  balance: string;
  isConnected: boolean;
  isMiniPay: boolean;
  connect: () => Promise<void>;
  signTransaction: (to: Address, data: `0x${string}`, value?: bigint) => Promise<`0x${string}`>;
  refreshBalance: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const CUSD_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<string>("0.00");
  const [isMiniPay, setIsMiniPay] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const chain = CONFIG.network === 'celo' ? celo : celoSepolia;
  const cUSDAddress = CONTRACT_ADDRESSES[CONFIG.network].cUSD as Address;

  const publicClient = createPublicClient({
    chain,
    transport: http()
  });

  const checkMiniPay = () => {
    // MiniPay injects a provider that can be detected
    const provider = (window as any).ethereum;
    if (provider && provider.isMiniPay) {
      setIsMiniPay(true);
      return true;
    }
    return false;
  };

  const refreshBalance = async () => {
    if (!address) return;
    try {
      const balanceData = await publicClient.readContract({
        address: cUSDAddress,
        abi: CUSD_ABI,
        functionName: 'balanceOf',
        args: [address]
      } as any);
      setBalance(Number(formatEther(balanceData as bigint)).toFixed(2));
    } catch (error) {
      console.error("Error refreshing balance:", error);
    }
  };

  const connect = async () => {
    const provider = (window as any).ethereum;
    if (!provider) {
      alert("No Ethereum provider found. Please open this app inside MiniPay or a supported wallet.");
      return;
    }

    try {
      console.log("Connecting to wallet...");
      
      const chainIdHex = `0x${chain.id.toString(16)}`;
      
      // Step 1: Ensure wallet is on the right chain
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // If the chain is not set up in the wallet (e.g. Sepolia on MiniPay/MetaMask)
        if (switchError.code === 4902 || switchError?.message?.includes('not set up') || switchError?.message?.includes('Unrecognized')) {
          console.log("Chain not found in wallet, attempting to add it...");
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [...chain.rpcUrls.default.http],
                  blockExplorerUrls: chain.blockExplorers ? [chain.blockExplorers.default.url] : [],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add chain to wallet:", addError);
          }
        }
      }

      // Step 2: Request accounts
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        checkMiniPay();
        console.log("Connected to:", accounts[0]);
      }
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Failed to connect wallet. See console for details.");
    }
  };

  const disconnect = async () => {
    setAddress(null);
    setIsConnected(false);
    setBalance("0.00");
    console.log("Disconnected wallet.");
  };

  const signTransaction = async (to: Address, data: `0x${string}`, value: bigint = 0n) => {
    const provider = (window as any).ethereum;
    if (!provider || !address) throw new Error("Wallet not connected");

    const walletClient = createWalletClient({
      account: address,
      chain,
      transport: custom(provider)
    });

    return await walletClient.sendTransaction({
      to,
      data,
      value
    } as any);
  };

  useEffect(() => {
    const init = async () => {
      const provider = (window as any).ethereum;
      if (provider) {
        checkMiniPay();
        try {
          // Check if already connected without prompting
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            console.log("Auto-connected to:", accounts[0]);
          }
        } catch (e) {
          console.warn("Auto-connect failed", e);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (address) {
      refreshBalance();
      // Polling for balance updates
      const interval = setInterval(refreshBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [address]);

  return (
    <WalletContext.Provider value={{ 
      address, 
      balance, 
      isConnected, 
      isMiniPay, 
      connect, 
      signTransaction,
      refreshBalance,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
