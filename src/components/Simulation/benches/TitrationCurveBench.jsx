import React from 'react';

const TitrationCurveBench = ({ 
  simState, 
  uiState, 
  currentStep, 
  handleElementClick,
  children 
}) => {
  const { pH, volumeAdded, beakerPlaced, probeLowered, isComplete } = simState;
  const { animating, showDrop } = uiState;

  const target = currentStep?.targetElement;
  const isTarget = (id) => target === id && !isComplete;

  // Generate the full logarithmic curve points for the SVG background track
  const generateCurvePoints = () => {
    const pts = [];
    for(let v = 0; v <= 50; v++) {
      let p = 1.0;
      if (v < 25) p = -Math.log10(((25 * 0.1) - (v * 0.1)) / (25 + v));
      else if (v === 25) p = 7.0;
      else p = 14 + Math.log10(((v * 0.1) - (25 * 0.1)) / (25 + v));
      pts.push({ v, p: Math.max(0, Math.min(14, p)) });
    }
    return pts;
  };

  const curvePoints = generateCurvePoints();
  
  // SVG Mapping helpers
  const getX = (vol) => (vol / 50) * 100;
  const getY = (ph) => 100 - ((ph / 14) * 100);
  
  const fullPath = curvePoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.v)} ${getY(pt.p)}`).join(' ');
  const activePath = curvePoints.filter(pt => pt.v <= volumeAdded).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.v)} ${getY(pt.p)}`).join(' ');

  // Calculate dynamic beaker fill level based on volume added
  const beakerFill = 35 + (volumeAdded / 50) * 30;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col items-center relative overflow-hidden h-full min-h-[600px]">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* The drop animates straight down seamlessly into the liquid */}
      <style>{`
        @keyframes straight-drop {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          80% { transform: translate(-50%, 60px) scale(1); opacity: 1; }
          100% { transform: translate(-50%, 60px) scale(2.5); opacity: 0; }
        }
      `}</style>

      <div className="relative z-10 w-full flex flex-col items-center justify-start flex-1 mt-2">
        
        {/* ── Top Apparatus Section (Bulletproof Percentage Layout) ── */}
        <div className="relative w-full max-w-[500px] h-[260px] mb-6 mx-auto">
          
          <div className="absolute bottom-[0px] left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/20 rounded-[100%] blur-md z-0" />

          {/* 1. Stirrer Base */}
          <div className="absolute bottom-[40px] left-[50%] -translate-x-1/2 z-10 flex flex-col items-center">
             <div className="w-44 h-7 bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg shadow-lg border border-gray-400 flex items-center justify-between px-3">
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
               <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Stirrer</span>
               <div className="w-2 h-2 rounded-full bg-red-500/50" />
             </div>
             <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap">Magnetic Stirrer</span>
          </div>

          {/* 2. Burette */}
          <div className="absolute bottom-[40px] left-[0%] -translate-x-1/2 flex flex-col items-center z-40">
            <div
              className={`flex flex-col items-center transition-all duration-300 ease-out group ${isTarget('burette') ? 'cursor-pointer pulse-glow hover:-translate-y-1' : ''}`}
              onClick={() => isTarget('burette') && handleElementClick('burette')}
            >
              <div className="relative w-8 h-40 bg-white/30 backdrop-blur-md rounded-t shadow-[inset_0_4px_10px_rgba(255,255,255,0.7)] border border-white/70 overflow-hidden">
                <div className="absolute bottom-0 w-full transition-all duration-700 bg-white/60 opacity-90" style={{ height: `${100 - (volumeAdded / 50 * 100)}%` }} />
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
                  <div key={pct} className="absolute right-0 h-px bg-gray-600/70 z-10" style={{ top: `${pct}%`, width: pct % 20 === 0 ? '40%' : '20%' }} />
                ))}
              </div>
              <div className="w-6 h-3 bg-gradient-to-b from-gray-300 to-gray-500 rounded shadow-md z-10 border border-white/40" />
              <div className="w-1.5 h-6 bg-gradient-to-b from-gray-200 to-white border-x border-gray-400 z-10" />
            </div>
            <span className="absolute -bottom-10 text-[11px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap">0.1M NaOH</span>
          </div>

          {/* 3. Beaker */}
          <div 
            className={`absolute flex flex-col items-center transition-all duration-1000 ease-in-out z-30
            ${beakerPlaced ? 'bottom-[67px] left-1/2 -translate-x-1/2' : 'bottom-[40px] left-[85%] -translate-x-1/2'}
            ${isTarget('beaker') ? 'cursor-pointer pulse-glow hover:-translate-y-2' : ''}`}
            onClick={() => isTarget('beaker') && handleElementClick('beaker')}
          >
            <div className="relative w-32 h-32 bg-white/30 backdrop-blur-md rounded-b-[1.2rem] border-x-2 border-b-2 border-white/70 shadow-[inset_0_4px_15px_rgba(255,255,255,0.6)] overflow-hidden">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-white/60 to-transparent z-20" />
              <div className="absolute bottom-0 w-full transition-all duration-700 rounded-b-[1.2rem] bg-gradient-to-b from-blue-100/30 to-blue-200/40" style={{ height: `${beakerFill}%` }} />
              
              {/* Stirrer Pill */}
              {beakerPlaced && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex justify-center items-center w-8 h-8 z-10">
                   <div className="w-6 h-1.5 bg-white rounded-full shadow-md animate-spin" style={{ animationDuration: '0.4s' }} />
                </div>
              )}

              {/* Magical Vertical Drop perfectly inside Beaker */}
              {showDrop && beakerPlaced && (
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-2 h-3 bg-white/90 rounded-full shadow-[0_0_8px_#ffffff] z-30" style={{ animation: 'straight-drop 0.5s ease-in forwards' }} />
              )}
            </div>
            <span className={`absolute -bottom-10 text-[11px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap transition-opacity duration-300 ${beakerPlaced ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>0.1M HCl</span>
          </div>

          {/* 4. pH Probe (Starts high at 85% Far Right, plunges to offset-center) */}
          <div 
            className={`absolute flex flex-col items-center transition-all duration-1000 ease-in-out z-20 w-16
            ${probeLowered ? 'top-[-10px] left-[57%] -translate-x-1/2' : 'top-[28px] left-[20%] -translate-x-1/2'}
            ${isTarget('probe') ? 'cursor-pointer pulse-glow hover:-translate-y-2 pointer-events-auto' : 'pointer-events-none'}`}
            onClick={() => isTarget('probe') && handleElementClick('probe')}
          >
            <div className="w-1 h-28 bg-gray-700 rounded-t-full shadow-inner" />
            <div className="w-4 h-16 bg-blue-900 rounded-t-sm shadow-md flex justify-center">
               <div className="w-2 h-16 bg-white/20" />
            </div>
            <div className="w-2 h-4 bg-gray-300 rounded-b-full border border-gray-400" />
            <span className={`absolute -bottom-10 text-[11px] font-bold text-white/90 px-3 py-1 bg-black/40 rounded-full border border-white/10 shadow-md whitespace-nowrap transition-opacity duration-300 ${probeLowered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>pH Probe</span>
          </div>

        </div>

        {/* ── Bottom Section: Digital Data Logger (Titration Curve) ── */}
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-inner relative mt-2 z-10">
          <div className="flex justify-between items-center mb-3 px-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Data Logger
            </h4>
            <div className="text-xs font-mono text-white/80 bg-black/40 px-3 py-1 rounded shadow-inner">
               VOL: <span className="text-white font-bold">{volumeAdded.toFixed(1)} mL</span> | pH: <span className="text-white font-bold">{pH.toFixed(2)}</span>
            </div>
          </div>

          {/* SVG Graph Area */}
          <div className="relative w-full h-32 bg-slate-900/60 rounded-lg border border-white/10 overflow-hidden shadow-inner flex">
            
            {/* Y-Axis Labels (pH) */}
            <div className="w-8 h-full flex flex-col justify-between items-end pr-2 py-2 text-[9px] font-mono text-gray-500 border-r border-white/10 absolute left-0 z-10 bg-slate-900/80 backdrop-blur-sm">
              <span>14</span><span>7</span><span>0</span>
            </div>

            {/* Graph Canvas */}
            <div className="flex-1 relative ml-8 w-full h-full">
               
               {/* Background Grid */}
               <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10% 50%' }} />
               <div className="absolute top-1/2 w-full h-px bg-white/10" /> {/* pH 7 Line */}

               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                 
                 {/* Faint Background Guide Curve */}
                 <path d={fullPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                 
                 {/* Active Plotted Curve */}
                 {volumeAdded > 0 && (
                   <path d={activePath} fill="none" stroke="#22d3ee" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="transition-all duration-700 ease-out" />
                 )}

                 {/* Active Current Value Dot */}
                 {volumeAdded > 0 && (
                   <circle cx={getX(volumeAdded)} cy={getY(pH)} r="1.5" fill="#ffffff" className="transition-all duration-700 ease-out animate-pulse" />
                 )}
               </svg>
            </div>
          </div>
          
          {/* X-Axis Labels (Volume) */}
          <div className="flex justify-between w-full pl-8 pr-2 mt-1 text-[9px] font-mono text-gray-500">
             <span>0 mL</span><span>25 mL (Eq)</span><span>50 mL</span>
          </div>
        </div>

        {/* The complete button rests safely below the logger */}
        {children && (
          <div className="justify-center">
            {children}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default TitrationCurveBench;