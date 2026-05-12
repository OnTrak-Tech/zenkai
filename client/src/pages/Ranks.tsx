import React from 'react';

const Ranks: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <header className="text-center space-y-2">
        <h2 className="font-headline text-3xl font-black text-on-surface uppercase tracking-tight">Global Leaderboard</h2>
        <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">The elite proof-of-skill ledger</p>
      </header>

      {/* Top 3 Podiums */}
      <section className="flex justify-center items-end gap-2 pt-10 pb-4">
        {/* Rank 2 */}
        <div className="flex flex-col items-center gap-4 w-1/3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-secondary/50 overflow-hidden bg-surface-container shadow-[0_0_15px_rgba(0,255,204,0.2)]">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuJBJRHi4hcfm9k5dduigvBRVrSw15-gr3TbsRd_CoLfEwiYwLZGviC68P1C0I2ZegKve7MLRdd9BLebK3MGbzckSiC5eWvskySzejLxpxnatKdjR1dtqTsKepVDS019dZe62edjXuD5PSTRE7Af2qBU4ZGt7PKr02r14aT2tdqJSp0HA_c7IYQugq8ZXBg_TCqZCLk26oFQyP2QemjfDIpV5GchQhdHp_WUdm03HxXrqp6nhjJ9CgZW3zSwEsZacuYhqN8Zfk4W3BL" alt="Rank 2" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-display font-black text-xs px-2 py-0.5 rounded-full">2</div>
          </div>
          <div className="h-24 w-full bg-surface-container rounded-t-xl border-x border-t border-outline-variant/30 flex flex-col items-center justify-center p-2 text-center">
            <p className="font-label text-[10px] text-on-surface font-bold truncate w-full">ZERO_K_VOID</p>
            <p className="font-headline font-bold text-secondary text-sm">3.1k</p>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center gap-4 w-1/3 scale-110 -translate-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary overflow-hidden bg-surface-container shadow-[0_0_25px_rgba(255,45,120,0.4)]">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_pKEXMcPzPXttBf7p77ZWmD-u-1uyOGdbOrvLiLwwfnmofKGu11DnIaz6AQeKVVoixvqKRyXa9B20t38iE1DIEPmae0A-1Rxz66WzRUwUAEMRPLCAoImEYLQblYQMF7qzlTvVr488CCphCYXKiqzy4AsWAumCIfGnR0yaoWLe4x8-mMUkI-cX77u4vWV0RVlGUL9vkbM-U88KORLJR7FcDk1LLT96K2vSQnDaecxhV-l7-96ltIpcuRWINca2ecERH_1blUO5O2SA" alt="Rank 1" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-display font-black text-sm px-3 py-0.5 rounded-full shadow-[0_0_10px_#ff2d78]">1</div>
          </div>
          <div className="h-32 w-full bg-primary/10 rounded-t-xl border-x border-t border-primary/40 flex flex-col items-center justify-center p-2 text-center">
            <p className="font-label text-[10px] text-primary font-black truncate w-full">CYBER_PUNK_99</p>
            <p className="font-headline font-bold text-primary text-base">4.2k</p>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center gap-4 w-1/3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-tertiary/50 overflow-hidden bg-surface-container shadow-[0_0_15px_rgba(255,224,74,0.2)]">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-PAWCrxtrQfJMf7ivDisMcz-s8TirTeSIkBePwAYnY_h7JezRUAR3Ct8nVIsobmgf7gbck8mCe7oMlZViEl8V2cEuggeTRJlhikkr65aSLfRrqjyWihLgDiTqllsaoQbUh2LfyAqi7YndoD4NP6F70sBTKbiEsv6OyUPbr2dC4yiMW6hecLBNBfuacsIXl9Da1j_Vqextquy2qEd6d6xlP0GLY9T3d-5yiWjBeKsRl-ShbwOyGUgXjGJlMcwS4qFmKSZ44EYFd-P2" alt="Rank 3" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary font-display font-black text-xs px-2 py-0.5 rounded-full">3</div>
          </div>
          <div className="h-20 w-full bg-surface-container rounded-t-xl border-x border-t border-outline-variant/30 flex flex-col items-center justify-center p-2 text-center">
            <p className="font-label text-[10px] text-on-surface font-bold truncate w-full">NOIR_PROTOCOL</p>
            <p className="font-headline font-bold text-tertiary text-sm">2.8k</p>
          </div>
        </div>
      </section>

      {/* Leaderboard List */}
      <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
        {[
          { rank: '04', name: 'GLITCH_BIT', score: '2.5k', change: 'up' },
          { rank: '05', name: 'DOJO_MASTER', score: '2.4k', change: 'down' },
          { rank: '06', name: 'NEON_SAMURAI', score: '2.1k', change: 'up' },
          { rank: '07', name: 'BIT_RAIDER', score: '1.9k', change: 'same' }
        ].map((player, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-on-surface-variant w-6 text-sm">{player.rank}</span>
              <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              </div>
              <p className="font-label text-xs text-on-surface font-bold">{player.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-headline font-bold text-on-surface text-sm">{player.score}</p>
              <span className={`material-symbols-outlined text-sm ${player.change === 'up' ? 'text-secondary' : player.change === 'down' ? 'text-primary' : 'text-on-surface-variant'}`}>
                {player.change === 'up' ? 'trending_up' : player.change === 'down' ? 'trending_down' : 'horizontal_rule'}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Ranks;
