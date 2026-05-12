import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-6 bg-surface-container/90 backdrop-blur-xl border-t border-primary/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-full">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center transition-all active:scale-90 ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(255,45,120,0.6)]' : 'text-on-surface-variant/60 hover:text-secondary'}`
        }
      >
        <span className="material-symbols-outlined font-variation-settings-fill" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-label text-[10px] uppercase tracking-widest mt-1">Home</span>
      </NavLink>
      
      <NavLink 
        to="/arena" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center transition-all active:scale-90 ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(255,45,120,0.6)]' : 'text-on-surface-variant/60 hover:text-secondary'}`
        }
      >
        <span className="material-symbols-outlined">sports_esports</span>
        <span className="font-label text-[10px] uppercase tracking-widest mt-1">Arena</span>
      </NavLink>

      <NavLink 
        to="/ranks" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center transition-all active:scale-90 ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(255,45,120,0.6)]' : 'text-on-surface-variant/60 hover:text-secondary'}`
        }
      >
        <span className="material-symbols-outlined">leaderboard</span>
        <span className="font-label text-[10px] uppercase tracking-widest mt-1">Ranks</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center transition-all active:scale-90 ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(255,45,120,0.6)]' : 'text-on-surface-variant/60 hover:text-secondary'}`
        }
      >
        <span className="material-symbols-outlined">person</span>
        <span className="font-label text-[10px] uppercase tracking-widest mt-1">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavBar;
