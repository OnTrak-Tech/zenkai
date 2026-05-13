import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const TopAppBar: React.FC = () => {
  const { balance, isConnected, address } = useWallet();

  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  return (
    <header className="bg-background/90 backdrop-blur-md sticky top-0 z-[60] border-b border-outline-variant/30 flex justify-between items-center px-4 py-2 w-full">
      <div className="flex items-center gap-2">
        {isProfilePage ? (
          <Link to="/lobby" className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </Link>
        ) : (
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-primary/40 p-0.5 hover:scale-105 transition-transform cursor-pointer">
            <img 
              alt="Profile" 
              className="w-full h-full object-cover rounded" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkMRYmvUhF-_eQDx7pqC8gCuVHQ9k6m5l7AFYdNz22vmcDukgs7xCpY6uAPn1RyACbCK9C1J0KqGouQUBF5gG6ym_lxAdfK29fIV_h0MEzZSduUxAHCX8nn5LY8-I7P5JZBPSQXA7oJPDfkciTIr1dc9C3itA6RJwV_90KPHBaVpHJj3ZPDc2EBXLK0p9mk1ziNQsxACTiZznFiaURRibsU6DFJ_tPZa2l0u7j3WhvW-4T4DK07Cc6G2Gmm8qzc7pEACkMlrzbt6G"
            />
          </Link>
        )}
        <div>
          <h1 className="font-headline font-black text-xl text-primary uppercase tracking-tighter leading-none drop-shadow-[0_0_5px_rgba(255,45,120,0.8)]">ZENKAI</h1>
          {isConnected && address && (
            <p className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">
              {address.slice(0, 4)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <div className="bg-surface-container-high px-3 py-1 rounded-full border border-secondary/30 flex items-center gap-2 shadow-[0_0_10px_rgba(45,255,180,0.15)]">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-headline font-bold text-secondary text-sm neon-cyan-glow">
            {isConnected ? balance : '---'}
          </span>
          <span className="font-label text-[8px] text-secondary/70 uppercase tracking-widest">cUSD</span>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
