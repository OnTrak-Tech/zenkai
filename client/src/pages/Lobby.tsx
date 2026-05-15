import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { joinQueue, pollQueue } from '../services/apiClient';

const WAGER_OPTIONS = ['1', '5', '10'];

const Lobby: React.FC = () => {
  const { isConnected, balance, address } = useWallet();
  const navigate = useNavigate();
  const [selectedWager, setSelectedWager] = useState<string>('1');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If not connected, boot them back to home
  React.useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
    // Cleanup polling on unmount
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isConnected, navigate]);

  const handleFindMatch = async () => {
    if (!address) return;
    setIsSearching(true);
    setSearchStatus('Joining queue...');

    try {
      // Step 1: Join the queue
      const queueResult = await joinQueue(address, 'Trivia', selectedWager);

      if (queueResult.status === 'matched' && queueResult.matchId) {
        // Instant match!
        setSearchStatus('Match found!');
        setTimeout(() => {
          navigate('/arena', { state: { matchId: queueResult.matchId, wager: selectedWager } });
        }, 500);
        return;
      }

      // Step 2: Poll for match every 2 seconds
      setSearchStatus('Locating Opponent...');
      const queueId = queueResult.queueId;

      pollRef.current = setInterval(async () => {
        try {
          const pollResult = await pollQueue(queueId);

          if (pollResult.status === 'matched' && pollResult.matchId) {
            if (pollRef.current) clearInterval(pollRef.current);
            setSearchStatus('Match found!');
            setTimeout(() => {
              navigate('/arena', { state: { matchId: pollResult.matchId, wager: selectedWager } });
            }, 500);
          } else if (pollResult.status === 'timeout') {
            if (pollRef.current) clearInterval(pollRef.current);
            setSearchStatus('No opponent found. Try again!');
            setTimeout(() => {
              setIsSearching(false);
              setSearchStatus('');
            }, 2000);
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 2000);

    } catch (err) {
      console.error('Queue error:', err);
      setSearchStatus('Server error. Try again.');
      setTimeout(() => {
        setIsSearching(false);
        setSearchStatus('');
      }, 2000);
    }
  };

  const handleCancelSearch = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setIsSearching(false);
    setSearchStatus('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
      
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-black text-on-surface uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          SELECT <span className="text-primary neon-text-glow">WAGER</span>
        </h2>
        <p className="text-on-surface-variant font-label uppercase tracking-widest mt-2 text-sm">
          High stakes, zero knowledge.
        </p>
      </div>

      {/* Wager Selection */}
      <div className="flex gap-4 w-full max-w-sm mb-4">
        {WAGER_OPTIONS.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedWager(amount)}
            disabled={isSearching}
            className={`flex-1 py-4 rounded-xl border-2 transition-all duration-200 font-display font-bold text-xl flex flex-col items-center justify-center gap-1 ${
              selectedWager === amount
                ? 'bg-primary/20 border-primary text-primary neon-border-glow scale-105'
                : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary/50'
            } ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{amount}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm mb-12 relative">
        <input 
          type="number"
          min="1"
          step="0.1"
          placeholder="Custom Amount"
          disabled={isSearching}
          value={WAGER_OPTIONS.includes(selectedWager) ? '' : selectedWager}
          onChange={(e) => setSelectedWager(e.target.value)}
          className={`w-full py-4 px-6 rounded-xl border-2 bg-surface-container font-display font-bold text-xl outline-none transition-all placeholder:text-on-surface-variant/50 ${
            !WAGER_OPTIONS.includes(selectedWager) && selectedWager !== ''
              ? 'border-primary text-primary neon-border-glow scale-[1.02]'
              : 'border-outline-variant text-on-surface hover:border-primary/50'
          } ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">CELO</span>
      </div>

      {/* Find Match Button / Searching State */}
      <div className="w-full max-w-sm relative">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container border border-secondary/30 rounded-xl w-full">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-2 border-secondary rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 border-2 border-secondary rounded-full animate-ping animation-delay-300 opacity-50"></div>
              <div className="absolute inset-4 bg-secondary rounded-full animate-pulse shadow-[0_0_15px_rgba(45,255,180,0.8)]"></div>
            </div>
            <p className="font-label text-secondary uppercase tracking-widest animate-pulse text-sm mb-4">
              {searchStatus || 'Locating Opponent...'}
            </p>
            <button
              onClick={handleCancelSearch}
              className="px-6 py-2 border border-error/50 text-error font-label text-xs uppercase tracking-widest rounded-lg hover:bg-error/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleFindMatch}
            className="w-full py-5 bg-primary text-on-primary font-display font-bold uppercase tracking-widest text-xl rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,45,120,0.4)] hover:shadow-[0_0_30px_rgba(255,45,120,0.6)]"
          >
            FIND MATCH
          </button>
        )}
      </div>

      {/* Current Balance Display below button */}
      <div className="mt-8 text-center flex flex-col items-center gap-1">
         <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Available Balance</span>
         <span className="font-headline font-bold text-lg text-secondary neon-cyan-glow">
            {balance} CELO
         </span>
      </div>

    </div>
  );
};

export default Lobby;
