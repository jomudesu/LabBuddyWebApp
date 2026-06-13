import React from 'react';

const FlameTestBench = ({ 
  simState, 
  uiState,
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { isBurnerOn, flameColor, isComplete } = simState;
  const { animating } = uiState || {};
  
  const target = currentStep?.targetElement;
  const stepNumber = currentStep ? parseInt(currentStep.id.split('_')[1]) : 1;

  let wirePos = 'idle';
  
  if (isComplete) {
    wirePos = 'flame'; 
  } else if (stepNumber === 1) {
    wirePos = 'idle';
  } else if (stepNumber === 2) {
    wirePos = (target === 'sample_cu' && animating) ? 'cu' : 'idle';
  } else if (stepNumber === 3) {
    wirePos = (target === 'flame' && animating) ? 'flame' : 'cu';
  } else if (stepNumber === 4) {
    wirePos = (target === 'sample_sr' && animating) ? 'sr' : 'flame';
  } else if (stepNumber === 5) {
    wirePos = (target === 'flame' && animating) ? 'flame' : 'sr';
  }

  const getWireTransform = () => {
    switch(wirePos) {
      case 'cu': return 'translate(-117px, 100px) rotate(0deg)';
      case 'sr': return 'translate(-44px, 100px) rotate(0deg)';
      case 'flame': return 'translate(100px, -64px) rotate(-30deg)';
      case 'idle': 
      default: return 'translate(200px, -100px) rotate(45deg)'; 
    }
  };

  let tipColor = 'border-gray-400 bg-transparent';
  if ((stepNumber === 2 && wirePos === 'cu') || stepNumber === 3 || (stepNumber === 4 && wirePos === 'flame')) {
    tipColor = 'border-teal-400 bg-teal-400 shadow-[0_0_8px_#2dd4bf]';
  } else if (isComplete || (stepNumber === 4 && wirePos === 'sr') || stepNumber === 5) {
    tipColor = 'border-rose-400 bg-rose-400 shadow-[0_0_8px_#f87171]'; 
  }

  const displayColor = flameColor === 'green' ? '#4ade80' : 
                       flameColor === 'red' ? '#f87171' : 
                       '#38bdf8';

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-12">
        
        <div className="flex justify-center items-end gap-12 h-72 relative w-full max-w-lg mb-20">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-full h-12 bg-black/20 rounded-[100%] blur-md z-0" />

          {/* ── Animated Nichrome Wire ── */}
          <div 
            className={`absolute z-30 transition-all duration-700 ease-in-out flex flex-col items-center pointer-events-none origin-bottom ${
              wirePos === 'idle' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
            }`}
            style={{
              left: '50%',
              top: 0,
              height: '160px',
              marginLeft: '-6px',
              transform: getWireTransform(),
            }}
          >
            <div className="w-3 h-24 bg-white/40 backdrop-blur-sm border border-white/60 rounded-full shadow-inner" />
            <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-gray-500" />
            <div className={`w-3 h-3 rounded-full border-[3px] transition-colors duration-300 ${tipColor}`} />
          </div>

          {/* ── Sample Jars ── */}
          <div className="flex gap-6 z-10 mb-4">
            
            {/* Cu (II) */}
            <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => handleElementClick('sample_cu')}>
              <div className="flex flex-col items-center transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105">
                <div className="w-12 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-all duration-300 group-hover:border-teal-300 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                  <div className="w-full h-1/2 bg-teal-400/80 rounded-b-lg"></div>
                </div>
              </div>
              <span className="absolute -bottom-20 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-all duration-300 group-hover:bg-teal-500/20 group-hover:border-teal-500/30">
                Cu (II)
              </span>
            </div>

            {/* Sr (II) */}
            <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => handleElementClick('sample_sr')}>
              <div className="flex flex-col items-center transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105">
                <div className="w-12 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg shadow-inner relative overflow-hidden flex items-end transition-all duration-300 group-hover:border-rose-300 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                  <div className="w-full h-1/2 bg-rose-400/80 rounded-b-lg"></div>
                </div>
              </div>
              <span className="absolute -bottom-20 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-all duration-300 group-hover:bg-rose-500/20 group-hover:border-rose-500/30">
                Sr (II)
              </span>
            </div>
            
          </div>

          {/* ── Bunsen Burner ── */}
          <div className="flex flex-col items-center z-10 ml-8 relative">
            
            <div className="relative flex flex-col items-center justify-end">
              <div className={`absolute bottom-[90%] w-24 h-32 bg-slate-900/40 rounded-full blur-xl pointer-events-none transition-all duration-700 ${isBurnerOn ? 'opacity-100' : 'opacity-0'}`} />

              <div 
                className={`absolute bottom-full translate-y-1 w-12 h-32 rounded-[100%] origin-bottom transition-all duration-700 ease-in-out cursor-pointer flex justify-center z-20 ${
                  !isBurnerOn ? 'opacity-0 scale-y-0' : 'opacity-90 scale-y-100 hover:scale-x-110 hover:brightness-125 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                }`}
                style={{ 
                  background: `radial-gradient(ellipse at bottom, #ffffff 10%, ${displayColor} 50%, transparent 70%)`,
                  filter: `blur(2px) drop-shadow(0 0 15px ${displayColor})`
                }}
                onClick={() => handleElementClick('flame')}
              >
                {isBurnerOn && <div className="absolute bottom-1 w-5 h-12 bg-white rounded-[100%] blur-[2px]"></div>}
              </div>

              <div className="w-8 h-24 bg-gradient-to-r from-gray-300 via-white to-gray-400 border border-gray-400 z-30 shadow-lg"></div>
              
              <div className="w-16 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-lg z-30 relative flex justify-center">
                 <div 
                   className="absolute -left-3 top-1 w-6 h-2 bg-yellow-600 rounded cursor-pointer transition-all duration-300 hover:scale-125 hover:brightness-125 hover:shadow-[0_0_15px_rgba(202,138,4,0.6)]"
                   onClick={() => handleElementClick('burner_valve')}
                 ></div>
              </div>
              <div className="w-20 h-3 bg-gray-800 rounded-b-lg z-30 shadow-xl"></div>
            </div>

            <p className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Bunsen Burner</p>
          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default FlameTestBench;