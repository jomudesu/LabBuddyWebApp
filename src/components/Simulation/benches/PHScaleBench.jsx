import React, { useState, useEffect } from 'react';

const PHScaleBench = ({ 
  simState, 
  uiState,
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { papersPlaced, lemonTested, waterTested, ammoniaTested, activePH, isComplete } = simState;
  const { animating } = uiState || {};
  
  const target = currentStep?.targetElement;
  const isTarget = (id) => target === id && !isComplete;

  // Local interactive state to allow clicking watch glasses after they are tested
  const [displayPH, setDisplayPH] = useState(null);

  // Automatically sync the local display with the engine's active step during the experiment
  useEffect(() => {
    if (activePH !== null) {
      setDisplayPH(activePH);
    }
  }, [activePH]);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Embedded CSS for the falling droplet and splashing absorption */}
      <style>{`
        @keyframes droplet-fall {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          80% { transform: translateY(50px) scale(1); opacity: 1; }
          100% { transform: translateY(50px) scale(2.5); opacity: 0; }
        }
      `}</style>

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-2">
        
        {/* Unified Baseline Layout */}
        <div className="flex justify-center items-end gap-8 md:gap-14 h-[240px] relative w-full max-w-4xl mb-16">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[90%] h-10 bg-black/20 rounded-[100%] blur-md z-0" />

          {/* 1. Paper Stack */}
          <div className="flex flex-col items-center relative z-20 w-20">
            <div 
              className={`flex flex-col items-center transition-all duration-300 group ${isTarget('paper_stack') ? 'cursor-pointer pulse-glow hover:-translate-y-2' : ''} ${target === 'paper_stack' && animating ? 'scale-90 opacity-50' : ''}`}
              onClick={() => isTarget('paper_stack') && handleElementClick('paper_stack')}
            >
              <div className="relative w-16 h-12">
                 <div className="absolute bottom-0 w-16 h-4 bg-yellow-500 border border-yellow-600 rounded-sm shadow-md rotate-3" />
                 <div className="absolute bottom-1 w-16 h-4 bg-yellow-400 border border-yellow-500 rounded-sm shadow-md -rotate-2" />
                 <div className="absolute bottom-2 w-16 h-4 bg-yellow-300 border border-yellow-400 rounded-sm shadow-md" />
                 <div className="absolute bottom-2 left-2 w-12 h-6 bg-black/80 rounded-t-sm flex items-center justify-center text-[9px] text-yellow-300 font-bold border-t border-x border-gray-600">pH Strips</div>
              </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Paper Stack</span>
          </div>

          <div className="w-px h-24 bg-white/20 ml-2 mr-2" /> {/* Divider */}

          {/* 2. Lemon Juice Station */}
          <div className="flex flex-col items-center relative z-20 w-24">
             {/* Dropper Bottle */}
             <div 
              className={`absolute -top-32 flex flex-col items-center transition-all duration-500 group origin-bottom-right z-30 ${isTarget('lemon_drop') ? 'cursor-pointer pulse-glow hover:-translate-y-2' : ''} ${target === 'lemon_drop' && animating ? '-translate-y-4 -rotate-[25deg]' : ''}`}
              onClick={() => isTarget('lemon_drop') && handleElementClick('lemon_drop')}
            >
              <div className="w-5 h-6 bg-gray-800 rounded-t-xl" />
              <div className="w-7 h-2 bg-gray-900 rounded-sm" />
              <div className="w-10 h-12 bg-white/30 backdrop-blur-md rounded-b-lg border border-white/50 shadow-inner overflow-hidden relative">
                 <div className="absolute bottom-0 w-full h-[60%] bg-yellow-200/60 border-t border-yellow-100/50" />
              </div>
              {/* Droplet Animation */}
              {target === 'lemon_drop' && animating && (
                <div className="absolute -bottom-2 -left-2 w-2 h-3 bg-yellow-200 rounded-full blur-[1px]" style={{ animation: 'droplet-fall 0.7s ease-in forwards' }} />
              )}
            </div>

            <div 
              className={`relative flex flex-col items-center mt-2 transition-transform duration-300 ${lemonTested ? 'cursor-pointer hover:-translate-y-1' : ''}`}
              onClick={() => lemonTested && setDisplayPH(2.5)}
            >
               {/* CHANGED: Appended 'isComplete ? pulse-glow' so it highlights dynamically after the experiment ends */}
               <div className={`w-20 h-5 bg-white/20 backdrop-blur-md rounded-b-[50%] border-b-2 border-x border-white/60 flex justify-center items-start pt-1 overflow-hidden z-10 transition-all duration-300 ${
                 displayPH === 2.5 ? 'shadow-[0_0_20px_rgba(255,255,255,0.7)] ring-2 ring-white/80' : 'shadow-lg'
               } ${isComplete ? 'pulse-glow' : ''}`}>
                 <div className={`w-14 h-3 rounded-sm shadow-sm transition-all duration-1000 ease-in-out border border-black/10 ${papersPlaced ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} ${lemonTested ? 'bg-red-500' : 'bg-yellow-300'}`} />
               </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Lemon Juice</span>
          </div>

          {/* 3. Distilled Water Station */}
          <div className="flex flex-col items-center relative z-20 w-24">
             {/* Dropper Bottle */}
             <div 
              className={`absolute -top-32 flex flex-col items-center transition-all duration-500 group origin-bottom-right z-30 ${isTarget('water_drop') ? 'cursor-pointer pulse-glow hover:-translate-y-2' : ''} ${target === 'water_drop' && animating ? '-translate-y-4 -rotate-[25deg]' : ''}`}
              onClick={() => isTarget('water_drop') && handleElementClick('water_drop')}
            >
              <div className="w-5 h-6 bg-gray-800 rounded-t-xl" />
              <div className="w-7 h-2 bg-gray-900 rounded-sm" />
              <div className="w-10 h-12 bg-white/30 backdrop-blur-md rounded-b-lg border border-white/50 shadow-inner overflow-hidden relative">
                 <div className="absolute bottom-0 w-full h-[60%] bg-cyan-200/40 border-t border-cyan-100/50" />
              </div>
              {/* Droplet Animation */}
              {target === 'water_drop' && animating && (
                <div className="absolute -bottom-2 -left-2 w-2 h-3 bg-cyan-200 rounded-full blur-[1px]" style={{ animation: 'droplet-fall 0.7s ease-in forwards' }} />
              )}
            </div>

            <div 
              className={`relative flex flex-col items-center mt-2 transition-transform duration-300 ${waterTested ? 'cursor-pointer hover:-translate-y-1' : ''}`}
              onClick={() => waterTested && setDisplayPH(7)}
            >
               {/* CHANGED: Appended 'isComplete ? pulse-glow' so it highlights dynamically after the experiment ends */}
               <div className={`w-20 h-5 bg-white/20 backdrop-blur-md rounded-b-[50%] border-b-2 border-x border-white/60 flex justify-center items-start pt-1 overflow-hidden z-10 transition-all duration-300 ${
                 displayPH === 7 ? 'shadow-[0_0_20px_rgba(255,255,255,0.7)] ring-2 ring-white/80' : 'shadow-lg'
               } ${isComplete ? 'pulse-glow' : ''}`}>
                 <div className={`w-14 h-3 rounded-sm shadow-sm transition-all duration-1000 ease-in-out border border-black/10 ${papersPlaced ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} ${waterTested ? 'bg-green-500' : 'bg-yellow-300'}`} />
               </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Distilled H₂O</span>
          </div>

          {/* 4. Ammonia Station */}
          <div className="flex flex-col items-center relative z-20 w-24">
             {/* Dropper Bottle */}
             <div 
              className={`absolute -top-32 flex flex-col items-center transition-all duration-500 group origin-bottom-right z-30 ${isTarget('ammonia_drop') ? 'cursor-pointer pulse-glow hover:-translate-y-2' : ''} ${target === 'ammonia_drop' && animating ? '-translate-y-4 -rotate-[25deg]' : ''}`}
              onClick={() => isTarget('ammonia_drop') && handleElementClick('ammonia_drop')}
            >
              <div className="w-5 h-6 bg-gray-800 rounded-t-xl" />
              <div className="w-7 h-2 bg-gray-900 rounded-sm" />
              <div className="w-10 h-12 bg-white/30 backdrop-blur-md rounded-b-lg border border-white/50 shadow-inner overflow-hidden relative">
                 <div className="absolute bottom-0 w-full h-[60%] bg-indigo-200/40 border-t border-indigo-100/50" />
              </div>
              {/* Droplet Animation */}
              {target === 'ammonia_drop' && animating && (
                <div className="absolute -bottom-2 -left-2 w-2 h-3 bg-indigo-200/80 rounded-full blur-[1px]" style={{ animation: 'droplet-fall 0.7s ease-in forwards' }} />
              )}
            </div>

            <div 
              className={`relative flex flex-col items-center mt-2 transition-transform duration-300 ${ammoniaTested ? 'cursor-pointer hover:-translate-y-1' : ''}`}
              onClick={() => ammoniaTested && setDisplayPH(11)}
            >
               {/* CHANGED: Appended 'isComplete ? pulse-glow' so it highlights dynamically after the experiment ends */}
               <div className={`w-20 h-5 bg-white/20 backdrop-blur-md rounded-b-[50%] border-b-2 border-x border-white/60 flex justify-center items-start pt-1 overflow-hidden z-10 transition-all duration-300 ${
                 displayPH === 11 ? 'shadow-[0_0_20px_rgba(255,255,255,0.7)] ring-2 ring-white/80' : 'shadow-lg'
               } ${isComplete ? 'pulse-glow' : ''}`}>
                 <div className={`w-14 h-3 rounded-sm shadow-sm transition-all duration-1000 ease-in-out border border-black/10 ${papersPlaced ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} ${ammoniaTested ? 'bg-indigo-700' : 'bg-yellow-300'}`} />
               </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Ammonia</span>
          </div>

        </div>

        {/* ── Dynamic pH Reference Scale ── */}
        <div className="mt-12 px-8 w-full max-w-2xl z-10 relative">
          <div className="flex justify-between text-xs text-white/90 font-bold mb-2 uppercase tracking-widest">
            <span>Strong Acid (0)</span><span>Neutral (7)</span><span>Strong Base (14)</span>
          </div>
          
          <div className="relative h-6 rounded-full overflow-hidden border border-white/30 shadow-inner" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #fde047, #4ade80, #3b82f6, #4338ca, #312e81)' }}>
            
            {/* Dynamic Tracker Arrow (Now follows displayPH) */}
            <div 
              className={`absolute top-0 h-full w-2 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] border-2 border-gray-900 rounded-full transition-all duration-1000 ease-in-out ${displayPH === null ? 'opacity-0' : 'opacity-100'}`} 
              style={{ left: `calc(${(displayPH || 7) / 14 * 100}% - 4px)` }} 
            />
          </div>
          
          {/* Output Reading Module */}
          <div className="text-center mt-5 flex justify-center">
             <div className="bg-black/30 px-5 py-2.5 rounded-xl border border-white/10 shadow-sm flex items-center gap-3 transition-colors duration-500" style={{ 
               boxShadow: displayPH === null ? 'none' : displayPH < 7 ? '0 0 15px rgba(239,68,68,0.2)' : displayPH > 7 ? '0 0 15px rgba(67,56,202,0.2)' : '0 0 15px rgba(74,222,128,0.2)'
             }}>
               <span className="text-xs text-white/90 font-bold uppercase tracking-widest">Detected pH Level:</span>
               <span className={`text-lg font-bold font-mono transition-colors duration-500 ${displayPH === null ? 'text-gray-500' : displayPH < 7 ? 'text-red-400' : displayPH > 7 ? 'text-indigo-400' : 'text-green-400'}`}>
                 {displayPH === null ? '--' : displayPH.toFixed(1)}
               </span>
             </div>
          </div>
        </div>

      </div>

      {children}
    </div>
  );
};

export default PHScaleBench;