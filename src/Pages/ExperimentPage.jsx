import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Activity } from 'lucide-react';
import { useExperiments } from '../backend/Firebase/useExperiments';
import { useProgress } from '../backend/Firebase/useProgress';
import { simulationConfigs } from '../config/simulation';
import ClickAndPlaySimulationContent from '../components/Simulation/ClickAndPlaySimulationContent';

const ExperimentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { experiments, loading } = useExperiments();
  const { getStatus, updateExperimentStatus } = useProgress();
  const [experiment, setExperiment] = useState(null);
  const [simConfig, setSimConfig] = useState(null);

  const isReviewMode = getStatus(id) === 'completed';

  useEffect(() => {
    if (!loading && experiments.length) {
      const found = experiments.find(exp => exp.id === id);
      setExperiment(found);
      setSimConfig(simulationConfigs[id] || null);
    }
  }, [id, experiments, loading]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
      <h2 className="text-xl font-semibold tracking-wide animate-pulse">Loading Laboratory...</h2>
    </div>
  );
  
  if (!experiment) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center text-white">
      <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl backdrop-blur-md flex flex-col items-center shadow-xl">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Experiment Not Found</h2>
        <p className="text-red-200/80 mb-6">The simulation you are looking for does not exist.</p>
        <button onClick={() => navigate('/experiments')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-semibold">
          Go Back
        </button>
      </div>
    </div>
  );

  const handleComplete = async (gradingPayload) => {
    if (isReviewMode) {
      navigate('/experiments', { state: { successMsg: "Review completed! Your official recorded grade remains unchanged." } });
      return;
    }

    // First-time completion now sends a distinct success notice back to the Hub page
    await updateExperimentStatus(id, gradingPayload || 'completed');
    navigate('/experiments', { 
      state: { successMsg: `Experiment completed! Your official grade of ${gradingPayload?.grade || 100}% has been recorded.` } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 transition-colors duration-500">
      
      <div className="bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-lg">
        <button onClick={() => navigate('/experiments')} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-wide">{experiment.title}</h1>
        
        {/* Explicit Status Banners so students know if they are being graded! */}
        {isReviewMode ? (
          <div className="hidden sm:flex bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-1.5 rounded-lg items-center gap-2 shadow-inner ml-4">
            <Lock size={14} />
            <span className="text-[11px] font-black uppercase tracking-wider">Review Mode: Grade Locked</span>
          </div>
        ) : (
          <div className="hidden sm:flex bg-blue-500/20 border border-blue-500/40 text-blue-300 px-4 py-1.5 rounded-lg items-center gap-2 shadow-inner ml-4">
            <Activity size={14} />
            <span className="text-[11px] font-black uppercase tracking-wider">Live Grading: Score will be recorded</span>
          </div>
        )}

        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            isReviewMode 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
          }`}>
            {isReviewMode ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      <div className="p-6">
        {simConfig ? (
          <ClickAndPlaySimulationContent
            config={simConfig}
            experimentId={id}
            onComplete={handleComplete}
          />
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center shadow-lg border border-white/20 text-white">
            <p className="text-lg">Simulation not yet available for this experiment.</p>
            <button onClick={() => navigate('/experiments')} className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md">
              Back to Experiments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentPage;