import React from 'react';

const ElectrolysisBench = ({ 
  simState, 
  uiState,
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { hasElectrolyte, tubesPlaced, wiresConnected, powerOn } = simState;
  const { animating } = uiState || {};
  
  const target = currentStep?.targetElement;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-8">
        
        <div className="flex justify-center items-end gap-12 h-[320px] relative w-full max-w-2xl mb-20">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/30 rounded-[100%] blur-md z-0" />

          {/* ── Left: Electrolyte Bottle ── */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 group ${currentStep?.targetElement === 'electrolyte' ? 'pulse-glow hover:-translate-y-2' : ''}`}
              onClick={() => handleElementClick('electrolyte')}
            >
              <div className={`w-12 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-transform duration-700 ${target === 'electrolyte' && animating ? 'translate-x-[100px] -translate-y-[160px] rotate-[60deg]' : ''}`}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-300 rounded-t-sm" />
                <div className="w-full h-[50%] bg-transparent border-t border-white/40"></div>
              </div>
            </div>
            <span className="absolute -bottom-20 text-[11px] font-bold text-white px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap">H₂SO₄</span>
          </div>

          {/* ── Center: Beaker & Apparatus ── */}
          <div className="flex flex-col items-center relative z-10">
            
            <svg className={`absolute top-[0px] left-[-30px] w-[400px] h-[300px] pointer-events-none z-0 transition-opacity duration-700 ${wiresConnected ? 'opacity-100' : 'opacity-0'}`}>
               <path d="M 102 200 Q 160 260, 307 140" fill="transparent" stroke="#333" strokeWidth="4" strokeLinecap="round" />
               <path d="M 150 200 Q 220 260, 345 140" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            </svg>

            {/* Beaker Container */}
            <div className="relative w-48 h-44 z-10 group flex justify-center">
              
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-b-[2rem] border-x border-b border-white/20 overflow-hidden z-10">
                <div className={`absolute bottom-0 w-full h-[60%] rounded-b-[1.8rem] transition-colors duration-1000 ${hasElectrolyte ? 'bg-blue-500/30' : 'bg-blue-300/20'}`} />
              </div>

              <div className="absolute -bottom-6 flex gap-6 z-20">
                {/* Cathode (Left) */}
                <div className="relative flex flex-col items-center justify-end h-[160px]">
                  <div 
                    className={`absolute top-0 w-8 h-28 bg-white/20 backdrop-blur-sm border-x-2 border-t-2 border-white/60 rounded-t-full overflow-hidden transition-all duration-700 cursor-pointer z-30 ${
                      tubesPlaced || (target === 'test_tubes' && animating) ? 'translate-y-0 opacity-100' : 
                      (target === 'test_tubes' && !animating) ? '-translate-y-16 opacity-100 pulse-glow !rounded-t-full' : 
                      'opacity-0 -translate-y-10 pointer-events-none'
                    }`}
                    onClick={() => handleElementClick('test_tubes')}
                  >
                    <div className={`absolute bottom-0 w-full transition-all duration-[3000ms] ease-in-out bg-blue-500/40`} style={{ height: powerOn ? '20%' : '100%' }}></div>
                    {powerOn && (
                      <div className="absolute bottom-2 left-0 w-full h-full flex justify-around">
                         <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
                         <div className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                         <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDuration: '1s' }} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center z-20">
                    <div className="w-3 h-20 bg-gray-800 rounded-t-sm shadow-inner border border-gray-600" />
                    <div className="w-6 h-5 bg-amber-800 rounded-b-md border border-amber-900 shadow-lg" />
                    <div className={`w-1.5 h-2 bg-gray-400 rounded-b-sm transition-colors duration-700 ${wiresConnected ? 'bg-gray-900' : ''}`} />
                  </div>
                </div>

                {/* Anode (Right) */}
                <div className="relative flex flex-col items-center justify-end h-[160px]">
                  
                  {/* CHANGED: Brought back pulse-glow and added !rounded-t-full to force the correct shape */}
                  <div 
                    className={`absolute top-0 w-8 h-28 bg-white/20 backdrop-blur-sm border-x-2 border-t-2 border-white/60 rounded-t-full overflow-hidden transition-all duration-700 cursor-pointer z-30 ${
                      tubesPlaced || (target === 'test_tubes' && animating) ? 'translate-y-0 opacity-100' : 
                      (target === 'test_tubes' && !animating) ? '-translate-y-16 opacity-100 pulse-glow !rounded-t-full' : 
                      'opacity-0 -translate-y-10 pointer-events-none'
                    }`}
                    onClick={() => handleElementClick('test_tubes')}
                  >
                    <div className={`absolute bottom-0 w-full transition-all duration-[3000ms] ease-in-out bg-blue-500/40`} style={{ height: powerOn ? '60%' : '100%' }}></div>
                    {powerOn && (
                      <div className="absolute bottom-2 left-0 w-full h-full flex justify-around">
                         <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
                         <div className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDuration: '1.5s' }} />
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center z-20">
                    <div className="w-3 h-20 bg-gray-800 rounded-t-sm shadow-inner border border-gray-600" />
                    <div className="w-6 h-5 bg-amber-800 rounded-b-md border border-amber-900 shadow-lg" />
                    <div className={`w-1.5 h-2 bg-gray-400 rounded-b-sm transition-colors duration-700 ${wiresConnected ? 'bg-red-500' : ''}`} />
                  </div>
                </div>

              </div>

              <div className="absolute inset-0 rounded-b-[2rem] border-x-2 border-b-2 border-white/60 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4)] pointer-events-none z-30" />
            </div>
            
            <p className="absolute -bottom-20 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Water + Electrolyte</p>
          </div>

          {/* ── Right: DC Power Supply (Battery) ── */}
          <div className="flex flex-col items-center relative z-10 ml-4">
            
            <div className="relative w-20 h-28 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-lg shadow-xl border border-yellow-400 flex flex-col items-center pt-2">
               
               <div className="mt-2 w-12 h-8 bg-white/20 rounded flex items-center justify-center border border-white/30">
                 <span className="text-xs font-bold text-white shadow-sm">9V DC</span>
               </div>

               <div 
                 className={`mt-4 w-10 h-5 bg-black/50 rounded-full border border-white/20 relative cursor-pointer transition-all ${currentStep?.targetElement === 'power_switch' ? 'pulse-glow ring-2 ring-white/50' : ''}`}
                 onClick={() => handleElementClick('power_switch')}
               >
                 <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${powerOn ? 'bg-green-400 right-0.5 shadow-[0_0_8px_#4ade80]' : 'bg-red-400 left-0.5'}`}></div>
               </div>

               <div className="absolute -bottom-3 left-3 w-4 h-3 bg-gray-400 rounded-b-sm border border-gray-500 flex items-center justify-center">
                 <span className="text-[8px] font-bold text-gray-800">-</span>
               </div>
               <div className="absolute -bottom-3 right-3 w-4 h-3 bg-red-400 rounded-b-sm border border-red-500 flex items-center justify-center">
                 <span className="text-[8px] font-bold text-white">+</span>
               </div>
            </div>

            <div 
              className={`flex gap-4 mt-4 cursor-pointer transition-all duration-700 ${wiresConnected || (target === 'wires' && animating) ? 'opacity-0 -translate-y-6' : 'opacity-100'} ${currentStep?.targetElement === 'wires' ? 'pulse-glow hover:-translate-y-2' : ''}`}
              onClick={() => handleElementClick('wires')}
            >
              <div className="w-1 h-8 bg-gray-800 rounded-b-full shadow-lg"></div>
              <div className="w-1 h-8 bg-red-500 rounded-b-full shadow-lg"></div>
            </div>

            <span className="absolute -bottom-20 text-[11px] font-bold text-white px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap">Power Supply</span>
          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default ElectrolysisBench;