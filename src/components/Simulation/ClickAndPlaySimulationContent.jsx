import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  CheckCircle, Thermometer, Droplet, FlaskConical, Atom, 
  Zap, Wind, Microscope, Waves, Timer, Palette, Pipette, 
  Activity, Layers, LineChart, Info, Play, Flag, RefreshCw, AlertTriangle
} from 'lucide-react';

import TitrationBench from './benches/TitrationBench';
import FlameTestBench from './benches/FlameTestBench';
import CrystalGrowthBench from './benches/CrystalGrowthBench';
import ElectrolysisBench from './benches/ElectrolysisBench';
import OsmosisBench from './benches/OsmosisBench';
import ChromatographyBench from './benches/ChromatographyBench';
import PHScaleBench from './benches/PHScaleBench';
import TitrationCurveBench from './benches/TitrationCurveBench';
import GasLawsBench from './benches/GasLawsBench';
import ThermalReactionsBench from './benches/ThermalReactionsBench';

const BenchComponentsMap = {
  TitrationBench: TitrationBench,
  FlameTestBench: FlameTestBench,
  CrystalGrowthBench: CrystalGrowthBench,
  ElectrolysisBench: ElectrolysisBench,
  OsmosisBench: OsmosisBench,
  ChromatographyBench: ChromatographyBench,
  PHScaleBench: PHScaleBench,
  TitrationCurveBench: TitrationCurveBench,
  GasLawsBench: GasLawsBench,
  ThermalReactionsBench: ThermalReactionsBench,
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getEaristGrade = (percentage) => {
  if (percentage >= 97) return '1.00';
  if (percentage >= 94) return '1.25';
  if (percentage >= 91) return '1.50';
  if (percentage >= 88) return '1.75';
  if (percentage >= 85) return '2.00';
  if (percentage >= 82) return '2.25';
  if (percentage >= 79) return '2.50';
  if (percentage >= 76) return '2.75';
  if (percentage === 75) return '3.00';
  return '5.00'; 
};

const ClickAndPlaySimulationContent = ({ config, experimentId, onComplete }) => {
  const { steps, mlPerClick = 5, difficulty = 'Intermediate' } = config;
  
  const difficultyPenaltyMap = { 'Beginner': 5, 'Intermediate': 7, 'Advanced': 10 };
  const misclickPenalty = difficultyPenaltyMap[difficulty] || 7;
  const retryPenalty = 5;

  const maxRetriesAllowed = Math.floor((100 - 75) / retryPenalty);

  const storageKey = `lab_buddy_sim_${experimentId}`;
  
  const loadInitialState = () => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.introAcknowledged === undefined) {
          sessionStorage.removeItem(storageKey);
          return null;
        }
        return { ...parsed, completedStepIds: new Set(parsed.completedStepIds || []) };
      }
    } catch (e) {}
    return null;
  };

  const initialState = loadInitialState();

  const [currentStepIndex, setCurrentStepIndex] = useState(initialState?.currentStepIndex ?? 0);
  const [completedStepIds, setCompletedStepIds] = useState(initialState?.completedStepIds ?? new Set());
  const [animating, setAnimating] = useState(false);
  const [interactiveData, setInteractiveData] = useState(initialState?.interactiveData ?? null);
  const [addedVolume, setAddedVolume] = useState(initialState?.addedVolume ?? 0);   
  const [hasIndicator, setHasIndicator] = useState(initialState?.hasIndicator ?? false);
  const [showDrop, setShowDrop] = useState(false);
  const [showVolumeReading, setShowVolumeReading] = useState(false);
  const [buretteFilled, setBuretteFilled] = useState(initialState?.buretteFilled ?? false);

  const [errors, setErrors] = useState(initialState?.errors ?? 0);     
  const [retries, setRetries] = useState(initialState?.retries ?? 0);  

  const [introAcknowledged, setIntroAcknowledged] = useState(initialState?.introAcknowledged ?? false); 
  const [showIntroModal, setShowIntroModal] = useState(initialState?.introAcknowledged ? false : true);
  
  const [showConclusionModal, setShowConclusionModal] = useState(false);
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);

  const activeStepRef = useRef(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center', 
      });
    }
  }, [currentStepIndex]);

  useEffect(() => {
    const stateToSave = {
      currentStepIndex,
      completedStepIds: Array.from(completedStepIds),
      interactiveData,
      addedVolume,
      hasIndicator,
      buretteFilled,
      errors,
      retries,
      introAcknowledged
    };
    sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [currentStepIndex, completedStepIds, interactiveData, addedVolume, hasIndicator, buretteFilled, errors, retries, introAcknowledged, storageKey]);

  const simState = (experimentId === 'acid_base_titration' || experimentId === 'titration_curves') 
    ? config.computeState(addedVolume, config, completedStepIds.size)
    : config.computeState(completedStepIds.size, config);

  const currentPH = interactiveData && interactiveData.activePH !== undefined ? interactiveData.activePH : simState.activePH;
  const phSample = currentPH === 2.5 ? 'Lemon Juice' : currentPH === 7 ? 'Distilled H₂O' : currentPH === 11 ? 'Ammonia' : 'None';
  const phClass = currentPH === 2.5 ? 'Strong Acid' : currentPH === 7 ? 'Neutral' : currentPH === 11 ? 'Strong Base' : '-';

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
    if (animating) return;

    if (elementId !== currentStep.targetElement) {
      setErrors(prev => prev + 1);
      return; 
    }

    setAnimating(true);

    switch (currentStep.animation) {
      case 'fill': setBuretteFilled(true); await delay(700); markComplete(currentStep.id); advanceStep(); break;
      case 'drop': setShowDrop(true); setTimeout(() => setShowDrop(false), 500); setHasIndicator(true); await delay(700); markComplete(currentStep.id); advanceStep(); break;
      case 'pour':
        setShowDrop(true); setTimeout(() => setShowDrop(false), 500); 
        setAddedVolume(addedVolume + mlPerClick); 
        const newState = config.computeState(addedVolume + mlPerClick, config, completedStepIds.size); 
        await delay(700); 
        if (newState.isComplete) { markComplete(currentStep.id); advanceStep(); } 
        break;
      case 'none': setShowVolumeReading(true); await delay(900); setShowVolumeReading(false); markComplete(currentStep.id); break;
      default: await delay(700); markComplete(currentStep.id); advanceStep(); break;
    }
    setAnimating(false);
  };

  const getStepInstruction = (step, isActive) => {
    if (isActive && step.repeatable) return `${step.instruction} (${addedVolume} mL added)`;
    return step.instruction;
  };

  const executeRetry = () => {
    setRetries(prev => prev + 1);
    setErrors(0); 
    setCurrentStepIndex(0);
    setCompletedStepIds(new Set());
    setAddedVolume(0);
    setHasIndicator(false);
    setBuretteFilled(false);
    setShowDrop(false);
    setShowVolumeReading(false);
    setInteractiveData(null);
    setShowRetryConfirm(false);
  };

  const finalizeExperiment = () => {
    sessionStorage.removeItem(storageKey); 
    const percentage = Math.max(0, 100 - (errors * misclickPenalty) - (retries * retryPenalty));
    const totalMistakes = errors + retries; 

    onComplete({
      status: 'completed',
      grade: percentage,
      errors: totalMistakes
    });
  };

  const uiState = { addedVolume, showVolumeReading, showDrop, buretteFilled, hasIndicator, animating };
  const livePercentage = Math.max(0, 100 - (errors * misclickPenalty) - (retries * retryPenalty));
  const earistGrade = getEaristGrade(livePercentage);
  const canRetry = retries < maxRetriesAllowed; 

  return (
    <>
      {showIntroModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(59,130,246,0.15)] text-white animate-fade-in-up flex flex-col overflow-hidden">
            <div className="bg-blue-600/20 border-b border-blue-500/30 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/50 shrink-0">
                 <FlaskConical size={24} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Mission Briefing</h4>
                <h2 className="text-2xl font-black tracking-tight text-slate-100">{config.title}</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-6 p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={16} className="text-blue-400" /> Experiment Overview
                </h3>
                <p className="text-justify text-slate-300 leading-relaxed text-sm">
                  {config.introduction || "Follow the step-by-step procedure in the right panel to complete the simulation successfully."}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-blue-400" /> Required Equipment
                </h3>
                <div className="flex flex-wrap gap-2">
                  {config.equipment.map((item, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={introAcknowledged}
                    onChange={(e) => setIntroAcknowledged(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-500 rounded bg-slate-900 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer"
                  />
                  <CheckCircle size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-slate-200 select-none">
                  I have carefully read the overview. I understand this is an <strong className="text-blue-400">{difficulty}</strong> level simulation and each procedural misclick will result in a <strong className="text-rose-400">{misclickPenalty}%</strong> grade deduction. Restarting will clear my misclicks but permanently deduct <strong className="text-amber-400">{retryPenalty}%</strong> for material waste.
                </span>
              </label>

              <div className="mt-6">
                <button
                  disabled={!introAcknowledged}
                  onClick={() => setShowIntroModal(false)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 disabled:shadow-none text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
                >
                  <Play size={18} fill={introAcknowledged ? "currentColor" : "none"} /> Begin Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRetryConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-800 border border-amber-500/30 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(245,158,11,0.15)] text-white animate-fade-in-up flex flex-col text-center">
            <div className="mx-auto w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
               <AlertTriangle size={24} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Restart Simulation?</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to discard your progress and start over? This will wipe your misclick errors clean, but <strong className="text-amber-400">a {retryPenalty}% material waste penalty will be deducted from your baseline grade.</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRetryConfirm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all border border-slate-600">
                Cancel
              </button>
              <button onClick={executeRetry} className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                Yes, Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {showConclusionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl text-white animate-fade-in-up flex flex-col">
            <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-5 border border-green-500/30">
               <Flag size={24} className="text-green-400" />
            </div>
            <h2 className="text-center text-2xl font-bold mb-3 tracking-tight">Experiment Concluded</h2>
            <p className="text-justify text-slate-300 leading-relaxed mb-6 text-sm">
              {config.conclusion || "You have successfully completed all steps in this simulation module."}
            </p>
            
            <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-8 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Deductions</p>
                <div className="text-sm font-medium text-slate-300">
                  <span className="text-rose-400 font-bold">{errors}</span> Misclicks <br/>
                  <span className="text-amber-400 font-bold">{retries}</span> Retries
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">EARIST Grade</p>
                <p className={`text-3xl font-black ${livePercentage >= 75 ? 'text-green-400' : 'text-rose-400'}`}>
                  {earistGrade}
                </p>
                <p className="text-xs text-slate-400 font-bold mt-1 tracking-wider">({livePercentage}%)</p>
              </div>
            </div>

            <button 
              onClick={finalizeExperiment} 
              className="w-full py-3 bg-green-500 hover:bg-green-400 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> Finish & Log Score
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch min-h-[600px] lg:h-[calc(100vh-130px)] animate-fade-in-up">

        {/* ── LEFT COLUMN – Telemetry & Inventory ── */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/20 shrink-0">
            <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" /> Live Telemetry
            </h3>
            <div className="space-y-3">
              
              {experimentId === 'acid_base_titration' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Droplet size={16} className="text-blue-400 flex-shrink-0" /> pH Reading</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.pH < 7 ? 'text-red-400' : simState.pH > 7 ? 'text-blue-400' : 'text-green-400'}`}>
                      {simState.pH?.toFixed(2)} {simState.pH > 7 ? '(B)' : simState.pH < 7 ? '(A)' : '(N)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Thermometer size={16} className="text-red-400 flex-shrink-0" /> Temp</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300 font-bold ml-auto shadow-inner">24.5 °C</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><FlaskConical size={16} className="text-purple-400 flex-shrink-0" /> NaOH</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300 font-bold ml-auto shadow-inner">{addedVolume.toFixed(1)} mL</span>
                  </div>
                </>
              ) : experimentId === 'flame_test' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Thermometer size={16} className="text-red-400 flex-shrink-0" /> Burner Status</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.isBurnerOn ? 'text-green-400' : 'text-gray-400'}`}>
                      {simState.isBurnerOn ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><FlaskConical size={16} className="text-blue-400 flex-shrink-0" /> Active Sample</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300 font-bold ml-auto shadow-inner uppercase">
                      {simState.activeSample || 'NONE'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Droplet size={16} className="text-yellow-400 flex-shrink-0" /> Flame Color</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300 font-bold ml-auto shadow-inner capitalize">
                      {simState.flameColor || 'NONE'}
                    </span>
                  </div>
                </>
              ) : experimentId === 'crystal_growth' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Thermometer size={16} className="text-red-400 flex-shrink-0" /> Temperature</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.temperature > 30 ? 'text-red-400' : 'text-blue-400'}`}>
                      {simState.temperature} °C
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Droplet size={16} className="text-blue-400 flex-shrink-0" /> Saturation</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300 font-bold ml-auto shadow-inner uppercase`}>
                      {simState.saturation || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Atom size={16} className="text-purple-400 flex-shrink-0" /> Crystal Status</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase ${simState.crystalState === 'grown' ? 'text-green-400' : 'text-amber-300'}`}>
                      {simState.crystalState || 'None'}
                    </span>
                  </div>
                </>
              ) : experimentId === 'electrolysis_of_water' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Zap size={16} className="text-yellow-400 flex-shrink-0" /> DC Power</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.powerOn ? 'text-green-400' : 'text-gray-400'}`}>
                      {simState.powerOn ? '9.0V (0.5A)' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Wind size={16} className="text-gray-300 flex-shrink-0" /> Cathode (H₂)</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300 font-bold ml-auto shadow-inner`}>
                      {simState.h2Volume.toFixed(1)} mL
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Wind size={16} className="text-red-300 flex-shrink-0" /> Anode (O₂)</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300 font-bold ml-auto shadow-inner`}>
                      {simState.o2Volume.toFixed(1)} mL
                    </span>
                  </div>
                </>
              ) : experimentId === 'osmosis_in_cells' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><FlaskConical size={16} className="text-blue-400 flex-shrink-0" /> Solution</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase ${simState.solutionType === 'Hypertonic' ? 'text-blue-400' : simState.solutionType === 'Hypotonic' ? 'text-cyan-300' : 'text-gray-300'}`}>
                      {simState.solutionType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Waves size={16} className="text-teal-400 flex-shrink-0" /> Water Flow</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-white font-bold ml-auto shadow-inner uppercase`}>
                      {simState.waterMovement}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Microscope size={16} className="text-purple-400 flex-shrink-0" /> Cell Condition</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase ${simState.cellState === 'normal' ? 'text-green-400' : simState.cellState === 'invisible' ? 'text-gray-500' : 'text-amber-400'}`}>
                      {simState.cellState}
                    </span>
                  </div>
                </>
              ) : experimentId === 'paper_chromatography' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Timer size={16} className="text-amber-400 flex-shrink-0" /> Phase</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase ${simState.developmentPhase === 'Complete' ? 'text-green-400' : 'text-yellow-300'}`}>
                      {simState.developmentPhase}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Waves size={16} className="text-blue-400 flex-shrink-0" /> Solvent Front</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-white font-bold ml-auto shadow-inner uppercase`}>
                      {simState.isCovered ? '12.0 cm' : simState.isSuspended ? '1.5 cm' : '0.0 cm'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Palette size={16} className="text-pink-400 flex-shrink-0" /> Separation</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase ${simState.isCovered ? 'text-cyan-300' : 'text-gray-400'}`}>
                      {simState.isCovered ? '3 BANDS VISIBLE' : 'MIXED'}
                    </span>
                  </div>
                </>
              ) : experimentId === 'ph_scale_measurement' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Pipette size={16} className="text-pink-400 flex-shrink-0" /> Active Sample</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase text-cyan-300">
                      {phSample}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Activity size={16} className="text-yellow-400 flex-shrink-0" /> pH Reading</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-white font-bold ml-auto shadow-inner uppercase ${currentPH !== null && currentPH < 7 ? 'text-red-400' : currentPH > 7 ? 'text-indigo-400' : currentPH === 7 ? 'text-green-400' : ''}`}>
                      {currentPH !== null ? currentPH.toFixed(1) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Layers size={16} className="text-blue-400 flex-shrink-0" /> Class</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase text-gray-300`}>
                      {phClass}
                    </span>
                  </div>
                </>
              ) : experimentId === 'titration_curves' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><FlaskConical size={16} className="text-blue-400 flex-shrink-0" /> Titrant Vol</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner text-cyan-300">
                      {simState.volumeAdded?.toFixed(1)} mL
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Activity size={16} className="text-yellow-400 flex-shrink-0" /> pH Reading</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-white font-bold ml-auto shadow-inner ${simState.pH < 7 ? 'text-red-400' : simState.pH > 7 ? 'text-indigo-400' : 'text-green-400'}`}>
                      {simState.pH?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><LineChart size={16} className="text-pink-400 flex-shrink-0" /> Curve Phase</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner uppercase ${simState.curvePhase === 'Equivalence Point' ? 'text-green-400' : 'text-gray-300'}`}>
                      {simState.curvePhase}
                    </span>
                  </div>
                </>
              ) : experimentId === 'boyle_s_law_pressure_volume' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Activity size={16} className="text-red-400 flex-shrink-0" /> Pressure</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.pressure > 1 ? 'text-red-400' : simState.pressure < 1 ? 'text-blue-400' : 'text-green-400'}`}>
                      {simState.pressure?.toFixed(2)} atm
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Layers size={16} className="text-cyan-400 flex-shrink-0" /> Volume</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300 font-bold ml-auto shadow-inner">
                      {simState.volume?.toFixed(1)} mL
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><FlaskConical size={16} className="text-amber-400 flex-shrink-0" /> Weights</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300 font-bold ml-auto shadow-inner">
                      {simState.weightsOnPiston} / 2
                    </span>
                  </div>
                </>
              ) : experimentId === 'thermal_reactions' ? (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Thermometer size={16} className="text-red-400 flex-shrink-0" /> Temp A (Exo)</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.tempA > 25 ? 'text-red-400' : 'text-green-400'}`}>
                      {simState.tempA?.toFixed(1)} °C
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Thermometer size={16} className="text-blue-400 flex-shrink-0" /> Temp B (Endo)</span>
                    <span className={`font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg ml-auto font-bold shadow-inner ${simState.tempB < 25 ? 'text-blue-400' : 'text-green-400'}`}>
                      {simState.tempB?.toFixed(1)} °C
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/25 border border-white/10 cursor-default flex-wrap gap-2 group hover:bg-black/35 transition-all">
                    <span className="flex items-center gap-2 text-white/90 text-sm font-semibold"><Zap size={16} className="text-yellow-400 flex-shrink-0" /> Active RxN</span>
                    <span className="font-mono text-sm px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300 font-bold ml-auto shadow-inner uppercase">
                      {simState.thermometerPos === 'beaker_a' ? 'Exothermic' : simState.thermometerPos === 'beaker_b' ? 'Endothermic' : 'Idle'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-3 text-center text-slate-400 text-sm italic">Telemetry offline.</div>
              )}

            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/20 flex-1 flex flex-col overflow-visible">
            <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest mb-4 shrink-0">Inventory</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {config.equipment.map((item) => (
                <div key={item} className="relative group flex">
                  <span className="px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-xs text-white/90 font-medium hover:-translate-y-1 hover:bg-black/40 transition-all duration-300 cursor-help">
                    {item}
                  </span>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] shadow-xl text-center">
                    {config.equipmentDetails?.[item] || "Standard laboratory equipment."}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/10">
              {canRetry ? (
                <button 
                  onClick={() => setShowRetryConfirm(true)} 
                  className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <RefreshCw size={16} /> Restart Simulation
                </button>
              ) : (
                <div className="w-full py-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl font-bold flex flex-col items-center justify-center gap-1 text-center px-2 cursor-not-allowed">
                  <span className="flex items-center gap-2 text-sm"><AlertTriangle size={16}/> Retry Limit Reached</span>
                  <span className="text-[10px] font-medium text-rose-300 opacity-80">Further restarts would result in a failing grade.</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── CENTER COLUMN – Dynamic Visual Lab Bench ── */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {ActiveBenchComponent ? (
            <ActiveBenchComponent 
              simState={simState} 
              uiState={uiState}
              currentStep={currentStep}
              handleElementClick={handleElementClick}
              interactiveData={interactiveData}
              setInteractiveData={setInteractiveData}
            />
          ) : (
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl text-center text-white shadow-xl border border-white/20 h-full flex items-center justify-center font-semibold">
              Error: Bench not found.
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN – Procedure Protocol ── */}
        <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/20 flex-1 flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">Procedure Protocol</h3>
              {canRetry && (
                <button 
                  onClick={() => setShowRetryConfirm(true)} 
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/10 rounded-md transition-colors"
                  title="Restart Simulation"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
            
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
                    ref={active ? activeStepRef : null}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-default ${
                      active ? 'bg-blue-500/30 border border-blue-400/50 shadow-md backdrop-blur-sm' : done ? 'bg-black/10 hover:bg-black/20' : 'bg-black/25 border border-white/5 hover:bg-black/35'
                    }`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.5)]' : active ? 'bg-yellow-400 text-blue-900 ring-2 ring-yellow-200/50 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-white/10 text-white/60'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <p className={`text-xs leading-relaxed mt-0.5 ${
                      active ? 'text-white font-bold' : done ? 'text-white/50 line-through' : 'text-white/80 font-medium'
                    }`}>
                      {getStepInstruction(step, active)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
              <h4 className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Info size={14} /> Process Explanation
              </h4>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-xs text-white/80 leading-relaxed font-medium min-h-[80px] text-justify">
                {currentStep.explanation || "Complete the current action in the visual bench to proceed to the next step."}
              </div>

              {allStepsDone && (
                <button 
                  onClick={() => setShowConclusionModal(true)} 
                  className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center gap-2 hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 font-bold tracking-wide border border-green-400/50 animate-fade-in"
                >
                  <CheckCircle size={18} /> Finalize Observations
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default ClickAndPlaySimulationContent;