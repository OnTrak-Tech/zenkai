import React from 'react';

const Arena: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <header className="text-center space-y-2">
        <h2 className="font-headline text-3xl font-black text-on-surface uppercase tracking-tight">Matchmaking Arena</h2>
        <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Select your stakes and enter the grid</p>
      </header>

      {/* Stake Tiers */}
      <section className="grid grid-cols-1 gap-6">
        {[
          { title: 'Practice', stake: 'Free', reward: 'XP Only', color: 'border-outline', icon: 'school' },
          { title: 'Standard', stake: '1.00 cUSD', reward: '1.90 cUSD', color: 'border-secondary/30 shadow-[0_0_15px_rgba(0,255,204,0.1)]', icon: 'payments', active: true },
          { title: 'Pro', stake: '10.00 cUSD', reward: '19.00 cUSD', color: 'border-primary/30 shadow-[0_0_15px_rgba(255,45,120,0.1)]', icon: 'military_tech' },
          { title: 'Elite', stake: '50.00 cUSD', reward: '95.00 cUSD', color: 'border-tertiary/30 shadow-[0_0_15px_rgba(255,224,74,0.1)]', icon: 'diamond' }
        ].map((tier, i) => (
          <div key={i} className={`surface-container rounded-2xl p-6 border ${tier.color} relative group bg-surface-container overflow-hidden`}>
            {tier.active && <div className="absolute top-0 right-0 bg-secondary text-on-secondary font-label text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">Popular</div>}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface">{tier.icon}</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-xl text-on-surface uppercase">{tier.title}</h4>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Stake: {tier.stake}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-[10px] text-on-surface-variant uppercase mb-1">Potential Win</p>
                <p className="font-headline font-bold text-secondary text-lg">{tier.reward}</p>
              </div>
            </div>
            <button className={`w-full py-3 rounded-lg font-headline font-bold uppercase tracking-widest transition-all ${tier.active ? 'bg-secondary text-on-secondary hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,255,204,0.3)]' : 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant'}`}>
              Select Tier
            </button>
          </div>
        ))}
      </section>

      {/* Arena Stats */}
      <section className="surface-container-low rounded-xl p-4 border border-outline-variant/20 flex justify-around items-center bg-surface-container-low">
        <div className="text-center">
          <p className="font-headline font-bold text-on-surface">1,248</p>
          <p className="font-label text-[10px] text-on-surface-variant uppercase">Players Online</p>
        </div>
        <div className="w-[1px] h-8 bg-outline-variant/30"></div>
        <div className="text-center">
          <p className="font-headline font-bold text-primary">12ms</p>
          <p className="font-label text-[10px] text-on-surface-variant uppercase">Network Latency</p>
        </div>
        <div className="w-[1px] h-8 bg-outline-variant/30"></div>
        <div className="text-center">
          <p className="font-headline font-bold text-secondary">98%</p>
          <p className="font-label text-[10px] text-on-surface-variant uppercase">Match Success</p>
        </div>
      </section>
    </div>
  );
};

export default Arena;
