import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, Search, Filter, X, ArrowDownAZ, LayoutGrid, BarChart2 } from 'lucide-react';
import { useExperiments } from '../backend/Firebase/useExperiments';
import { useProgress } from '../backend/Firebase/useProgress';

const Experiments = () => {
  const navigate = useNavigate();
  const { experiments, loading, error } = useExperiments();
  const { getStatus, updateExperimentStatus } = useProgress();

  // ─── STATE MANAGEMENT FOR CONTROLS ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All',
    sortBy: 'default' // 'default', 'a-z', 'z-a'
  });

  // ─── DYNAMIC DATA EXTRACTION ───
  // Automatically grab unique categories and difficulties from the database
  const categories = useMemo(() => ['All', ...new Set(experiments?.map(e => e.category) || [])], [experiments]);
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // ─── FILTERING & SORTING ENGINE ───
  const processedExperiments = useMemo(() => {
    if (!experiments) return [];

    let result = experiments.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || exp.category === filters.category;
      const matchesDifficulty = filters.difficulty === 'All' || exp.difficulty === filters.difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    if (filters.sortBy === 'a-z') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'z-a') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [experiments, searchQuery, filters]);

  // Helper to colorize difficulty badges
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

  // ─── INTERACTION HANDLERS ───
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
    }
  };

  // ─── SKELETON LOADER ───
  if (loading) {
    return (
      <div className="p-8">
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

  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const activeFilterCount = (filters.category !== 'All' ? 1 : 0) + (filters.difficulty !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Experiment Hub</h1>
      </div>

      {/* ─── CONTROL BAR (Search & Main Filter Button) ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments by title..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${
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

      {/* ─── EXPANDABLE FILTER PANEL ─── */}
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
            {/* Category Filter */}
            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2"><LayoutGrid size={16} className="text-blue-500"/> Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2"><BarChart2 size={16} className="text-blue-500"/> Difficulty</label>
              <select 
                value={filters.difficulty} 
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
              >
                {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2"><ArrowDownAZ size={16} className="text-blue-500"/> Sort Order</label>
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

      {/* ─── EMPTY STATE HANDLER ─── */}
      {processedExperiments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Flask className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-600 mb-2">No experiments found</h2>
          <p className="text-gray-400">Try adjusting your filters or search query.</p>
          <button onClick={handleClearFilters} className="mt-4 text-blue-600 font-semibold hover:underline">Reset all filters</button>
        </div>
      )}

      {/* ─── EXPERIMENT CARDS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedExperiments.map(exp => {
          const status = getStatus(exp.id);
          return (
            <div 
              key={exp.id} 
              // ✨ Catchy Interactive Hover Applied Here ✨
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300 flex flex-col relative overflow-hidden cursor-default"
            >
              {/* Subtle hover background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Top Row: Icon & Status */}
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

              {/* Title & Category */}
              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-blue-900 transition-colors">{exp.title}</h3>
                <p className="text-sm font-medium text-blue-600/80 mt-1">{exp.category}</p>
              </div>

              {/* Tags Container */}
              <div className="flex items-center justify-between mt-6 mb-5 relative z-10">
                <div className="flex gap-2">
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md border shadow-sm ${getDifficultyColor(exp.difficulty)}`}>
                    {exp.difficulty?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex gap-3 relative z-10">
                {status !== 'completed' && (
                  <button onClick={() => handleStart(exp)} className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    {status === 'in_progress' ? 'Continue Protocol' : 'Start Experiment'}
                  </button>
                )}
                {status === 'in_progress' && (
                  <button onClick={() => handleComplete(exp.id)} className="flex-1 bg-green-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    Mark Done
                  </button>
                )}
                {status === 'completed' && (
                  <button onClick={() => handleRetry(exp.id)} className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-200 hover:text-gray-900 border border-gray-200 transition-all duration-300">
                    Review / Retry
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