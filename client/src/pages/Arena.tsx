import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { CONFIG } from '../config';
import { useNavigate } from 'react-router-dom';

const Arena: React.FC = () => {
  const { address, isConnected, connect } = useWallet();
  const navigate = useNavigate();
  
  const [isQueueing, setIsQueueing] = useState(false);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'waiting' | 'matched' | 'error' | 'timeout'>('idle');
  const [matchData, setMatchData] = useState<any>(null);

  const startMatchmaking = async (tier: string) => {
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      setIsQueueing(true);
      setMatchStatus('waiting');
      
      const response = await fetch(`${CONFIG.serverUrl}/api/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          gameType: 'Chess', // Defaulting to Chess for now
          stakeTier: tier
        })
      });

      const data = await response.json();
      if (data.queueId) {
        setQueueId(data.queueId);
        if (data.status === 'matched') {
          handleMatched(data);
        }
      } else {
        throw new Error(data.error || "Failed to join queue");
      }
    } catch (error) {
      console.error("Matchmaking error:", error);
      setMatchStatus('error');
      setIsQueueing(false);
    }
  };

  const handleMatched = (data: any) => {
    setMatchStatus('matched');
    setMatchData(data);
    setIsQueueing(false);
    // In a real app, we would now transition to the Game screen
    setTimeout(() => {
      navigate(`/game/${data.matchId}`);
    }, 2000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (matchStatus === 'waiting' && queueId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${CONFIG.serverUrl}/api/queue/${queueId}`);
          const data = await response.json();

          if (data.status === 'matched') {
            handleMatched(data);
            clearInterval(interval);
          } else if (data.status === 'timeout') {
            setMatchStatus('timeout');
            setIsQueueing(false);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [matchStatus, queueId]);

  return (
    <div className="space-y-8 pb-10">
      <header className="text-center space-y-2">
        <h2 className="font-headline text-3xl font-black text-on-surface uppercase tracking-tight">Matchmaking Arena</h2>
        <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Select your stakes and enter the grid</p>
      </header>

      {/* Matchmaking Overlay */}
      {isQueueing && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(255,45,120,0.4)]"></div>
          <h3 className="text-3xl font-display font-black text-on-surface uppercase tracking-tighter mb-2">Finding Opponent</h3>
          <p className="text-on-surface-variant font-label text-xs uppercase tracking-widest animate-pulse">Scanning the Grid...</p>
          <button 
            onClick={() => { setIsQueueing(false); setMatchStatus('idle'); setQueueId(null); }}
            className="mt-12 text-error font-label text-[10px] uppercase tracking-widest hover:underline"
          >
            Cancel Search
          </button>
        </div>
      )}

      {matchStatus === 'matched' && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,255,204,0.6)]">
            <span className="material-symbols-outlined text-on-secondary text-5xl">check_circle</span>
          </div>
          <h3 className="text-3xl font-display font-black text-secondary uppercase tracking-tighter mb-2">Match Found!</h3>
          <p className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Initializing Game Session...</p>
        </div>
      )}

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
            <button 
              disabled={isQueueing}
              onClick={() => startMatchmaking(tier.title)}
              className={`w-full py-3 rounded-lg font-headline font-bold uppercase tracking-widest transition-all ${tier.active ? 'bg-secondary text-on-secondary hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,255,204,0.3)]' : 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant'}`}
            >
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
