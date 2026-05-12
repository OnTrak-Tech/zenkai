import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body overflow-x-hidden">
      {/* TopNavBar for Landing Page */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-primary/30 shadow-[0_0_15px_rgba(255,45,120,0.15)]">
        <div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-display font-black text-primary drop-shadow-[0_0_8px_rgba(255,45,120,0.6)] uppercase tracking-widest">ZENKAI</span>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-on-surface-variant font-label hover:text-secondary transition-colors uppercase tracking-widest" href="#arena">Arena</a>
              <a className="text-on-surface-variant font-label hover:text-secondary transition-colors uppercase tracking-widest" href="#ranks">Ranks</a>
              <a className="text-on-surface-variant font-label hover:text-secondary transition-colors uppercase tracking-widest" href="#">Docs</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="active:scale-95 transition-transform duration-200 font-label border border-primary text-primary px-6 py-2 uppercase tracking-tighter hover:bg-primary/10 neon-border-glow">
              Connect Wallet
            </button>
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"></div>
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-secondary/30 bg-secondary/5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[10px] font-label text-secondary uppercase tracking-[0.2em]">Celo Mainnet Live</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold text-on-surface leading-tight tracking-tighter uppercase mb-6">
            THE FIRST <span className="text-primary neon-text-glow">ZK-POWERED</span> GAMING ARENA
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-body font-light">
            Provably fair, high-stakes 1v1 matches. Zero-knowledge anti-cheat verified on Celo.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button className="group relative px-10 py-4 bg-primary text-on-primary font-display font-bold uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,45,120,0.5)]">
              <span className="relative z-10">Enter the Grid</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </button>
            <button className="px-10 py-4 border border-outline text-on-surface font-display font-bold uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all">
              Read Whitepaper
            </button>
          </div>
        </div>
        <div className="mt-20 w-full max-w-6xl aspect-video rounded-xl overflow-hidden border border-primary/20 bg-surface-container shadow-2xl relative">
          <img className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxY6V9N9AfW5I1oPmyfwH4Y1bI2uj6LOT0T2-a9VdzPRDcgoqqHSgGKDWieTYIKH1aeG4YSJqSNNrNoLEev6Bc4fo5Q6brqcvdwESHakOLEATFcKBtcKiB5jB_vqHSlvhCrtBYTGY-8q1KpXuiA5Y8nJ2_9mAQK3MQ08n62wjaTitIAE_vMqHG7MLIrfpJkyGScFlosiilSZZtjnLi1HzAiB8lDWtCRcLBtSRBM5PWyDFJvT_Kf4Kw_haslXanYf3Hr_yidfzR6jfv" alt="Arena Preview" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 rounded-full bg-primary/20 border border-primary backdrop-blur-xl cursor-pointer hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: 'security', title: 'Noir Anti-Cheat', text: 'Explain off-chain gameplay with ZK-logic validation. Every move is mathematically proven without revealing sensitive data.', border: 'hover:border-primary/50', color: 'text-primary' },
            { icon: 'account_balance', title: 'Celo Settlement', text: 'Sub-cent gas fees and instant cUSD payouts. Enjoy lightning-fast transaction finality powered by the Celo blockchain.', border: 'hover:border-secondary/50', color: 'text-secondary' },
            { icon: 'leaderboard', title: 'Proof of Skill', text: 'Build your global rank on an immutable ledger. Your gaming legacy is secured by cryptography, not centralized servers.', border: 'hover:border-tertiary/50', color: 'text-tertiary' }
          ].map((feature, i) => (
            <div key={i} className={`p-8 bg-surface-container border border-outline-variant ${feature.border} transition-colors group`}>
              <span className={`material-symbols-outlined ${feature.color} text-4xl mb-6 block`}>{feature.icon}</span>
              <h3 className="text-2xl font-display font-bold mb-4 uppercase tracking-tight text-on-surface">{feature.title}</h3>
              <p className="text-on-surface-variant font-body leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol Execution Section */}
      <section className="py-32 bg-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-center mb-20 uppercase tracking-tighter">
            Protocol <span className="text-secondary neon-text-glow">Execution</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -translate-y-1/2 z-0"></div>
            {[
              { step: '1', title: 'STAKE', text: 'Both players lock cUSD in escrow safely via smart contract.', color: 'border-primary text-primary neon-border-glow' },
              { step: '2', title: 'PLAY', text: 'Compete in real-time with human timing floors and anti-lag.', color: 'border-secondary text-secondary neon-cyan-glow' },
              { step: '3', title: 'PROVE', text: 'Generate ZK-proofs on your device via Noir WASM workers.', color: 'border-primary text-primary neon-border-glow' },
              { step: '4', title: 'SETTLE', text: 'Automatic payouts upon verification via on-chain relayer.', color: 'border-secondary text-secondary neon-cyan-glow' }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-surface-container-high border-2 ${item.color} flex items-center justify-center font-display font-black text-xl mb-6`}>{item.step}</div>
                <h4 className="text-xl font-label font-bold text-on-surface uppercase mb-3">{item.title}</h4>
                <p className="text-sm text-on-surface-variant">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-display font-bold text-on-surface">ZENKAI</span>
            <p className="font-body text-sm tracking-tight text-on-surface-variant">© 2024 ZENKAI. POWERED BY CELO & NOIR.</p>
          </div>
          <div className="flex gap-8">
            {['Whitepaper', 'Discord', 'Github', 'Support'].map(link => (
              <a key={link} className="text-on-surface-variant font-body text-sm hover:text-tertiary transition-all duration-300" href="#">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
