import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      {/* Hero Profile Section */}
      <section className="relative">
        <div className="surface-container rounded-xl p-6 border border-primary/20 bg-surface-container-low shadow-[0_0_20px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em] mb-1">Rank Standing</p>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">Silver III</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4 shadow-[0_0_8px_#ff2d78]"></div>
                </div>
                <span className="font-label text-[10px] text-primary font-bold">750 / 1000 XP</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em] mb-1">Win Rate</p>
              <span className="font-headline text-2xl font-bold text-secondary neon-glow-text">68.4%</span>
            </div>
          </div>
          <button className="w-full py-4 bg-primary/10 border border-primary text-primary font-headline font-extrabold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-on-primary active:scale-95 transition-all duration-300 shadow-[0_0_16px_rgba(255,45,120,0.3)] group">
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined font-bold group-hover:animate-pulse">sports_esports</span>
              FIND MATCH
            </span>
          </button>
        </div>
      </section>

      {/* Active Challenges */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-tertiary"></span>
            Active Challenges
          </h3>
          <span className="font-label text-[10px] text-on-surface-variant uppercase">3 Pending</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Challenge Card 1 */}
          <div className="surface-container-high rounded-xl p-4 neon-border relative group bg-surface-container-high">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-secondary/30 bg-secondary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">grid_view</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">ZK-Chess</p>
                  <p className="font-label text-[10px] text-on-surface-variant">Match #8291</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-[10px] text-on-surface-variant uppercase">Stake</p>
                <p className="font-headline font-bold text-tertiary">50.00 cUSD</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-variant">
                  <img 
                    alt="Opponent" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp4wBOVKMFsp5vkNsA155rNkrKaAjU3RE31cVY1U9h_8_S5j_uezcQPbdTnG9-slyT6jucs89I3Cdv2bcutCrUx4ts8kjmNmvjK91EERFLPX0oIZlwWUJQp5cjFVxs1zuNnjMiBPsJXJsv3K-hALRfX47vgbDJkw_gdpBzMEGkMunojVAUrMKtOCMUNBWUlpD1fLd5EIcyEtHFF5cnL1LFLO8XMSg03IJca723pEinoT9y32A2P5Lt3xnQKyRc7kYWbjMhLxlxag5O"
                  />
                </div>
                <span className="font-label text-xs text-on-surface">@Crypt0Knight</span>
              </div>
              <button className="px-4 py-1.5 rounded bg-on-surface text-surface font-label text-[10px] font-bold uppercase hover:bg-secondary transition-colors">Accept</button>
            </div>
          </div>

          {/* Challenge Card 2 */}
          <div className="surface-container-high rounded-xl p-4 neon-border-secondary relative group bg-surface-container-high">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-primary/30 bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">directions_car</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">Neon Racers</p>
                  <p className="font-label text-[10px] text-on-surface-variant">Tournament Final</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-[10px] text-on-surface-variant uppercase">Stake</p>
                <p className="font-headline font-bold text-tertiary">200.00 cUSD</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-variant">
                  <img 
                    alt="Opponent" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3G0-koxskOd5XQNLl1vNoPnbwxayV074SAlKJaLpz4IMiorLV9-zcQvf778IEfk0vf4csjXZPlb9gKve0nR5ZvWFm4n7ikoMCNTSQ0KyKM3x3kNAleIjC4K7wjvq1wyvwMAL8NDfZ5EDF4_XpEL0R6egy2sy3LgRmgIaC0PTLKmzST3sz1g25Iyh4Y3SvVo_Hti0-5G-YtX_AhIfzQPsLnKVJEfMFHL_Y9Ef_nUFH1k0q74NH51LHykbbUZWbeW0Mi4HkJSfUMosn"
                  />
                </div>
                <span className="font-label text-xs text-on-surface">@Nitro_Viper</span>
              </div>
              <button className="px-4 py-1.5 rounded border border-secondary text-secondary font-label text-[10px] font-bold uppercase hover:bg-secondary hover:text-on-secondary transition-colors">Waiting...</button>
            </div>
          </div>
        </div>
      </section>

      {/* Arena Highlights */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-secondary"></span>
          Arena Hotspots
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square surface-container rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-end relative overflow-hidden group bg-surface-container">
            <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
            <p className="relative font-headline font-bold text-xs uppercase text-primary mb-1">Weekly Clash</p>
            <p className="relative font-body text-[10px] text-on-surface-variant">Join 2.4k others</p>
          </div>
          <div className="aspect-square surface-container rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-end relative overflow-hidden group bg-surface-container">
            <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
            <p className="relative font-headline font-bold text-xs uppercase text-secondary mb-1">Global Lobby</p>
            <p className="relative font-body text-[10px] text-on-surface-variant">12 Matches Live</p>
          </div>
        </div>
      </section>

      {/* Recent Wins Ticker */}
      <div className="fixed bottom-[84px] left-0 w-full bg-surface-container-highest/60 backdrop-blur-sm py-2 border-y border-primary/10 overflow-hidden z-40">
        <div className="flex whitespace-nowrap gap-12 animate-marquee">
          {[
            { user: '@X_Cipher', amount: '120.0 cUSD', game: 'ZK-Chess' },
            { user: '@DojoMaster', amount: '45.5 cUSD', game: 'Neon Racers' },
            { user: '@Glitch_Bit', amount: '300.0 cUSD', game: 'Tournament' }
          ].map((win, i) => (
            <span key={i} className="font-label text-[10px] text-on-surface-variant uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {win.user} just won <span className="text-secondary font-bold">{win.amount}</span> in {win.game}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
