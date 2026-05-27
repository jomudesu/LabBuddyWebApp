import React from 'react';
import { useExperiments } from '../../backend/Firebase/useExperiments';
import { useProgress } from '../../backend/Firebase/useProgress';

const ProgressCard = () => {
  const { experiments, loading: expLoading } = useExperiments();
  // Now we get the loading state from our provider
  const { getStatus, loading: progLoading } = useProgress();

  // If either data source is loading, show a placeholder
  if (expLoading || progLoading) {
    return <div className="bg-white rounded-xl p-4 shadow-sm">Loading progress...</div>;
  }

  const completedCount = experiments.filter(exp => getStatus(exp.id) === 'completed').length;
  const total = experiments.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
        <span className="text-sm font-semibold text-blue-600">{percent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-2">{completedCount}/{total} experiments completed</p>
    </div>
  );
};

export default ProgressCard;