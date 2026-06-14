import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FlaskRound as Flask, Search, Filter, X, ArrowDownAZ, LayoutGrid, BarChart2, CheckCircle, Lock } from 'lucide-react';
import { useExperiments } from '../backend/Firebase/useExperiments';
import { useProgress } from '../backend/Firebase/useProgress';
import { useAuth } from '../backend/Firebase/AuthContext'; 

const Experiments = () => {
  const { currentUser } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { experiments, loading, error } = useExperiments();
  const { getStatus, updateExperimentStatus } = useProgress();

  const highlightExpId = location.state?.highlightExpId;

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All',
    sortBy: 'default'
  });
  
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.successMsg) {
      setSuccessMessage(location.state.successMsg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Filter the master experiment list down to ONLY modules assigned to this student's section
  const assignedExperiments = useMemo(() => {
    if (!experiments || !currentUser?.section) return [];
    return experiments.filter(exp => {
      const assignedTo = exp.assigned_sections || [];
      return assignedTo.includes(currentUser.section);
    });
  }, [experiments, currentUser]);

  // Ensure the category dropdown only shows subjects they actually have access to
  const categories = useMemo(() => ['All', ...new Set(assignedExperiments.map(e => e.category).filter(Boolean))], [assignedExperiments]);
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Apply Search & Filters to the already-restricted assigned experiments list
  const processedExperiments = useMemo(() => {
    let result = assignedExperiments.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || exp.category === filters.category;
      const matchesDifficulty = filters.difficulty === 'All' || exp.difficulty === filters.difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    if (filters.sortBy === 'a-z') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (filters.sortBy === 'z-a') result.sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [assignedExperiments, searchQuery, filters]);

  useEffect(() => {
    if (highlightExpId && processedExperiments.length > 0) {
      setTimeout(() => {
        const targetElement = document.getElementById(`exp-card-${highlightExpId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightExpId, processedExperiments]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleClearFilters = () => {
    setFilters({ category: 'All', difficulty: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  // Centralized Navigation & Cache Wiping Logic
  const handleStart = async (exp) => {
    const status = getStatus(exp.id);
    
    // 1. If starting fresh OR reviewing, wipe the browser's session storage completely
    if (status === 'not_started' || status === 'completed') {
      sessionStorage.removeItem(`lab_buddy_sim_${exp.id}`);
    }

    // 2. Only update the database to 'in_progress' if it's a brand new attempt
    if (status === 'not_started') {
      await updateExperimentStatus(exp.id, 'in_progress');
    }
    
    // 3. Launch the lab!
    navigate(`/experiment/${exp.id}`);
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-[220px]">
              <div className="bg-gray-200 h-12 w-12 rounded-lg mb-3 animate-pulse"></div>
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="mt-auto flex justify-between items-center mb-3">
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500 bg-slate-50 min-h-screen">Error: {error}</div>;

  const activeFilterCount = (filters.category !== 'All' ? 1 : 0) + (filters.difficulty !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  return (
    <div className="bg-slate-100 min-h-screen w-full">
      <div className="p-8 max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Laboratory Hub</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              Viewing modules assigned to <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Section {currentUser?.section || 'None'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assigned experiments..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              disabled={assignedExperiments.length === 0}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            disabled={assignedExperiments.length === 0}
            className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border disabled:opacity-50 disabled:cursor-not-allowed ${
              showFilters || activeFilterCount > 0 
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 hover:bg-blue-700' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <Filter size={20} className="mr-2" /> 
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-3 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Refine Parameters</h3>
              {activeFilterCount > 0 && (
                <button onClick={handleClearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center font-medium transition-colors">
                  <X size={16} className="mr-1" /> Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><LayoutGrid size={16} className="text-blue-500"/> Category</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><BarChart2 size={16} className="text-blue-500"/> Difficulty</label>
                <select 
                  value={filters.difficulty} 
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><ArrowDownAZ size={16} className="text-blue-500"/> Sort Order</label>
                <select 
                  value={filters.sortBy} 
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  <option value="default">Default Order</option>
                  <option value="a-z">Alphabetical (A - Z)</option>
                  <option value="z-a">Alphabetical (Z - A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Empty States based on Assignment Status */}
        {assignedExperiments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in-up">
            <Lock className="mx-auto text-slate-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Modules Assigned</h2>
            <p className="text-slate-500 max-w-sm mx-auto">Your instructor has not posted any experiments for <strong className="text-slate-700">Section {currentUser?.section}</strong> yet. Check back later!</p>
          </div>
        ) : processedExperiments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in-up">
            <Flask className="mx-auto text-slate-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No experiments found</h2>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
            <button onClick={handleClearFilters} className="mt-4 text-blue-600 font-semibold hover:underline">Reset all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedExperiments.map(exp => {
              const status = getStatus(exp.id);
              const isHighlighted = exp.id === highlightExpId;

              return (
                <div 
                  key={exp.id} 
                  id={`exp-card-${exp.id}`}
                  className={`group bg-white rounded-2xl p-6 transition-all duration-500 flex flex-col relative overflow-hidden cursor-default
                    ${isHighlighted 
                      ? 'ring-4 ring-blue-500 ring-offset-2 shadow-[0_0_25px_rgba(59,130,246,0.6)] scale-[1.02] z-10 border-transparent' 
                      : 'shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-blue-300'}
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="bg-blue-50 p-3.5 rounded-xl w-fit transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-100 group-hover:shadow-md">
                      <Flask className="text-blue-600" size={24} />
                    </div>
                    <div>
                      {status === 'completed' && <span className="text-[11px] font-bold px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg shadow-sm border border-green-200">COMPLETED ✓</span>}
                      {status === 'in_progress' && <span className="text-[11px] font-bold px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-lg shadow-sm border border-amber-200">IN PROGRESS</span>}
                      {status === 'not_started' && <span className="text-[11px] font-bold px-2.5 py-1.5 bg-gray-100 text-gray-500 rounded-lg border border-gray-200">NOT STARTED</span>}
                    </div>
                  </div>

                  <div className="relative z-10 flex-1">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-blue-900 transition-colors">{exp.title}</h3>
                    <p className="text-sm font-medium text-blue-600/80 mt-1">{exp.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-6 mb-5 relative z-10">
                    <div className="flex gap-2">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md border shadow-sm ${getDifficultyColor(exp.difficulty)}`}>
                        {exp.difficulty?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3 relative z-10">
                    {status !== 'completed' && (
                      <button onClick={() => handleStart(exp)} className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        {status === 'in_progress' ? 'Continue Protocol' : 'Start Experiment'}
                      </button>
                    )}
                    {status === 'completed' && (
                      <button onClick={() => handleStart(exp)} className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-xl text-sm hover:bg-indigo-100 border border-indigo-200 transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                        Review Simulation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── CUSTOM SUCCESS MODAL ─── */}
        {successMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-fade-in-up">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600 animate-bounce" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {successMessage}
                </p>
                <button 
                  onClick={() => setSuccessMessage('')}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Awesome
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Experiments;