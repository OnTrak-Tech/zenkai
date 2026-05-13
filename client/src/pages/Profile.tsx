import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { address, disconnect, isConnected } = useWallet();
  const navigate = useNavigate();

  // Settings State (Mock)
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // If not connected, redirect to Home
  React.useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  return (
    <div className="flex flex-col space-y-8 pb-10 max-w-lg mx-auto">
      
      {/* 1. Identity Header */}
      <section className="flex flex-col items-center justify-center text-center pt-4">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_20px_rgba(255,45,120,0.5)]">
             <img 
               alt="Avatar" 
               className="w-full h-full object-cover" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkMRYmvUhF-_eQDx7pqC8gCuVHQ9k6m5l7AFYdNz22vmcDukgs7xCpY6uAPn1RyACbCK9C1J0KqGouQUBF5gG6ym_lxAdfK29fIV_h0MEzZSduUxAHCX8nn5LY8-I7P5JZBPSQXA7oJPDfkciTIr1dc9C3itA6RJwV_90KPHBaVpHJj3ZPDc2EBXLK0p9mk1ziNQsxACTiZznFiaURRibsU6DFJ_tPZa2l0u7j3WhvW-4T4DK07Cc6G2Gmm8qzc7pEACkMlrzbt6G" 
             />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <h2 className="font-headline font-black text-3xl uppercase tracking-tighter text-on-surface">NeonSamurai</h2>
        <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 border border-secondary/30 bg-secondary/10 rounded-full">
           <span className="w-2 h-2 rounded-full bg-secondary"></span>
           <span className="font-label text-[10px] text-secondary uppercase tracking-widest font-bold">
             {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connecting...'}
           </span>
        </div>
      </section>

      {/* 2. Prestige Dashboard */}
      <section className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 flex justify-between items-center shadow-lg">
        <div className="flex flex-col items-center">
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Matches</span>
          <span className="font-headline font-bold text-xl text-on-surface">142</span>
        </div>
        <div className="w-[1px] h-8 bg-outline-variant/50"></div>
        <div className="flex flex-col items-center">
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Win Rate</span>
          <span className="font-headline font-bold text-xl text-secondary neon-cyan-glow">68%</span>
        </div>
        <div className="w-[1px] h-8 bg-outline-variant/50"></div>
        <div className="flex flex-col items-center">
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Net Earnings</span>
          <span className="font-headline font-bold text-xl text-primary neon-text-glow">+450</span>
        </div>
      </section>

      {/* 3. Settings */}
      <section className="space-y-4">
        <h3 className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em] px-2">Game Settings</h3>
        <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">music_note</span>
              <span className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Background Music</span>
            </div>
            <button 
              onClick={() => setBgmEnabled(!bgmEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${bgmEnabled ? 'bg-secondary' : 'bg-surface-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-background transition-transform ${bgmEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
              <span className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Sound Effects</span>
            </div>
            <button 
              onClick={() => setSfxEnabled(!sfxEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${sfxEnabled ? 'bg-secondary' : 'bg-surface-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-background transition-transform ${sfxEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">vibration</span>
              <span className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Haptic Feedback</span>
            </div>
            <button 
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${hapticsEnabled ? 'bg-secondary' : 'bg-surface-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-background transition-transform ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

        </div>
      </section>

      {/* 4. Match History */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em]">Recent Matches</h3>
          <button className="font-label text-[10px] text-secondary uppercase tracking-widest hover:underline flex items-center gap-1">
            View on Explorer <span className="material-symbols-outlined text-[10px]">open_in_new</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          {[
            { opponent: 'Unknown_0x4F', wager: '10 cUSD', result: 'WIN', color: 'text-secondary' },
            { opponent: 'Glitch_Bit', wager: '5 cUSD', result: 'LOSS', color: 'text-error' },
            { opponent: 'DojoMaster', wager: '1 cUSD', result: 'WIN', color: 'text-secondary' },
          ].map((match, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-surface-container rounded-xl border border-outline-variant/30">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-outline/30">
                   <span className="material-symbols-outlined text-on-surface-variant text-sm">smart_toy</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="font-headline font-bold text-sm text-on-surface">{match.opponent}</span>
                   <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{match.wager} Wager</span>
                 </div>
               </div>
               <span className={`font-display font-black text-xl ${match.color}`}>
                 {match.result === 'WIN' ? '+'+match.wager.split(' ')[0] : '-'+match.wager.split(' ')[0]}
               </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Wallet Management */}
      <section className="pt-8 pb-4">
        <button 
          onClick={handleDisconnect}
          className="w-full py-4 border border-error/50 text-error bg-error/5 font-display font-bold uppercase tracking-widest rounded-xl hover:bg-error/20 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,45,45,0.1)]"
        >
          <span className="material-symbols-outlined">logout</span>
          Disconnect Wallet
        </button>
      </section>

    </div>
  );
};

export default Profile;
