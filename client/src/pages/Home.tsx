import React from 'react';
import { useWallet } from '../context/WalletContext';

const Home: React.FC = () => {
  const { connect, isConnected, address } = useWallet();

  return (
    <div className="bg-background text-on-background font-body overflow-hidden h-[100dvh] flex flex-col relative grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none z-0"></div>
      
      {/* Top Bar (Arcade Header) */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4 w-full">
        <h1 className="font-display font-black text-2xl text-primary uppercase tracking-tighter drop-shadow-[0_0_8px_rgba(255,45,120,0.8)] leading-none">ZENKAI</h1>
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <div className="px-3 py-1 bg-surface-container rounded-full border border-primary/30">
              <span className="font-label text-[10px] text-primary uppercase tracking-widest">{address.slice(0, 4)}...{address.slice(-4)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-secondary/30 bg-secondary/5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[8px] font-label text-secondary uppercase tracking-[0.2em]">Celo Mainnet</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content (Center) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <h2 className="text-5xl md:text-7xl font-display font-extrabold text-on-surface leading-tight tracking-tighter uppercase mb-2 text-center">
          <span className="text-primary neon-text-glow">ZENKAI</span> ARENA
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm text-center mb-16 font-body font-light">
          Provably fair, high-stakes 1v1 matches.
        </p>

        <button 
          onClick={connect}
          className="group relative w-full max-w-[280px] aspect-square rounded-full bg-primary/10 border-2 border-primary flex flex-col items-center justify-center overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,45,120,0.3)] hover:shadow-[0_0_50px_rgba(255,45,120,0.6)]"
        >
          <div className="absolute inset-0 bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
          <span className="material-symbols-outlined text-primary text-6xl mb-2 drop-shadow-[0_0_10px_rgba(255,45,120,0.8)] relative z-10">power_settings_new</span>
          <span className="font-display font-black text-xl text-primary uppercase tracking-widest relative z-10">
            {isConnected ? 'ENTER ARENA' : 'CONNECT'}
          </span>
        </button>
      </main>

      {/* Bottom Nav */}
      <nav className="relative z-10 w-full p-6 pb-8 flex justify-center gap-8 border-t border-outline-variant/30 bg-surface/80 backdrop-blur-md">
        {['Leaderboard', 'History', 'Docs'].map((link) => (
          <button key={link} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-secondary transition-colors">
             <span className="material-symbols-outlined text-xl">
               {link === 'Leaderboard' ? 'emoji_events' : link === 'History' ? 'history' : 'description'}
             </span>
             <span className="font-label text-[8px] uppercase tracking-widest">{link}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Home;
