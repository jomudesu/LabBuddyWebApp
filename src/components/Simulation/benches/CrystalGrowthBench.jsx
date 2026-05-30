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
            
            <div 
              className={`absolute top-[-80px] z-20 flex flex-col items-center transition-all duration-1000 ease-in-out cursor-pointer ${
                crystalState !== 'none' ? 'translate-y-[70px]' : 'translate-y-0'
              } ${currentStep?.targetElement === 'seed_string' ? 'pulse-glow hover:-translate-y-2' : ''}`}
              onClick={() => handleElementClick('seed_string')}
            >
              <div className="w-0.5 h-24 bg-gray-300"></div>
              
              <div 
                className={`w-6 h-8 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-in-out ${
                  crystalState === 'grown' 
                    ? 'scale-[2.5] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700' 
                    : crystalState === 'seed' 
                      ? 'scale-100 bg-blue-500' 
                      : 'scale-0'
                }`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
            </div>

            <div className="relative w-40 h-40 z-10 group mb-1">
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

            <div 
              className={`relative flex flex-col items-center cursor-pointer transition-all ${currentStep?.targetElement === 'hot_plate' ? 'pulse-glow ring-2 ring-yellow-400 rounded-xl' : ''}`}
              onClick={() => handleElementClick('hot_plate')}
            >
              <div className="w-44 h-4 bg-gray-800 rounded-t-xl z-20 flex justify-center overflow-hidden border-t border-gray-600">
                <div className={`w-32 h-full transition-colors duration-700 ${isHeaterOn ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-gray-700'}`}></div>
              </div>
              <div className="w-48 h-12 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-xl z-20 shadow-lg border border-gray-400 flex items-center justify-between px-6">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 relative shadow-inner">
                  <div className={`absolute top-1 left-1/2 w-1 h-2 bg-white transition-transform duration-500 origin-bottom ${isHeaterOn ? 'rotate-[120deg]' : 'rotate-0'}`}></div>
                </div>
              </div>
            </div>
            <p className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Hot Plate</p>
          </div>

          {/* ── Tools (Solute & Stirrer) ── */}
          <div className="flex flex-row items-end gap-12 z-10 mb-8">
            
            {/* CuSO4 Powder Jar */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`flex flex-col items-center cursor-pointer transition-all duration-500 group ${
                  target === 'solute_jar' && animating 
                    ? '-translate-x-[100px] -translate-y-[150px] -rotate-45' 
                    : currentStep?.targetElement === 'solute_jar' ? 'hover:-translate-y-2' : ''
                } ${currentStep?.targetElement === 'solute_jar' ? 'pulse-glow' : ''}`}
                onClick={() => handleElementClick('solute_jar')}
              >
                <div className="w-16 h-20 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end">
                  <div className={`w-full transition-all duration-1000 bg-blue-500 rounded-b-lg ${simState.saturation !== 'None' ? 'h-0' : 'h-1/2'}`}></div>
                </div>
              </div>
              <span className="absolute -bottom-24 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">CuSO₄</span>
            </div>

            {/* Stirring Rod */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`flex flex-col items-center cursor-pointer transition-all duration-700 group origin-center ${
                  target === 'stirring_rod' && animating 
                    ? '-translate-x-[230px] -translate-y-[130px] rotate-12 animate-pulse' 
                    : `rotate-[20deg] ${currentStep?.targetElement === 'stirring_rod' ? 'hover:-translate-y-2' : ''}`
                } ${currentStep?.targetElement === 'stirring_rod' ? 'pulse-glow' : ''}`}
                onClick={() => handleElementClick('stirring_rod')}
              >
                <div className="w-2 h-32 bg-white/40 backdrop-blur-md border border-white/60 rounded-full shadow-inner"></div>
              </div>
              <span className="absolute -bottom-24 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Glass Rod</span>
            </div>

          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default CrystalGrowthBench;