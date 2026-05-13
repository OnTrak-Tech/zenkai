import React from 'react';
import { useWallet } from '../context/WalletContext';

const TopAppBar: React.FC = () => {
  const { balance, isConnected, address } = useWallet();

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-[60] border-b border-outline-variant/30 shadow-[inset_0_0_12px_rgba(255,45,120,0.1)] flex justify-between items-center px-6 py-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/40 p-0.5">
          <img 
            alt="Profile" 
            className="w-full h-full object-cover rounded" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkMRYmvUhF-_eQDx7pqC8gCuVHQ9k6m5l7AFYdNz22vmcDukgs7xCpY6uAPn1RyACbCK9C1J0KqGouQUBF5gG6ym_lxAdfK29fIV_h0MEzZSduUxAHCX8nn5LY8-I7P5JZBPSQXA7oJPDfkciTIr1dc9C3itA6RJwV_90KPHBaVpHJj3ZPDc2EBXLK0p9mk1ziNQsxACTiZznFiaURRibsU6DFJ_tPZa2l0u7j3WhvW-4T4DK07Cc6G2Gmm8qzc7pEACkMlrzbt6G"
          />
        </div>
        <div>
          <h1 className="font-headline font-black text-2xl text-primary uppercase tracking-tighter drop-shadow-[0_0_8px_rgba(255,45,120,0.8)] leading-none">ZENKAI</h1>
          {isConnected && address && (
            <p className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest mt-1">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Balance</span>
          <span className="font-headline font-bold text-secondary flex items-center gap-1 neon-glow-text">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            {isConnected ? balance : '---'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
