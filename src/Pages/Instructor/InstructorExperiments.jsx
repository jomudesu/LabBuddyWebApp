import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FlaskConical, 
  ChevronRight, 
  LayoutGrid,
  BookOpen,
  Activity,
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';

const InstructorExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // ─── FETCH PUBLISHED EXPERIMENTS ───
  useEffect(() => {
    // Fetch ALL experiments to bypass Firestore's strict case-sensitivity
    const q = collection(db, 'experiment');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedExperiments = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Case-insensitive frontend filter
        if (data.status && data.status.toLowerCase() === 'published') {
          fetchedExperiments.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // Sort alphabetically by title
      fetchedExperiments.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setExperiments(fetchedExperiments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── EXTRACT DYNAMIC CATEGORIES ───
  const availableCategories = useMemo(() => {
    const categories = experiments
      .map(e => e.category)
      .filter(Boolean); // Remove undefined/null
    return ['All', ...new Set(categories)].sort();
  }, [experiments]);

  // ─── FILTERING ENGINE ───
  const processedExperiments = useMemo(() => {
    return experiments.filter(exp => {
      const safeTitle = (exp.title || '').toLowerCase();
      const safeDesc = (exp.description || '').toLowerCase();
      const queryText = searchQuery.toLowerCase();
      
      const matchesSearch = safeTitle.includes(queryText) || safeDesc.includes(queryText);
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [experiments, searchQuery, categoryFilter]);

  // ─── UI HELPERS ───
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'intermediate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'advanced': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      
      {/* ─── HEADER ─── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            <FlaskConical className="mr-3 text-purple-600" size={32} /> Experiment Tracking
          </h1>
          <p className="text-slate-500 font-medium mt-1">Browse available lab modules and track your sections' performance.</p>
        </div>
        
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 font-bold text-sm flex items-center shadow-sm w-fit">
          <BookOpen size={18} className="mr-2" /> Active Modules: {processedExperiments.length}
        </div>
      </div>

      {/* ─── CONTROL BAR ─── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 relative z-20">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments by title or keyword..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium" 
          />
        </div>
        
        <div className="relative shrink-0 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LayoutGrid className="text-slate-400" size={18} />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
          >
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Filter className="text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* ─── EXPERIMENT GRID ─── */}
      <div className="relative flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 form-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : processedExperiments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {processedExperiments.map((exp) => (
              <div 
                key={exp.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 flex flex-col group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300 border border-purple-100">
                    <FlaskConical size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${getDifficultyColor(exp.difficulty)}`}>
                    {exp.difficulty || 'Unrated'}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-purple-700 transition-colors line-clamp-2">
                    {exp.title || 'Untitled Module'}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {exp.description || 'No description available for this module.'}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Activity size={12} className="mr-1.5" />
                      {exp.category || 'General'}
                    </span>
                    
                    <button 
                      onClick={() => alert(`Opening analytics for: ${exp.title} (Coming Soon)`)}
                      className="flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <BarChart3 size={16} className="mr-1.5" /> Track Class
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-2xl shadow-sm text-center p-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">No Modules Found</h3>
            <p className="text-sm text-slate-500 max-w-md">
              There are currently no published experiments matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorExperiments;