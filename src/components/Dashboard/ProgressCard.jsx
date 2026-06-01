import React from 'react';
import { useExperiments } from '../../backend/Firebase/useExperiments';
import { useProgress } from '../../backend/Firebase/useProgress';

const ProgressCard = () => {
  const { experiments, loading: expLoading } = useExperiments();
  const { getStatus, loading: progLoading } = useProgress();

  if (expLoading || progLoading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full mb-3"></div>
        <div className="h-3 w-48 bg-gray-200 rounded mt-2"></div>
      </div>
    );
  }

  const completedCount = experiments.filter(exp => getStatus(exp.id) === 'completed').length;
  const total = experiments.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    // ✨ Subtly bounces and shadows on hover ✨
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-blue-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-gray-700 uppercase tracking-widest group-hover:text-blue-700 transition-colors">Overall Progress</span>
        <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{percent}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
        {/* Adds a slight bright highlight to the loading bar on hover */}
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
          style={{ width: `${percent}%` }} 
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-500 mt-3">{completedCount}/{total} experiments completed</p>
    </div>
  );
};

export default ProgressCard;