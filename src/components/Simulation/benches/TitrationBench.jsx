import React from 'react';

const TitrationBench = ({ 
  simState, 
  uiState, 
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { pH, indicatorColor, beakerFill } = simState;
  const { addedVolume, showVolumeReading, showDrop, buretteFilled, hasIndicator, animating } = uiState || {};
  
  const target = currentStep?.targetElement;

  const beakerLiquidGradient = () => {
    if (!hasIndicator) return 'linear-gradient(90deg, rgba(173,216,230,0.3) 0%, rgba(255,255,255,0.6) 50%, rgba(173,216,230,0.3) 100%)';
    if (indicatorColor === 'pink') return 'linear-gradient(90deg, rgba(244,114,182,0.7) 0%, rgba(253,164,211,0.9) 50%, rgba(244,114,182,0.7) 100%)';
    return 'linear-gradient(90deg, rgba(173,216,230,0.3) 0%, rgba(255,255,255,0.6) 50%, rgba(173,216,230,0.3) 100%)';
  };

  const maxBuretteVol = 60;
  const accurateBuretteFill = buretteFilled ? Math.max(10, 90 - (addedVolume / maxBuretteVol) * 80) : 0;
  
  // During fill animation, rise to 90% (the 0 mL mark)
  const buretteFillHeight = (target === 'naoh_bottle' && animating) ? 90 : accurateBuretteFill;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">        
        <div className="flex justify-center items-end gap-8 md:gap-20 h-[260px] relative w-full max-w-3xl mb-16">
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/20 rounded-[100%] blur-md z-0" />

          {/* ── NaOH Bottle ── */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`relative w-14 h-24 bg-white/20 backdrop-blur-md border border-white/50 rounded-lg shadow-[inset_0_0_15px_rgba(255,255,255,0.4)] flex flex-col items-center justify-end pb-3 transition-all duration-700 ease-in-out cursor-pointer hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:border-white/80 ${
                target === 'naoh_bottle' && animating ? '-rotate-[-50deg] -translate-y-4 scale-110 z-30' : 'z-10'
              }`}
              onClick={() => handleElementClick('naoh_bottle')}
            >
              <div className="absolute -top-3 w-6 h-3 bg-blue-600 rounded-t-sm border border-blue-700" />
              <div className="absolute top-0 w-8 h-3 bg-white/40 backdrop-blur-sm border-x border-white/40" />
              <div className={`absolute bottom-0 w-full rounded-b-lg transition-all duration-[1500ms] ease-in-out bg-blue-100/30 ${buretteFilled && (target !== 'naoh_bottle' || !animating) ? 'h-4' : 'h-[70%]'}`} />
              <div className="w-12 h-12 bg-white/90 rounded border border-white/50 flex flex-col items-center justify-center shadow-sm z-10">
                <span className="text-[10px] font-black text-slate-800 leading-tight">NaOH</span>
                <span className="text-[9px] font-bold text-blue-600">0.1 M</span>
              </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">NaOH Solution</span>
          </div>


          {/* ── Burette (Upgraded to 60mL) ── */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className="flex flex-col items-center cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 group"
              onClick={() => handleElementClick('burette')}
            >
              <div
                className={`
                  relative w-10 h-48
                  bg-white/30 backdrop-blur-md rounded-t shadow-[inset_0_4px_10px_rgba(255,255,255,0.7),_0_5px_15px_rgba(0,0,0,0.1)]
                  border border-white/70 transition-all duration-300
                  group-hover:border-white/90 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]
                  ${target === 'naoh_bottle' && animating ? 'ring-2 ring-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.7)]' : ''}
                  ${showVolumeReading ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''}
                `}
              >
                <div className="absolute bottom-0 w-full transition-all duration-[1500ms] ease-in-out bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 opacity-90" style={{ height: `${buretteFillHeight}%` }} />
                
                {target === 'naoh_bottle' && animating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500/20 backdrop-blur-sm rounded-t z-20">
                    <span className="text-[9px] text-blue-100 font-black tracking-widest uppercase animate-pulse">Filling...</span>
                  </div>
                )}
                
                {[0, 10, 20, 30, 40, 50, 60].map((vol) => {
                  const topPct = 10 + (vol / 60) * 80;
                  return (
                    <div key={`major-${vol}`}>
                      <div className="absolute right-0 h-px bg-gray-600/70 z-10" style={{ top: `${topPct}%`, width: '40%' }} />
                      <span className="absolute right-[45%] text-[10px] text-gray-800 font-mono z-10 font-bold" style={{ top: `calc(${topPct}% - 7px)` }}>{vol}</span>
                    </div>
                  );
                })}
                {[5, 15, 25, 35, 45, 55].map((vol) => {
                  const topPct = 10 + (vol / 60) * 80;
                  return (
                    <div key={`minor-${vol}`} className="absolute right-0 h-px bg-gray-600/70 z-10" style={{ top: `${topPct}%`, width: '20%' }} />
                  );
                })}

                {showVolumeReading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-t success-pop z-20">
                    <span className="text-[10px] text-cyan-300 font-bold tracking-wider uppercase mb-1">Vol</span>
                    <span className="text-sm font-bold text-white font-mono">{addedVolume.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="w-8 h-3.5 bg-gradient-to-b from-gray-300 to-gray-500 rounded shadow-md z-10 border border-white/40 transition-all duration-300 group-hover:brightness-125" />
              <div className="w-1.5 h-6 bg-gradient-to-b from-gray-200 to-white border-x border-gray-400 z-10 transition-all duration-300 group-hover:brightness-125" />
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Burette</span>
          </div>

          {/* ── Beaker ── */}
          <div className="flex flex-col items-center relative z-10">
            <div className="relative group">
              <div
                className="relative w-36 h-36 cursor-pointer transition-all duration-300 ease-out bg-white/30 backdrop-blur-md rounded-b-[1.5rem] border-x-2 border-b-2 border-white/70 shadow-[inset_0_4px_15px_rgba(255,255,255,0.6),_0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:border-white/90"
                onClick={() => handleElementClick('beaker')}
              >
                <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-white/60 to-transparent z-20" />
                <div className="absolute bottom-0 w-full transition-all duration-700 rounded-b-[1.4rem]" style={{ height: `${beakerFill}%`, background: beakerLiquidGradient() }} />
                
                {[25, 50, 75].map((g) => (
                  <div key={g}>
                    <div className="absolute left-0 h-px bg-gray-600/70 z-10" style={{ bottom: `${g}%`, width: '20%' }} />
                    <span className="absolute left-[22%] text-[10px] text-gray-800 font-mono z-10 font-bold" style={{ bottom: `calc(${g}% - 7px)` }}>{g * 2}</span>
                  </div>
                ))}
              </div>
              {showDrop && <div className="drop-animation z-30" style={{ top: '-24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: target === 'indicator' ? '#f472b6' : '#60a5fa', boxShadow: `0 0 8px ${target === 'indicator' ? '#f472b6' : '#60a5fa'}` }} />}
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Beaker</span>
          </div>

          {/* ── Indicator bottle ── */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`relative w-12 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg flex flex-col items-center justify-end pb-1.5 border border-purple-300/50 transition-all duration-700 ease-in-out cursor-pointer opacity-90 hover:opacity-100 hover:-translate-y-3 hover:scale-110 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:border-purple-300 ${
                target === 'indicator' && animating ? '-translate-y-[180px] -translate-x-[110px] -rotate-[60deg] scale-110 z-30' : 'z-10'
              }`}
              onClick={() => handleElementClick('indicator')}
            >
              <div className="absolute -top-2 w-6 h-3 bg-gray-900 rounded border border-gray-700" />
              <div className="w-10 h-8 bg-white/30 backdrop-blur-sm rounded mb-1 border border-white/50 flex items-center justify-center shadow-inner">
                <span className="text-[10px] text-white font-bold tracking-wide">PhPh</span>
              </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Indicator</span>
          </div>

        </div>

        {/* ── pH colour bar ── */}
        <div className="mt-12 px-8 w-full max-w-lg z-10 relative">
          <div className="flex justify-between text-xs text-white/90 font-bold mb-2 uppercase tracking-widest">
            <span>Acid (0)</span><span>Neutral (7)</span><span>Base (14)</span>
          </div>
          <div className="relative h-5 rounded-full overflow-hidden border border-white/30 shadow-inner" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #facc15, #22c55e, #3b82f6, #7c3aed)' }}>
            <div className="absolute top-0 h-full w-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] border border-gray-200 rounded-full transition-all duration-700" style={{ left: `calc(${(pH / 14) * 100}% - 4px)` }} />
          </div>
          <div className="text-center mt-5 flex justify-center">
             <div className="bg-black/30 px-5 py-2.5 rounded-xl border border-white/10 shadow-sm flex items-center gap-3">
               <span className="text-xs text-white/90 font-bold uppercase tracking-widest">pH Level:</span>
               <span className={`text-lg font-bold font-mono ${pH < 7 ? 'text-red-400' : pH > 7 ? 'text-blue-400' : 'text-green-400'}`}>
                 {pH.toFixed(2)}
               </span>
             </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default TitrationBench;