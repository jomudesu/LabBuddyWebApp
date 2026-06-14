import React from 'react';

const GasLawsBench = ({ simState, uiState, currentStep, handleElementClick, children }) => {
  const { volume, pressure, weightsOnPiston, pistonPulled } = simState;
  const target = currentStep?.targetElement;

  // Gas gets darker blue as pressure rises
  const gasDensityOpacity = Math.min(0.9, pressure * 0.2); 

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-12 flex-1">
        
        {/* ── Strict Mathematical Layout Container ── */}
        <div className="relative w-full max-w-3xl h-[320px] mb-8">
          
          {/* Base Shadow */}
          <div className="absolute bottom-[0px] left-1/2 -translate-x-1/2 w-[60%] h-12 bg-black/30 rounded-[100%] blur-md z-0" />

          {/* ── Weight Station (Left) ── */}
          <div className="absolute bottom-0 left-[calc(50%-220px)] flex flex-col items-center z-20">
             <div className="flex gap-3">
               {weightsOnPiston < 1 ? (
                 <div 
                   className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${target === 'weight_1' ? 'hover:-translate-y-2 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`} 
                   onClick={() => handleElementClick('weight_1')}
                 >
                   <div className="w-16 h-16 bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg border-2 border-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-[11px] text-white font-bold tracking-widest">500g</div>
                 </div>
               ) : <div className="w-16 h-16 opacity-0 pointer-events-none" />}
               
               {weightsOnPiston < 2 ? (
                 <div 
                   className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${target === 'weight_2' ? 'hover:-translate-y-2 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`} 
                   onClick={() => handleElementClick('weight_2')}
                 >
                   <div className="w-16 h-16 bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg border-2 border-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-[11px] text-white font-bold tracking-widest">500g</div>
                 </div>
               ) : <div className="w-16 h-16 opacity-0 pointer-events-none" />}
             </div>
             <div className="w-44 h-4 bg-gray-800 border-t-2 border-gray-600 rounded mt-1 shadow-xl" />
             <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-40">Weight Station</span>
          </div>

          {/* ── Connecting Tube ── */}
          <div className="absolute bottom-[20px] left-[calc(50%+45px)] w-[110px] h-4 bg-gradient-to-b from-gray-300 to-gray-500 border-y border-gray-400 z-10" />

          {/* ── Pressure Gauge (Right) ── */}
          <div className="absolute bottom-[0px] left-[calc(50%+130px)] flex flex-col items-center z-30">
            <div className="w-28 h-28 bg-gray-800 rounded-full border-4 border-gray-600 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-2 relative">
               <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
               <span className="text-[9px] text-gray-400 font-bold tracking-widest mb-1">PRESSURE</span>
               <div className="bg-black/90 px-3 py-1.5 rounded text-center border border-gray-700 w-full shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                  <span className={`text-xl font-black font-mono transition-colors duration-500 ${pressure > 1 ? 'text-red-400' : pressure < 1 ? 'text-blue-400' : 'text-green-400'}`}>{pressure.toFixed(2)}</span>
                  <span className="text-[9px] text-gray-500 ml-1">atm</span>
               </div>
            </div>
          </div>

          {/* ── Sealed Syringe Assembly (Center) ── */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center w-24 h-[300px] justify-end z-20">
             
             {/* Piston Assembly (Mathematically tracked to Gas Volume) */}
             <div 
               className={`absolute w-full flex flex-col items-center transition-all duration-1000 ease-in-out z-30 cursor-pointer group ${target === 'piston_handle' && !pistonPulled ? 'hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`}
               style={{ bottom: `${volume * 2}px` }} 
               onClick={() => handleElementClick('piston_handle')}
             >
                {/* Stacked Weights on Piston */}
                <div 
                  className="absolute bottom-full w-full flex flex-col items-center justify-end gap-0.5 mb-0.5 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleElementClick('weights_on_piston'); }}
                >
                   {weightsOnPiston >= 2 && <div className="w-16 h-6 bg-gradient-to-b from-slate-600 to-slate-800 rounded border border-slate-900 shadow-sm flex items-center justify-center text-[9px] text-white font-bold">500g</div>}
                   {weightsOnPiston >= 1 && <div className="w-16 h-6 bg-gradient-to-b from-slate-600 to-slate-800 rounded border border-slate-900 shadow-sm flex items-center justify-center text-[9px] text-white font-bold">500g</div>}
                </div>

                {/* Handle & Plunger Rod */}
                <div className={`w-20 h-4 bg-gray-800 rounded-t-lg border-2 border-gray-900 shadow-sm transition-colors ${target === 'piston_handle' && !pistonPulled ? 'group-hover:bg-blue-600 group-hover:border-blue-800' : ''}`} />
                <div className="w-4 h-[150px] bg-gradient-to-b from-gray-300 to-gray-500 border-x border-gray-600" />
                
                {/* Rubber Seal inside cylinder */}
                <div className="w-[88px] h-6 bg-gray-900 rounded-sm shadow-xl border-y border-gray-700" />
             </div>

             {/* Glass Cylinder */}
             <div className="relative w-24 h-[200px] bg-white/20 backdrop-blur-md rounded-b-xl border-x-4 border-b-4 border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] flex flex-col justify-end z-10 overflow-hidden">
                
                {/* Gas Fill */}
                <div className="w-full transition-all duration-1000 ease-in-out bg-blue-500" style={{ height: `${volume}%`, opacity: gasDensityOpacity }} />
                
                {/* Precise Measurement Ticks */}
                <div className="absolute inset-0 pointer-events-none">
                   {[25, 50, 75, 100].map(v => (
                     <div key={v} className="absolute left-0 w-full" style={{ bottom: `${v}%` }}>
                       <div className="h-px bg-white/60 w-[15px]" />
                       <span className="absolute left-[20px] top-[-6px] text-[9px] font-mono text-white/90 font-bold drop-shadow-md">{v}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-40">Sealed Syringe</span>
          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default GasLawsBench;