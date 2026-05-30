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
        <div className="flex justify-center items-end gap-16 h-80 relative w-full max-w-lg">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/30 rounded-[100%] blur-md z-0" />

          {/* ── Apparatus Setup (Hot plate & Beaker) ── */}
          <div className="flex flex-col items-center z-10 relative">
            
            {/* Suspended Seed Crystal & String */}
            <div 
              className={`absolute top-[-80px] z-20 flex flex-col items-center transition-all duration-1000 ease-in-out cursor-pointer ${
                crystalState !== 'none' ? 'translate-y-[120px]' : 'translate-y-0'
              } ${currentStep?.targetElement === 'seed_string' ? 'pulse-glow hover:-translate-y-2' : ''}`}
              onClick={() => handleElementClick('seed_string')}
            >
              {/* String */}
              <div className="w-0.5 h-24 bg-gray-300"></div>
              {/* The Crystal (Scales up when grown!) */}
              <div 
                className={`w-6 h-8 bg-blue-500 border border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-in-out ${
                  crystalState === 'grown' ? 'scale-[2.5] bg-blue-600' : crystalState === 'seed' ? 'scale-100' : 'scale-0'
                }`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
            </div>

            {/* Beaker */}
            <div className="relative w-40 h-40 z-10 group mb-1">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-b-3xl border-x-2 border-b-2 border-white/60 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4)]">
                {/* Water Level */}
                <div 
                  className="absolute bottom-0 w-full h-[70%] rounded-b-3xl transition-colors duration-1000 ease-in-out" 
                  style={{ backgroundColor: waterColor }}
                />
                
                {/* Steam effect when heated */}
                <div className={`absolute top-0 w-full h-10 transition-opacity duration-700 flex justify-around ${isHeaterOn ? 'opacity-50' : 'opacity-0'}`}>
                  <div className="w-1 h-8 bg-white/50 blur-sm animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-12 bg-white/50 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-1 h-6 bg-white/50 blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>

            {/* Hot Plate */}
            <div 
              className={`relative flex flex-col items-center cursor-pointer transition-all ${currentStep?.targetElement === 'hot_plate' ? 'pulse-glow ring-2 ring-yellow-400 rounded-xl' : ''}`}
              onClick={() => handleElementClick('hot_plate')}
            >
              {/* Heating Pad */}
              <div className="w-44 h-4 bg-gray-800 rounded-t-xl z-20 flex justify-center overflow-hidden border-t border-gray-600">
                <div className={`w-32 h-full transition-colors duration-700 ${isHeaterOn ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-gray-700'}`}></div>
              </div>
              {/* Main Body */}
              <div className="w-48 h-12 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-xl z-20 shadow-lg border border-gray-400 flex items-center justify-between px-6">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                {/* Dial */}
                <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 relative shadow-inner">
                  <div className={`absolute top-1 left-1/2 w-1 h-2 bg-white transition-transform duration-500 origin-bottom ${isHeaterOn ? 'rotate-[120deg]' : 'rotate-0'}`}></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/90 mt-4 font-semibold tracking-wide bg-black/30 border border-white/10 px-3 py-1 rounded-full shadow-md z-20">Hot Plate</p>
          </div>

          {/* ── Tools (Solute & Stirrer) ── */}
          <div className="flex flex-col gap-6 z-10 mb-8">
            
            {/* CuSO4 Powder Jar */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 group ${currentStep?.targetElement === 'solute_jar' ? 'pulse-glow hover:-translate-y-2' : ''}`}
              onClick={() => handleElementClick('solute_jar')}
            >
              <div className={`w-16 h-20 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-transform duration-500 ${target === 'solute_jar' && animating ? '-translate-x-12 -translate-y-12 -rotate-45' : ''}`}>
                {/* Powder disappears when poured */}
                <div className={`w-full transition-all duration-1000 bg-blue-500 rounded-b-lg ${simState.saturation !== 'None' ? 'h-0' : 'h-1/2'}`}></div>
              </div>
              <span className="text-[10px] font-bold text-white mt-2 px-2 py-1 bg-black/40 rounded border border-white/10">CuSO₄</span>
            </div>

            {/* Stirring Rod */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 group ${currentStep?.targetElement === 'stirring_rod' ? 'pulse-glow hover:-translate-x-2' : ''}`}
              onClick={() => handleElementClick('stirring_rod')}
            >
              <div className={`w-2 h-32 bg-white/40 backdrop-blur-md border border-white/60 rounded-full shadow-inner transition-transform duration-700 ${target === 'stirring_rod' && animating ? '-translate-x-32 translate-y-8 rotate-12 animate-pulse' : 'rotate-[20deg]'}`}></div>
              <span className="text-[10px] font-bold text-white mt-2 px-2 py-1 bg-black/40 rounded border border-white/10">Glass Rod</span>
            </div>

          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default CrystalGrowthBench;