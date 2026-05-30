import React from 'react';

const ChromatographyBench = ({ 
  simState, 
  uiState,
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { hasLine, hasSpot, isSuspended, isCovered, isComplete } = simState;
  const { animating } = uiState || {};
  
  const target = currentStep?.targetElement;
  const isTarget = (id) => target === id && !isComplete;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* NEW: Embedded CSS for the custom multi-stage dipping animation */}
      <style>{`
        @keyframes dip-paper {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          40% { transform: translate(60px, -100px) scale(1.05) rotate(5deg); } /* Lift up and tilt */
          70% { transform: translate(144px, -100px) scale(1.05) rotate(0deg); } /* Hover straight over beaker */
          100% { transform: translate(144px, -24px) scale(1) rotate(0deg); } /* Dip straight down */
        }
      `}</style>

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-6">
        
        {/* Unified Baseline Layout */}
        <div className="flex justify-center items-end gap-12 h-[260px] relative w-full max-w-4xl mb-16">
          
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/20 rounded-[100%] blur-md z-0" />

          {/* 1. Pencil */}
          <div className="flex flex-col items-center relative z-40 w-12">
            <div 
              className={`flex flex-col items-center transition-all duration-700 z-40 ${target === 'pencil' && animating ? 'translate-x-[200px] -translate-y-[20px]' : ''}`}
            >
              <div 
                className={`flex flex-col items-center cursor-pointer transition-all duration-500 group origin-bottom-right ${isTarget('pencil') ? 'pulse-glow hover:-translate-y-2' : ''} ${target === 'pencil' && animating ? '-rotate-45' : ''}`}
                onClick={() => isTarget('pencil') && handleElementClick('pencil')}
              >
                <div className="w-3 h-4 bg-pink-400 rounded-t-sm shadow-inner" />
                <div className="w-3 h-2 bg-gray-300" />
                <div className="w-3 h-16 bg-yellow-400 shadow-inner" />
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-l-transparent border-r-transparent border-t-yellow-200 relative">
                   <div className="absolute -top-[12px] -left-[2px] w-0 h-0 border-l-[2px] border-r-[2px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Pencil</span>
          </div>

          {/* 2. Ink Dropper */}
          <div className="flex flex-col items-center relative z-40 w-12">
             <div 
              className={`flex flex-col items-center transition-all duration-700 z-40 ${target === 'ink_dropper' && animating ? 'translate-x-[104px] -translate-y-[20px]' : ''}`}
            >
              <div 
                className={`flex flex-col items-center cursor-pointer transition-all duration-500 group origin-bottom-right ${isTarget('ink_dropper') ? 'pulse-glow hover:-translate-y-2' : ''} ${target === 'ink_dropper' && animating ? '-rotate-12' : ''}`}
                onClick={() => isTarget('ink_dropper') && handleElementClick('ink_dropper')}
              >
                <div className="w-6 h-6 bg-gray-800 rounded-full z-10 shadow-md" />
                <div className="w-3 h-16 bg-white/20 border border-white/50 rounded-b-sm relative z-0 -mt-2 flex flex-col justify-end overflow-hidden backdrop-blur-sm">
                  <div className="w-full h-8 bg-gray-900" />
                </div>
              </div>
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20">Black Ink</span>
          </div>

          {/* 3. Chromatography Paper */}
          <div className="flex flex-col items-center relative z-10 w-16">
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-700 ease-in-out group z-10 ${isTarget('paper') ? 'pulse-glow hover:-translate-y-2' : ''} ${isSuspended ? 'translate-x-[144px] -translate-y-6' : ''}`}
              style={target === 'paper' && animating ? { animation: 'dip-paper 0.7s ease-in-out forwards' } : {}}
              onClick={() => isTarget('paper') && handleElementClick('paper')}
            >
              <div className="w-12 h-32 bg-[#f8f9fa] shadow-md border border-gray-200/50 relative overflow-hidden rounded-sm">
                
                {/* Pencil Line */}
                <div className={`absolute bottom-5 w-full h-px bg-gray-500 transition-opacity duration-500 ${hasLine ? 'opacity-100' : 'opacity-0'}`} />

                {/* Base Black Ink Spot */}
                <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rounded-full transition-all duration-1000 ${hasSpot && !isCovered ? 'bottom-[18px] opacity-100' : 'bottom-[18px] opacity-0'}`} />

                {/* Developed Separation Bands */}
                <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full transition-all duration-[6000ms] ease-out mix-blend-multiply ${isCovered ? 'bottom-[80%] opacity-80 scale-[1.5]' : 'bottom-[18px] opacity-0 scale-50'}`} />
                <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full transition-all duration-[4500ms] ease-out mix-blend-multiply ${isCovered ? 'bottom-[55%] opacity-80 scale-[1.2]' : 'bottom-[18px] opacity-0 scale-50'}`} />
                <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full transition-all duration-[3000ms] ease-out mix-blend-multiply ${isCovered ? 'bottom-[35%] opacity-80 scale-100' : 'bottom-[18px] opacity-0 scale-50'}`} />

                {/* Solvent Front Rising Effect */}
                <div className={`absolute bottom-0 w-full bg-cyan-200/40 transition-all duration-[6000ms] ease-out border-t border-cyan-300/60 ${isCovered ? 'h-[90%]' : isSuspended ? 'h-[15%]' : 'h-0 opacity-0'}`} />
              </div>
            </div>
            {/* CHANGED: Label now fades out instantly when the animation starts, instead of waiting for it to finish */}
            <span className={`absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-opacity duration-500 ${isSuspended || (target === 'paper' && animating) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Filter Paper</span>
          </div>

          {/* 4. Beaker & Solvent */}
          <div className="flex flex-col items-center relative z-20 w-32">
            <div className="relative w-32 h-40 flex justify-center">
               {/* Beaker Back & Liquid */}
               <div className="absolute inset-0 bg-white/5 rounded-b-2xl z-0" />
               <div className="absolute bottom-0 w-full h-8 bg-cyan-100/30 rounded-b-[14px] z-0 border-t border-cyan-200/40" />

               {/* Beaker Front Glass layer */}
               <div className="absolute inset-0 border-x-2 border-b-2 border-white/60 rounded-b-2xl shadow-[inset_0_4px_15px_rgba(255,255,255,0.4)] backdrop-blur-[1px] pointer-events-none z-30" />
            </div>
            <span className="absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-40">Solvent</span>
          </div>

          {/* 5. Watch Glass */}
          <div className="flex flex-col items-center relative z-40 w-36">
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-700 ease-in-out group z-40 ${isTarget('watch_glass') ? 'pulse-glow hover:-translate-y-2' : ''} ${isCovered || (target === 'watch_glass' && animating) ? '-translate-x-[184px] -translate-y-[158px]' : ''}`}
              onClick={() => isTarget('watch_glass') && handleElementClick('watch_glass')}
            >
              {/* Watch Glass curve shape */}
              <div className="w-36 h-6 bg-white/20 backdrop-blur-md rounded-b-[50%] border-b-2 border-x border-white/60 shadow-lg" />
            </div>
            <span className={`absolute -bottom-16 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-20 transition-opacity duration-500 ${isCovered || (target === 'watch_glass' && animating) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Watch Glass</span>
          </div>

        </div>
      </div>

      {children}
    </div>
  );
};

export default ChromatographyBench;