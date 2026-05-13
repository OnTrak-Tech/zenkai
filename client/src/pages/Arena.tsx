import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GRID_SIZE = 9;

const Arena: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [matchOver, setMatchOver] = useState(false);

  const handleConfirmMove = () => {
    if (selectedCell === null) return;
    setIsEncrypting(true);

    // Simulate ZK-Proof generation and settlement
    setTimeout(() => {
      setIsEncrypting(false);
      setMatchOver(true);
    }, 4000);
  };

  const handleRematch = () => {
    navigate('/lobby');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative">
      
      {/* ZK Proof Overlay */}
      {isEncrypting && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-xs space-y-6">
            <h2 className="text-center font-display font-black text-2xl text-primary uppercase tracking-widest animate-pulse">
              ENCRYPTING MOVE
            </h2>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
               <div className="h-full bg-primary animate-[loading_4s_ease-in-out_forwards]"></div>
            </div>
            <p className="text-center font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Generating Noir ZK-Proof...
            </p>
          </div>
        </div>
      )}

      {/* Match Over Overlay */}
      {matchOver && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
          <h2 className="text-6xl font-display font-black text-secondary uppercase tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(45,255,180,0.8)]">
            VICTORY
          </h2>
          <div className="text-3xl font-headline font-bold text-secondary mb-12 animate-bounce">
            +5.00 cUSD
          </div>
          <button 
            onClick={handleRematch}
            className="w-full max-w-xs py-4 bg-primary text-on-primary font-display font-bold text-xl uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Opponent Profile (Top) */}
      <div className="p-4 border-b border-error/30 bg-surface-container-low flex justify-between items-center shadow-[0_4px_15px_rgba(255,45,45,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-error overflow-hidden p-0.5">
             <div className="w-full h-full bg-error/20 rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-error">smart_toy</span>
             </div>
          </div>
          <div>
            <h3 className="font-headline font-bold text-error uppercase">Unknown_0x4F</h3>
            <div className="flex gap-1 mt-1">
               <span className="w-4 h-1 bg-error rounded-full"></span>
               <span className="w-4 h-1 bg-error rounded-full"></span>
               <span className="w-4 h-1 bg-error rounded-full opacity-30"></span>
            </div>
          </div>
        </div>
        <div className="font-display font-black text-2xl text-on-surface/50">VS</div>
      </div>

      {/* Game Grid (Center) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm aspect-square grid grid-cols-3 gap-2 p-2 bg-surface-container-high rounded-xl border border-outline-variant/50 shadow-2xl">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedCell(i)}
              className={`rounded-lg transition-all duration-200 border-2 ${
                selectedCell === i 
                  ? 'bg-secondary/20 border-secondary shadow-[inset_0_0_20px_rgba(45,255,180,0.5)]' 
                  : 'bg-surface border-outline-variant hover:border-secondary/50'
              }`}
            >
               {selectedCell === i && (
                 <span className="material-symbols-outlined text-secondary text-4xl animate-pulse">
                   location_searching
                 </span>
               )}
            </button>
          ))}
        </div>
      </div>

      {/* Player Profile & Action (Bottom) */}
      <div className="p-4 border-t border-primary/30 bg-surface-container-low shadow-[0_-4px_15px_rgba(255,45,120,0.1)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden p-0.5">
               <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkMRYmvUhF-_eQDx7pqC8gCuVHQ9k6m5l7AFYdNz22vmcDukgs7xCpY6uAPn1RyACbCK9C1J0KqGouQUBF5gG6ym_lxAdfK29fIV_h0MEzZSduUxAHCX8nn5LY8-I7P5JZBPSQXA7oJPDfkciTIr1dc9C3itA6RJwV_90KPHBaVpHJj3ZPDc2EBXLK0p9mk1ziNQsxACTiZznFiaURRibsU6DFJ_tPZa2l0u7j3WhvW-4T4DK07Cc6G2Gmm8qzc7pEACkMlrzbt6G" alt="Player" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-primary uppercase">YOU</h3>
              <div className="flex gap-1 mt-1">
                 <span className="w-4 h-1 bg-primary rounded-full"></span>
                 <span className="w-4 h-1 bg-primary rounded-full"></span>
                 <span className="w-4 h-1 bg-primary rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleConfirmMove}
          disabled={selectedCell === null || isEncrypting}
          className={`w-full py-4 font-display font-bold text-xl uppercase tracking-widest rounded-xl transition-all ${
            selectedCell !== null
              ? 'bg-primary text-on-primary hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,45,120,0.4)]'
              : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}
        >
          {selectedCell !== null ? 'CONFIRM MOVE' : 'SELECT TILE'}
        </button>
      </div>

    </div>
  );
};

export default Arena;
