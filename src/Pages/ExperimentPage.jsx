import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    if (!loading && experiments.length) {
      const found = experiments.find(exp => exp.id === id);
      setExperiment(found);
      setSimConfig(simulationConfigs[id] || null);
    }
  }, [id, experiments, loading]);

  // Updated Loading Screen Background
  if (loading) return <div className="p-8 text-center text-white min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">Loading experiment...</div>;
  
  // Updated Not Found Screen Background
  if (!experiment) return <div className="p-8 text-center text-red-300 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">Experiment not found.</div>;

  const handleComplete = async () => {
    await updateExperimentStatus(id, 'completed');
    navigate('/experiments');
  };

  return (
    // NEW: Soothing, neutral slate-blue background to reduce eye strain
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 transition-colors duration-500">
      
      {/* Custom top bar - Glassmorphism theme */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-lg">
        <button onClick={() => navigate('/experiments')} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-wide">{experiment.title}</h1>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            getStatus(id) === 'completed' 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
          }`}>
            {getStatus(id) === 'completed' ? 'Completed' : 'In Progress'}
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