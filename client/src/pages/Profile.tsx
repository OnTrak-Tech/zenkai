import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { getProfile, saveProfile, getSettings, saveSettings, AVATAR_OPTIONS } from '../services/localStorage';
import { getPlayerStats, getRecentMatches } from '../services/onchainStats';
import { CONFIG, CONTRACT_ADDRESSES } from '../config';
import type { UserProfile, GameSettings } from '../services/localStorage';
import type { PlayerStats, MatchRecord } from '../services/onchainStats';

const Profile: React.FC = () => {
  const { address, disconnect, isConnected } = useWallet();
  const navigate = useNavigate();
  const escrowAddress = CONTRACT_ADDRESSES[CONFIG.network].escrow;

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({ username: 'Player', avatarIndex: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<GameSettings>({ bgm: true, sfx: true, haptics: true });

  // On-chain stats
  const [stats, setStats] = useState<PlayerStats>({ totalMatches: 0, wins: 0, losses: 0, draws: 0, winRate: 0, netEarnings: '0' });
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // If not connected, redirect to Home
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // Load profile and settings from localStorage
  useEffect(() => {
    if (!address) return;
    const storedProfile = getProfile(address);
    setProfile(storedProfile);
    setEditNameValue(storedProfile.username);
    setSettings(getSettings());
  }, [address]);

  // Load on-chain stats
  useEffect(() => {
    if (!address) return;
    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        const [playerStats, recentMatches] = await Promise.all([
          getPlayerStats(address),
          getRecentMatches(address, 5),
        ]);
        setStats(playerStats);
        setMatches(recentMatches);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    loadStats();
  }, [address]);

  // --- Handlers ---
  const handleSaveName = () => {
    if (!address || !editNameValue.trim()) return;
    const updated = { ...profile, username: editNameValue.trim() };
    setProfile(updated);
    saveProfile(address, updated);
    setIsEditingName(false);
  };

  const handleSelectAvatar = (index: number) => {
    if (!address) return;
    const updated = { ...profile, avatarIndex: index };
    setProfile(updated);
    saveProfile(address, updated);
    setShowAvatarPicker(false);
  };

  const handleToggleSetting = (key: keyof GameSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const currentAvatar = AVATAR_OPTIONS[profile.avatarIndex] || AVATAR_OPTIONS[0];

  return (
    <div className="flex flex-col space-y-8 pb-10 max-w-lg mx-auto">
      
      {/* 1. Identity Header */}
      <section className="flex flex-col items-center justify-center text-center pt-4">
        <div className="relative mb-4">
          <div 
            className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_20px_rgba(255,45,120,0.5)] flex items-center justify-center"
            style={{ backgroundColor: `${currentAvatar.color}20` }}
          >
            <span 
              className="material-symbols-outlined text-5xl"
              style={{ color: currentAvatar.color }}
            >
              {currentAvatar.icon}
            </span>
          </div>
          <button 
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="flex flex-wrap justify-center gap-3 mb-4 p-4 bg-surface-container rounded-xl border border-outline-variant/30 w-full max-w-xs">
            {AVATAR_OPTIONS.map((avatar, i) => (
              <button
                key={i}
                onClick={() => handleSelectAvatar(i)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  profile.avatarIndex === i
                    ? 'ring-2 ring-primary scale-110'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: `${avatar.color}20` }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: avatar.color }}>
                  {avatar.icon}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Editable Username */}
        {isEditingName ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              maxLength={20}
              autoFocus
              className="bg-surface-container border-2 border-primary rounded-lg px-3 py-2 font-headline font-bold text-xl text-on-surface outline-none text-center uppercase tracking-tighter w-48"
            />
            <button
              onClick={handleSaveName}
              className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center text-secondary hover:bg-secondary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">check</span>
            </button>
            <button
              onClick={() => { setIsEditingName(false); setEditNameValue(profile.username); }}
              className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center text-error hover:bg-error/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditingName(true)}
            className="flex items-center gap-2 group"
          >
            <h2 className="font-headline font-black text-3xl uppercase tracking-tighter text-on-surface">
              {profile.username}
            </h2>
            <span className="material-symbols-outlined text-on-surface-variant/50 text-sm opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
          </button>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 border border-secondary/30 bg-secondary/10 rounded-full">
           <span className="w-2 h-2 rounded-full bg-secondary"></span>
           <span className="font-label text-[10px] text-secondary uppercase tracking-widest font-bold">
             {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connecting...'}
           </span>
        </div>
      </section>

      {/* 2. Prestige Dashboard — On-Chain Stats */}
      <section className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 flex justify-between items-center shadow-lg">
        {isLoadingStats ? (
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest ml-3">Loading stats...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Matches</span>
              <span className="font-headline font-bold text-xl text-on-surface">{stats.totalMatches}</span>
            </div>
            <div className="w-[1px] h-8 bg-outline-variant/50"></div>
            <div className="flex flex-col items-center">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Win Rate</span>
              <span className="font-headline font-bold text-xl text-secondary neon-cyan-glow">{stats.winRate}%</span>
            </div>
            <div className="w-[1px] h-8 bg-outline-variant/50"></div>
            <div className="flex flex-col items-center">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Earnings</span>
              <span className={`font-headline font-bold text-xl ${Number(stats.netEarnings) >= 0 ? 'text-secondary neon-cyan-glow' : 'text-error'}`}>
                {Number(stats.netEarnings) > 0 ? '+' : ''}{stats.netEarnings}
              </span>
            </div>
          </>
        )}
      </section>

      {/* 3. Settings — Persisted via localStorage */}
      <section className="space-y-4">
        <h3 className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em] px-2">Game Settings</h3>
        <div className="bg-surface-container-high rounded-xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">music_note</span>
              <span className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Background Music</span>
            </div>
            <button 
              onClick={() => handleToggleSetting('bgm')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.bgm ? 'bg-secondary' : 'bg-surface-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-background transition-transform ${settings.bgm ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
              <span className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Sound Effects</span>
            </div>
            <button 
              onClick={() => handleToggleSetting('sfx')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.sfx ? 'bg-secondary' : 'bg-surface-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-background transition-transform ${settings.sfx ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">vibration</span>
              <span className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Haptic Feedback</span>
            </div>
            <button 
              onClick={() => handleToggleSetting('haptics')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.haptics ? 'bg-secondary' : 'bg-surface-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-background transition-transform ${settings.haptics ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

        </div>
      </section>

      {/* 4. Match History — On-Chain */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em]">Recent Matches</h3>
          {escrowAddress && (
            <a 
              href={`https://${CONFIG.network === 'celo' ? '' : 'sepolia.'}celoscan.io/address/${escrowAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-[10px] text-secondary uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              View on Explorer <span className="material-symbols-outlined text-[10px]">open_in_new</span>
            </a>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {isLoadingStats ? (
            <div className="flex items-center justify-center p-8 bg-surface-container rounded-xl border border-outline-variant/30">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Loading matches...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-surface-container rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2">sports_esports</span>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">No matches yet</span>
              <span className="font-label text-[10px] text-on-surface-variant/50 mt-1">Play a game to see your history here</span>
            </div>
          ) : (
            matches.map((match, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-surface-container rounded-xl border border-outline-variant/30">
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                     match.result === 'WIN' ? 'border-secondary/30 bg-secondary/10' : 
                     match.result === 'LOSS' ? 'border-error/30 bg-error/10' : 
                     'border-tertiary/30 bg-tertiary/10'
                   }`}>
                     <span className={`material-symbols-outlined text-sm ${
                       match.result === 'WIN' ? 'text-secondary' : 
                       match.result === 'LOSS' ? 'text-error' : 
                       'text-tertiary'
                     }`}>
                       {match.result === 'WIN' ? 'emoji_events' : match.result === 'LOSS' ? 'close' : 'handshake'}
                     </span>
                   </div>
                   <div className="flex flex-col">
                     <span className="font-headline font-bold text-sm text-on-surface">{match.opponent}</span>
                     <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{match.result}</span>
                   </div>
                 </div>
                 <span className={`font-display font-black text-xl ${
                   match.result === 'WIN' ? 'text-secondary' : 'text-error'
                 }`}>
                   {match.result === 'WIN' ? '+' : '-'}{match.payout}
                 </span>
              </div>
            ))
          )}
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
