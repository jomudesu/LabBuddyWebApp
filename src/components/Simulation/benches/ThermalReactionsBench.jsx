import React from 'react';

const ThermalReactionsBench = ({ simState, uiState, currentStep, handleElementClick, children }) => {
  const { thermometerPos, tempA, tempB, cacl2Added, nh4no3Added } = simState;
  const { animating } = uiState || {};
  const target = currentStep?.targetElement;

  const getThermometerTransform = () => {
    switch(thermometerPos) {
      case 'beaker_a': return 'translateX(calc(-50% - 80px)) translateY(-40px)';
      case 'beaker_b': return 'translateX(calc(-50% + 80px)) translateY(-40px)';
      case 'idle':
      default: return 'translateX(calc(-50% - 240px)) translateY(0px)'; // Rests on the far left side
    }
  };

  const getThermometerValue = () => {
    if (thermometerPos === 'beaker_a') return tempA;
    if (thermometerPos === 'beaker_b') return tempB;
    return 25.0; // Ambient room temp
  };

  const getCacl2Transform = () => {
    if (target === 'cacl2_bottle' && animating) {
       // Pours precisely into the center of Beaker A (-80px)
       return 'translateX(calc(-50% - 30px)) translateY(-100px) rotate(-60deg) scale(1.1)';
    }
    // Rests precisely on the right side
    return 'translateX(calc(-50% + 190px)) translateY(0px) rotate(0deg) scale(1)';
  };

  const getNh4no3Transform = () => {
    if (target === 'nh4no3_bottle' && animating) {
       // Pours precisely into the center of Beaker B (+80px)
       return 'translateX(calc(-50% + 130px)) translateY(-100px) rotate(-60deg) scale(1.1)';
    }
    // Rests perfectly beside the other bottle
    return 'translateX(calc(-50% + 250px)) translateY(0px) rotate(0deg) scale(1)';
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[500px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <style>{`
        @keyframes powder-pour {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(80px) scale(0); opacity: 0; }
        }
      `}</style>

      <div className="relative z-10 w-full flex flex-col items-center justify-center mt-12 flex-1">
        
        <div className="relative w-full max-w-3xl h-[280px] mb-8">
          
          {/* Base Shadow */}
          <div className="absolute bottom-[0px] left-1/2 -translate-x-1/2 w-[80%] h-12 bg-black/30 rounded-[100%] blur-md z-0" />

          {/* ── Dynamic Thermometer ── */}
          <div 
            className="absolute bottom-0 left-1/2 z-30 transition-transform duration-1000 ease-in-out cursor-pointer flex flex-col items-center w-[60px]"
            style={{ transform: getThermometerTransform() }}
            onClick={() => handleElementClick(thermometerPos === 'idle' ? 'thermometer_idle' : 'thermometer_a')}
          >
            <div className={`flex flex-col items-center transition-all duration-300 ${target?.includes('thermometer') ? 'hover:-translate-y-2 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110' : ''}`}>
               <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-2 shadow-xl mb-1 flex items-center justify-center min-w-[60px]">
                 <span className={`font-mono text-sm font-bold ${getThermometerValue() > 30 ? 'text-red-400' : getThermometerValue() < 20 ? 'text-blue-400' : 'text-green-400'}`}>{getThermometerValue().toFixed(1)}</span>
               </div>
               <div className="w-2 h-24 bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-inner flex justify-center overflow-hidden">
                  <div className="w-1 h-full bg-red-500/80 rounded-full mt-auto" style={{ height: `${Math.min(100, Math.max(10, (getThermometerValue()/100)*100))}%`, transition: 'height 1s ease-in-out' }}/>
               </div>
               <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-400 -mt-1 shadow-md" />
            </div>
            {thermometerPos === 'idle' && <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 whitespace-nowrap">Digital Thermometer</span>}
          </div>

          {/* ── Beaker A (Exothermic) ── */}
          <div className="absolute bottom-0 left-1/2 flex flex-col items-center w-32 z-20" style={{ transform: 'translateX(calc(-50% - 80px))' }}>
            <div className={`relative w-32 h-32 bg-white/20 backdrop-blur-md rounded-b-[1.5rem] border-x-2 border-b-2 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4)] overflow-hidden transition-all duration-1000 ${cacl2Added ? 'border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-white/60'}`}>
               <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-white/60 to-transparent z-20" />
               <div className={`absolute bottom-0 w-full h-[60%] transition-colors duration-[2000ms] ${cacl2Added ? 'bg-gradient-to-b from-red-500/20 to-red-500/60' : 'bg-blue-300/20'}`} />
               {cacl2Added && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-white/30 blur-sm rounded-full animate-ping" />}
            </div>
            <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-40">Beaker A</span>
          </div>

          {/* ── Beaker B (Endothermic) ── */}
          <div className="absolute bottom-0 left-1/2 flex flex-col items-center w-32 z-20" style={{ transform: 'translateX(calc(-50% + 80px))' }}>
            <div className={`relative w-32 h-32 bg-white/20 backdrop-blur-md rounded-b-[1.5rem] border-x-2 border-b-2 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4)] overflow-hidden transition-all duration-1000 ${nh4no3Added ? 'border-cyan-300/80 shadow-[0_0_30px_rgba(103,232,249,0.5)]' : 'border-white/60'}`}>
               <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-white/60 to-transparent z-20" />
               <div className={`absolute bottom-0 w-full h-[60%] transition-colors duration-[2000ms] ${nh4no3Added ? 'bg-gradient-to-b from-cyan-300/30 to-blue-600/70' : 'bg-blue-300/20'}`} />
               {nh4no3Added && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-50" />}
            </div>
            <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap z-40">Beaker B</span>
          </div>

          {/* ── CaCl₂ Bottle (Pours into A) ── */}
          <div 
            className="absolute bottom-0 left-1/2 flex flex-col items-center transition-all duration-700 ease-in-out origin-bottom-right z-40 cursor-pointer"
            style={{ transform: getCacl2Transform(), zIndex: target === 'cacl2_bottle' && animating ? 50 : 40 }}
            onClick={() => handleElementClick('cacl2_bottle')}
          >
            <div className={`relative flex flex-col items-center group ${cacl2Added && !(target === 'cacl2_bottle' && animating) ? 'opacity-80' : ''} ${!(target === 'cacl2_bottle' && animating) ? 'hover:-translate-y-2 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all' : ''}`}>
              
              {/* ✨ FIX: Animated Powder pouring effect */}
              {target === 'cacl2_bottle' && animating && (
                <div className="absolute -left-4 top-[5px] w-3 h-3 bg-white/80 blur-[1px] rounded-full" style={{ animation: 'powder-pour 0.7s ease-in forwards' }} />
              )}
              
              <div className="w-10 h-14 bg-white/30 backdrop-blur-md rounded border border-white/50 shadow-inner overflow-hidden flex items-end">
                <div className={`w-full bg-red-400 transition-all duration-1000 ${cacl2Added && !(target === 'cacl2_bottle' && animating) ? 'h-0' : 'h-1/2'}`} />
              </div>
              <span className="absolute -bottom-10 text-[10px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 whitespace-nowrap">CaCl₂</span>
            </div>
          </div>

          {/* ── NH₄NO₃ Bottle (Pours into B) ── */}
          <div 
            className="absolute bottom-0 left-1/2 flex flex-col items-center transition-all duration-700 ease-in-out origin-bottom-right z-40 cursor-pointer"
            style={{ transform: getNh4no3Transform(), zIndex: target === 'nh4no3_bottle' && animating ? 50 : 40 }}
            onClick={() => handleElementClick('nh4no3_bottle')}
          >
            <div className={`relative flex flex-col items-center group ${nh4no3Added && !(target === 'nh4no3_bottle' && animating) ? 'opacity-80' : ''} ${!(target === 'nh4no3_bottle' && animating) ? 'hover:-translate-y-2 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(103,232,249,0.5)] transition-all' : ''}`}>
              
              {target === 'nh4no3_bottle' && animating && (
                <div className="absolute -left-4 top-[5px] w-3 h-3 bg-white/80 blur-[1px] rounded-full" style={{ animation: 'powder-pour 0.7s ease-in forwards' }} />
              )}

              <div className="w-10 h-14 bg-white/30 backdrop-blur-md rounded border border-white/50 shadow-inner overflow-hidden flex items-end">
                <div className={`w-full bg-cyan-300 transition-all duration-1000 ${nh4no3Added && !(target === 'nh4no3_bottle' && animating) ? 'h-0' : 'h-1/2'}`} />
              </div>
              <span className="absolute -bottom-10 text-[10px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 whitespace-nowrap">NH₄NO₃</span>
            </div>
          </div>

        </div>

      </div>
      {children}
    </div>
  );
};

export default ThermalReactionsBench;