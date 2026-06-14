import React from 'react';

const CrystalGrowthBench = ({ 
  simState, 
  uiState,
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { isHeaterOn, waterColor, crystalState } = simState;
  const { animating } = uiState || {};
  
  const target = currentStep?.targetElement;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-12">
        
        <div className="flex justify-center items-end gap-16 h-80 relative w-full max-w-lg mb-20">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/30 rounded-[100%] blur-md z-0" />

          {/* ── Apparatus Setup (Hot plate & Beaker) ── */}
          <div className="flex flex-col items-center z-10 relative">
            
            {/* Seed String */}
            <div 
              className={`absolute top-[-80px] z-20 flex flex-col items-center transition-all duration-1000 ease-in-out cursor-pointer group ${
                crystalState !== 'none' ? 'translate-y-[70px]' : 'translate-y-0 hover:translate-y-[5px]'
              }`}
              onClick={() => handleElementClick('seed_string')}
            >
              <span className="absolute -top-10 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-colors duration-300 group-hover:bg-white/20">Seed Crystal</span>

              <div className="w-0.5 h-24 bg-gray-300 transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              
              <div 
                className={`w-6 h-8 transition-all duration-1000 ease-in-out ${
                  crystalState === 'grown' 
                    ? 'scale-[2.5] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
                    : crystalState === 'seed' 
                      ? 'scale-100 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-125 group-hover:brightness-125' 
                      : 'scale-0'
                }`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
            </div>

            {/* Beaker */}
            <div className="relative w-40 h-40 z-10 mb-1">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-b-3xl border-x-2 border-b-2 border-white/60 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4)]">
                <div 
                  className="absolute bottom-0 w-full h-[70%] rounded-b-3xl transition-colors duration-1000 ease-in-out" 
                  style={{ backgroundColor: waterColor }}
                />
                
                <div className={`absolute top-0 w-full h-10 transition-opacity duration-700 flex justify-around ${isHeaterOn ? 'opacity-50' : 'opacity-0'}`}>
                  <div className="w-1 h-8 bg-white/50 blur-sm animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-12 bg-white/50 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-1 h-6 bg-white/50 blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>

            {/* Hot Plate */}
            <div 
              className="relative flex flex-col items-center cursor-pointer transition-all group"
              onClick={() => handleElementClick('hot_plate')}
            >
              <div className="w-44 h-4 bg-gray-800 rounded-t-xl z-20 flex justify-center overflow-hidden border-t border-gray-600 transition-all duration-300 group-hover:border-red-400">
                <div className={`w-32 h-full transition-colors duration-700 ${isHeaterOn ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-gray-700 group-hover:bg-gray-600'}`}></div>
              </div>
              <div className="w-48 h-12 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-xl z-20 shadow-lg border border-gray-400 flex items-center justify-between px-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                <div className={`w-3 h-3 rounded-full shadow-[0_0_5px_#22c55e] transition-all duration-300 ${isHeaterOn ? 'bg-green-400 shadow-[0_0_15px_#4ade80]' : 'bg-green-700'}`}></div>
                <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 relative shadow-inner transition-all duration-300 group-hover:border-gray-400">
                  <div className={`absolute top-1 left-1/2 w-1 h-2 bg-white transition-transform duration-500 origin-bottom ${isHeaterOn ? 'rotate-[120deg] shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'rotate-0'}`}></div>
                </div>
              </div>
            </div>
            <p className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Hot Plate</p>
          </div>

          {/* ── Tools (Solute & Stirrer) ── */}
          <div className="flex flex-row items-end gap-20 z-10 mb-8">
            
            {/* CuSO4 Powder Jar */}
            <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => handleElementClick('solute_jar')}>
              <div className={`flex flex-col items-center transition-all duration-500 ${
                  target === 'solute_jar' && animating 
                    ? '-translate-x-[100px] -translate-y-[150px] -rotate-45' 
                    : 'group-hover:-translate-y-2 group-hover:scale-105'
                }`}
              >
                <div className="w-16 h-20 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <div className={`w-full transition-all duration-1000 bg-blue-500 rounded-b-lg ${simState.saturation !== 'None' ? 'h-0' : 'h-1/2'}`}></div>
                </div>
              </div>
              <span className="absolute -bottom-24 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-colors duration-300 group-hover:bg-blue-500/30 group-hover:border-blue-500/50">CuSO₄</span>
            </div>

            {/* Stirring Rod */}
            <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => handleElementClick('stirring_rod')}>
              <div 
                className={`flex flex-col items-center transition-all duration-700 origin-center ${
                  target === 'stirring_rod' && animating 
                    ? '-translate-x-[230px] -translate-y-[130px] rotate-12 animate-pulse' 
                    : `rotate-[20deg] group-hover:-translate-y-2 group-hover:scale-105 group-hover:rotate-[25deg]`
                }`}
              >
                <div className="w-2 h-32 bg-white/40 backdrop-blur-md border border-white/60 rounded-full shadow-inner transition-all duration-300 group-hover:bg-white/70 group-hover:border-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.7)]"></div>
              </div>
              <span className="absolute -bottom-24 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-colors duration-300 group-hover:bg-white/20">Glass Rod</span>
            </div>

          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default CrystalGrowthBench;