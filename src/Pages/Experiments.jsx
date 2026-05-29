import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, Search, Filter } from 'lucide-react';
import { useExperiments } from '../backend/Firebase/useExperiments';
import { useProgress } from '../backend/Firebase/useProgress';

const Experiments = () => {
  const navigate = useNavigate();
  const { experiments, loading, error } = useExperiments();
  const { getStatus, updateExperimentStatus } = useProgress();

  // Skeleton Loader
  if (loading) {
    return (
      <div className="p-8">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Skeleton Search Bar */}
        <div className="relative mb-6">
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Skeleton Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-[220px]">
              {/* Icon placeholder */}
              <div className="bg-gray-200 h-12 w-12 rounded-lg mb-3 animate-pulse"></div>
              {/* Title & Category placeholders */}
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse"></div>
              
              {/* Tags placeholder */}
              <div className="mt-auto flex justify-between items-center mb-3">
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              
              {/* Button placeholder */}
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const handleStart = async (exp) => {
    await updateExperimentStatus(exp.id, 'in_progress');
    navigate(`/experiment/${exp.id}`);
  };

  const handleComplete = async (id) => {
    await updateExperimentStatus(id, 'completed');
    alert('Experiment marked as completed!');
  };

  const handleRetry = async (id) => {
    if (window.confirm('Are you sure you want to retry this experiment? Your previous progress will be reset.')) {
      await updateExperimentStatus(id, 'not_started');
      // The ProgressProvider listener will automatically update the UI everywhere
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Experiments</h1>
        <button className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
          <Filter size={18} className="mr-2" /> Filter
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Search Experiments..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map(exp => {
          const status = getStatus(exp.id);
          return (
            <div key={exp.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mb-3">
                <Flask className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800">{exp.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{exp.category}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{exp.difficulty}</span>
                </div>
                {status === 'completed' && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Completed ✓</span>}
                {status === 'in_progress' && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">In Progress</span>}
                {status === 'not_started' && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Not Started</span>}
              </div>
              <div className="mt-3 flex gap-2">
                {status !== 'completed' && (
                  <button onClick={() => handleStart(exp)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                    {status === 'in_progress' ? 'Continue' : 'Start'}
                  </button>
                )}
                {status === 'in_progress' && (
                  <button onClick={() => handleComplete(exp.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition">
                    Mark Complete
                  </button>
                )}
                {status === 'completed' && (
                  <button onClick={() => handleRetry(exp.id)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm hover:bg-gray-700 transition">
                    Retry
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Experiments;