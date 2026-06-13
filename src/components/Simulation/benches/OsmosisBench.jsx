import React, { useState, useEffect } from 'react';

// Helper component to render individual cells
const RedBloodCell = ({ state }) => {
  let baseStyle = "w-16 h-16 bg-red-500 transition-all duration-1000 ease-in-out ";
  let stateStyle = "";
  let clipPath = 'circle(50% at 50% 50%)';

  if (state === 'normal') {
    stateStyle = "rounded-full scale-100 shadow-[inset_0_0_20px_rgba(100,0,0,0.9)] opacity-100";
  } else if (state === 'swollen') {
    stateStyle = "rounded-full scale-[1.3] shadow-[inset_0_0_5px_rgba(100,0,0,0.3)] bg-red-400 opacity-90";
  } else if (state === 'shriveled') {
    stateStyle = "scale-[0.8] shadow-[inset_0_0_25px_rgba(50,0,0,0.9)] bg-red-700 drop-shadow-xl opacity-100";
    clipPath = 'polygon(50% 0%, 61% 16%, 86% 9%, 79% 30%, 98% 46%, 79% 59%, 84% 84%, 60% 77%, 45% 97%, 34% 77%, 10% 86%, 17% 62%, 0% 43%, 21% 30%, 12% 10%, 35% 18%)';
  } else {
    // Perfectly invisible before the sample is placed
    stateStyle = "scale-0 opacity-0"; 
  }

  return <div className={`${baseStyle} ${stateStyle}`} style={{ clipPath }} />;
};

const OsmosisBench = ({ 
  simState, 
  uiState,
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { hasSample, solutionType, cellState, isComplete } = simState;
  const { animating } = uiState || {};
  
  const target = currentStep?.targetElement;

  // Local state to handle the longer fluid wash independently of the engine's 700ms tick
  const [wash, setWash] = useState({ active: false, type: null });

  useEffect(() => {
    if (animating && (target === 'iso_drop' || target === 'hypo_drop' || target === 'hyper_drop')) {
      setWash({ active: true, type: target });
      const timer = setTimeout(() => setWash({ active: false, type: null }), 1500); 
      return () => clearTimeout(timer);
    }
  }, [animating, target]);

  const getWashColor = () => {
    if (wash.type === 'iso_drop') return 'via-gray-400/90';
    if (wash.type === 'hypo_drop') return 'via-cyan-400/90';
    if (wash.type === 'hyper_drop') return 'via-blue-600/90';
    return 'via-white/80';
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <style>{`
        @keyframes capillary-wash {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
      `}</style>

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-6">
        
        <div className="flex justify-center items-end gap-10 md:gap-14 h-[260px] relative w-full max-w-3xl mb-16">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/20 rounded-[100%] blur-md z-0" />

          {/* ── Left: Dropper Bottles ── */}
          <div className="flex gap-12 z-10 relative">
            
            {/* Isotonic */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className="flex flex-col items-center transition-all duration-300 group cursor-pointer"
                onClick={() => handleElementClick('iso_drop')}
              >
                <div className={`w-12 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-all duration-700 ease-in-out ${
                    target === 'iso_drop' && animating 
                      ? 'translate-x-[250px] -translate-y-[150px] rotate-[60deg] scale-110 z-30' 
                      : 'group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:border-white/80 z-10'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-t border border-gray-400" />
                  <div className="w-full h-[60%] bg-gray-300/40 border-t border-white/40"></div>
                </div>
              </div>
              <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-colors duration-300 group-hover:bg-white/20">0.9% NaCl</span>
            </div>

            {/* Hypotonic */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className="flex flex-col items-center transition-all duration-300 group cursor-pointer"
                onClick={() => handleElementClick('hypo_drop')}
              >
                <div className={`w-12 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-all duration-700 ease-in-out ${
                    target === 'hypo_drop' && animating 
                      ? 'translate-x-[150px] -translate-y-[150px] rotate-[60deg] scale-110 z-30' 
                      : 'group-hover:-translate-y-2 group-hover:scale-105 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(34,212,238,0.4)] z-10'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-t border border-gray-400" />
                  <div className="w-full h-[60%] bg-cyan-300/40 border-t border-white/40"></div>
                </div>
              </div>
              <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-colors duration-300 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40">Distilled H₂O</span>
            </div>

            {/* Hypertonic */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className="flex flex-col items-center transition-all duration-300 group cursor-pointer"
                onClick={() => handleElementClick('hyper_drop')}
              >
                <div className={`w-12 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-all duration-700 ease-in-out ${
                    target === 'hyper_drop' && animating 
                      ? 'translate-x-[50px] -translate-y-[150px] rotate-[60deg] scale-110 z-30' 
                      : 'group-hover:-translate-y-2 group-hover:scale-105 group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] z-10'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-t border border-gray-400" />
                  <div className="w-full h-[60%] bg-blue-500/40 border-t border-white/40"></div>
                </div>
              </div>
              <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-colors duration-300 group-hover:bg-blue-600/20 group-hover:border-blue-500/40">10% NaCl</span>
            </div>
            
          </div>

          {/* ── Center: Microscope View ── */}
          <div className="flex flex-col items-center z-10 relative ml-8">
            
            {/* Slide Prep Area */}
            <div 
              className={`absolute -bottom-8 w-48 h-12 bg-white/10 border-2 border-white/30 rounded shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center z-30 cursor-pointer hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:-translate-y-1`}
              onClick={() => handleElementClick('slide')}
            >
              <div className="w-8 h-8 rounded-full border border-white/40 bg-white/5 flex items-center justify-center shadow-inner">
                {hasSample && <div className="w-2 h-2 bg-red-500/50 rounded-full blur-[1px]"></div>}
              </div>
              <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-4 py-1 bg-black/40 rounded-full border border-white/10 whitespace-nowrap shadow-md">Microscope Stage</span>
            </div>

            {/* Huge Lens View */}
            <div className="relative w-64 h-64 rounded-full border-[12px] border-gray-800 shadow-[0_15px_35px_rgba(0,0,0,0.5),_inset_0_0_60px_rgba(0,0,0,0.9)] overflow-hidden bg-[#e2e8f0] flex items-center justify-center z-20 -translate-y-8">
              
              <div className={`absolute inset-0 transition-colors duration-1000 z-10 pointer-events-none mix-blend-multiply ${
                solutionType === 'Hypertonic' ? 'bg-blue-400/40' : 
                solutionType === 'Hypotonic' ? 'bg-cyan-300/40' : 
                solutionType === 'Isotonic' ? 'bg-gray-400/20' : 'bg-transparent'
              }`} />

              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="absolute z-20 -translate-x-2 -translate-y-4">
                <RedBloodCell state={cellState} />
              </div>
              <div className="absolute z-20 translate-x-12 translate-y-8 scale-[0.85] opacity-90">
                <RedBloodCell state={cellState} />
              </div>
              <div className="absolute z-20 -translate-x-16 translate-y-10 scale-[0.9] opacity-90">
                <RedBloodCell state={cellState} />
              </div>
              
              {wash.active && (
                <div className="absolute inset-0 z-30 pointer-events-none rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent ${getWashColor()} to-transparent blur-sm`}
                    style={{ animation: 'capillary-wash 1.5s ease-in-out forwards' }}
                  />
                </div>
              )}

            </div>
            
          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default OsmosisBench;