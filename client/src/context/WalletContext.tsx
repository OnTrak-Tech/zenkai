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
      const walletClient = createWalletClient({
        chain,
        transport: custom(provider)
      });

      const [account] = await walletClient.requestAddresses();
      setAddress(account);
      setIsConnected(true);
      checkMiniPay();
    } catch (error) {
      console.error("Connection failed:", error);
    }
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
          const walletClient = createWalletClient({
            chain,
            transport: custom(provider)
          });
          const accounts = await walletClient.getAddresses();
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
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
      refreshBalance 
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
