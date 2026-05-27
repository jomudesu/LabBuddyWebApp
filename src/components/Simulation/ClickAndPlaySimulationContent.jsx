import React, { useState, useCallback } from 'react';
import { CheckCircle, Thermometer, Droplet, FlaskConical } from 'lucide-react';
import TitrationBench from './benches/TitrationBench';

const BenchComponentsMap = {
  TitrationBench: TitrationBench,
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const ClickAndPlaySimulationContent = ({ config, experimentId, onComplete }) => {
  const { steps, mlPerClick = 5 } = config;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState(new Set());
  const [animating, setAnimating] = useState(false);

  const [addedVolume, setAddedVolume] = useState(0);   
  const [hasIndicator, setHasIndicator] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [showVolumeReading, setShowVolumeReading] = useState(false);
  const [buretteFilled, setBuretteFilled] = useState(false);

  const simState = config.computeState(addedVolume, config);
  const { pH, indicatorColor } = simState;

  const currentStep = steps[currentStepIndex];
  const allStepsDone = steps.every((s) => completedStepIds.has(s.id));
  const ActiveBenchComponent = BenchComponentsMap[config.benchComponent];

  const markComplete = useCallback((stepId) => {
    setCompletedStepIds((prev) => new Set([...prev, stepId]));
  }, []);

  const advanceStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const handleElementClick = async (elementId) => {
    if (animating || elementId !== currentStep.targetElement) return;
    setAnimating(true);

    switch (currentStep.animation) {
      case 'fill':
        setBuretteFilled(true); await delay(700); markComplete(currentStep.id); advanceStep(); break;
      case 'drop':
        setShowDrop(true); setTimeout(() => setShowDrop(false), 500); setHasIndicator(true); await delay(700); markComplete(currentStep.id); advanceStep(); break;
      case 'pour':
        setShowDrop(true); setTimeout(() => setShowDrop(false), 500); setAddedVolume(addedVolume + mlPerClick); const newState = config.computeState(addedVolume + mlPerClick, config); await delay(700); if (newState.isComplete) { markComplete(currentStep.id); advanceStep(); } break;
      case 'none':
        setShowVolumeReading(true); await delay(900); setShowVolumeReading(false); markComplete(currentStep.id); break;
      default: break;
    }
    setAnimating(false);
  };

  const getStepInstruction = (step, isActive) => {
    if (isActive && step.repeatable) return `${step.instruction} (~${Math.max(0, config.totalNeeded - addedVolume).toFixed(0)} mL to equivalence point)`;
    return step.instruction;
  };

  const uiState = { addedVolume, showVolumeReading, showDrop, buretteFilled, hasIndicator };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch min-h-[600px] lg:h-[calc(100vh-130px)]">

      {/* ── LEFT COLUMN – Telemetry & Inventory (Span 1) ── */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full">
        
        {/* Real-time data - Bright Glass outer, Dark bubble inner */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/20 shrink-0">
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" /> Live Telemetry
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 hover:bg-black/35 transition-all duration-200 cursor-default group flex-wrap gap-2">
              <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Droplet size={16} className="text-blue-400 flex-shrink-0" /> pH Reading</span>
              <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${pH < 7 ? 'text-red-400' : pH > 7 ? 'text-blue-400' : 'text-green-400'}`}>
                {pH.toFixed(2)} {pH > 7 ? '(B)' : pH < 7 ? '(A)' : '(N)'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 hover:bg-black/35 transition-all duration-200 cursor-default group flex-wrap gap-2">
              <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Thermometer size={16} className="text-red-400 flex-shrink-0" /> Temp</span>
              <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300 font-bold ml-auto shadow-inner">24.5 °C</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 hover:bg-black/35 transition-all duration-200 cursor-default group flex-wrap gap-2">
              <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><FlaskConical size={16} className="text-purple-400 flex-shrink-0" /> NaOH</span>
              <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300 font-bold ml-auto shadow-inner">{addedVolume.toFixed(1)} mL</span>
            </div>
          </div>
        </div>

        {/* Inventory - Bright Glass outer, Dark bubble inner */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/20 flex-1 flex flex-col">
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-4 shrink-0">Inventory</h3>
          <div className="flex flex-wrap gap-2">
            {config.equipment.map((item) => (
              <span 
                key={item} 
                className="px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-xs text-white/90 font-medium hover:-translate-y-1 hover:bg-black/40 transition-all duration-300 cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CENTER COLUMN – Dynamic Visual Lab Bench (Span 2) ────────────────── */}
      <div className="lg:col-span-2 flex flex-col h-full">
        {ActiveBenchComponent ? (
          <ActiveBenchComponent 
            simState={simState} 
            uiState={uiState}
            currentStep={currentStep}
            handleElementClick={handleElementClick}
          >
            {allStepsDone && (
              <div className="mt-8 flex justify-center animate-fade-in-up z-20">
                <button onClick={onComplete} className="px-8 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl flex items-center gap-2 hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:shadow-[0_0_20px_rgba(74,222,128,0.6)] hover:-translate-y-1 font-bold text-sm tracking-wide border border-green-300/50 success-pop">
                  <CheckCircle size={20} />
                  Mark Experiment Complete
                </button>
              </div>
            )}
          </ActiveBenchComponent>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl text-center text-white shadow-xl border border-white/20 h-full flex items-center justify-center font-semibold">
            Error: Bench not found.
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN – Procedure Protocol (Span 1) ────────────────────── */}
      <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
        
        {/* Procedure & step list - Bright Glass outer */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/20 flex-1 flex flex-col overflow-hidden">
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-4 shrink-0">Procedure Protocol</h3>
          
          <div className="flex justify-between text-xs font-bold text-white/90 mb-2 shrink-0">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-yellow-300">{Math.round((completedStepIds.size / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full mb-6 overflow-hidden border border-white/10 shrink-0 shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${(completedStepIds.size / steps.length) * 100}%` }} />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
            {steps.map((step, i) => {
              const done = completedStepIds.has(step.id);
              const active = i === currentStepIndex;
              return (
                <div 
                  key={step.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-default ${
                    active 
                      ? 'bg-blue-500/30 border border-blue-400/50 shadow-md backdrop-blur-sm' 
                      : done 
                        ? 'bg-black/10 border border-transparent hover:bg-black/20' 
                        : 'bg-black/25 border border-white/5 hover:bg-black/35'
                  }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    active ? 'bg-yellow-400 text-blue-900 ring-2 ring-yellow-200/50 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 
                    'bg-white/10 text-white/60 border border-white/10'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs leading-relaxed mt-0.5 ${
                    active ? 'text-white font-bold' : 
                    done ? 'text-white/50 line-through' : 
                    'text-white/80 font-medium'
                  }`}>
                    {getStepInstruction(step, active)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ClickAndPlaySimulationContent;