import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, FlaskConical, LayoutGrid, BookOpen, Activity, CheckCircle2, Minus, X, Users, Send, BarChart2, ArrowDownAZ } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorExperiments = () => {
  const { currentUser } = useAuth();
  
  const [experiments, setExperiments] = useState([]);
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // ─── FILTER STATES ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All',
    section: 'All',
    sortBy: 'default'
  });
  
  const [selectedExpForRoster, setSelectedExpForRoster] = useState(null);
  const [selectedExpForAssign, setSelectedExpForAssign] = useState(null);

  const instructorSections = useMemo(() => currentUser?.handledSections || [], [currentUser]);

  // ─── FETCH SUPABASE DATA ───
  useEffect(() => {
    if (instructorSections.length === 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [expRes, stuRes, progRes] = await Promise.all([
          supabase.from('experiments').select('*').eq('status', 'published'),
          supabase.from('users').select('*').eq('role', 'student').in('section', instructorSections),
          supabase.from('user_progress').select('*')
        ]);

        if (expRes.data) setExperiments(expRes.data);
        if (stuRes.data) setStudents(stuRes.data.map(s => ({ ...s, displayName: s.display_name })).sort((a,b) => a.displayName.localeCompare(b.displayName)));
        if (progRes.data) setProgress(progRes.data.map(p => ({ ...p, userId: p.user_id, experimentId: p.experiment_id })));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase.channel('instructor_exps')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [instructorSections]);

  // ─── FILTER LOGIC ───
  const availableCategories = useMemo(() => ['All', ...new Set(experiments.map(e => e.category).filter(Boolean))].sort(), [experiments]);
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const processedExperiments = useMemo(() => {
    let result = experiments.filter(exp => {
      const matchesSearch = (exp.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (exp.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || exp.category === filters.category;
      const matchesDifficulty = filters.difficulty === 'All' || exp.difficulty === filters.difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    if (filters.sortBy === 'a-z') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (filters.sortBy === 'z-a') result.sort((a, b) => b.title.localeCompare(a.title));
    else result.sort((a, b) => a.title.localeCompare(b.title)); // default sort

    return result;
  }, [experiments, searchQuery, filters]);

  // Filter students based on the Section filter for Accurate Stats
  const filteredStudents = useMemo(() => {
    if (filters.section === 'All') return students;
    return students.filter(student => student.section === filters.section);
  }, [students, filters.section]);

  const activeFilterCount = (filters.category !== 'All' ? 1 : 0) + (filters.difficulty !== 'All' ? 1 : 0) + (filters.section !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({ category: 'All', difficulty: 'All', section: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  const getCompletionStats = (experimentId) => {
    if (filteredStudents.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completedCount = progress.filter(p => p.experimentId === experimentId && filteredStudents.some(s => s.id === p.userId && p.status === 'completed')).length;
    return { completed: completedCount, total: filteredStudents.length, percentage: Math.round((completedCount / filteredStudents.length) * 100) };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'intermediate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'advanced': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  // ─── TOGGLE ASSIGNMENT ───
  const handleToggleAssignment = async (expId, section, currentAssigned) => {
    setUpdating(true);
    const assignedArray = currentAssigned || [];
    const isCurrentlyAssigned = assignedArray.includes(section);
    
    const newAssigned = isCurrentlyAssigned 
      ? assignedArray.filter(s => s !== section) 
      : [...assignedArray, section];

    try {
      await supabase.from('experiments').update({ assigned_sections: newAssigned }).eq('id', expId);
      setExperiments(prev => prev.map(e => e.id === expId ? { ...e, assigned_sections: newAssigned } : e));
      if (selectedExpForAssign && selectedExpForAssign.id === expId) {
        setSelectedExpForAssign({ ...selectedExpForAssign, assigned_sections: newAssigned });
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full relative animate-fade-in">
      
      {/* ─── MODAL 1: ATTENDANCE ROSTER ─── */}
      {selectedExpForRoster && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-800 leading-tight pr-4">{selectedExpForRoster.title}</h2>
                <p className="text-sm font-bold text-purple-600 mt-1 uppercase tracking-wider">Attendance Roster</p>
                {filters.section !== 'All' && <p className="text-xs font-bold text-slate-500 mt-1">Filtering by Section: {filters.section}</p>}
              </div>
              <button onClick={() => setSelectedExpForRoster(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Section</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => { 
                    const isCompleted = progress.some(p => p.userId === student.id && p.experimentId === selectedExpForRoster.id && p.status === 'completed'); 
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3"><p className="font-bold text-slate-700 text-sm">{student.displayName}</p></td>
                        <td className="px-4 py-3 text-center"><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{student.section}</span></td>
                        <td className="px-4 py-3 text-center"><div className="flex justify-center">{isCompleted ? <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded flex items-center text-xs font-bold border border-emerald-100"><CheckCircle2 size={14} className="mr-1.5" /> Done</div> : <div className="bg-slate-50 text-slate-400 px-2.5 py-1 rounded flex items-center text-xs font-bold border border-slate-100"><Minus size={14} className="mr-1.5" /> Pending</div>}</div></td>
                      </tr> 
                    )
                  }) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center text-slate-400">
                        <Users className="mx-auto mb-3 opacity-50" size={32} />
                        <p className="text-sm font-semibold">No students found in this section.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ASSIGNMENT MANAGER ─── */}
      {selectedExpForAssign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-800 leading-tight pr-4">{selectedExpForAssign.title}</h2>
                <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider flex items-center gap-2"><Send size={16}/> Assign to Classes</p>
              </div>
              <button onClick={() => setSelectedExpForAssign(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4 leading-relaxed text-justify">Toggle the switches below to post this experiment to your handled sections. Students in active sections will immediately see it on their dashboard.</p>
              <div className="space-y-3">
                {instructorSections.map(section => {
                  const isAssigned = (selectedExpForAssign.assigned_sections || []).includes(section);
                  return (
                    <div key={section} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isAssigned ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`font-bold ${isAssigned ? 'text-blue-700' : 'text-slate-600'}`}>Section: {section}</span>
                      <button 
                        disabled={updating}
                        onClick={() => handleToggleAssignment(selectedExpForAssign.id, section, selectedExpForAssign.assigned_sections)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAssigned ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAssigned ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setSelectedExpForAssign(null)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all shadow-md">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            <FlaskConical className="mr-3 text-purple-600" size={32} /> 
            Experiment Tracking
          </h1>
          <p className="text-slate-500 font-medium mt-1">Assign lab modules to your classes and monitor completion.</p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 font-bold text-sm flex items-center shadow-sm w-fit">
          <BookOpen size={18} className="mr-2" /> Global Modules: {processedExperiments.length}
        </div>
      </div>

      {/* ─── SEARCH & FILTER TOGGLE ROW ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments by title or description..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${
            showFilters || activeFilterCount > 0 
            ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200 hover:bg-purple-700' 
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <Filter size={20} className="mr-2" /> 
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-3 bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── EXPANDABLE FILTERS PANEL ─── */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Refine Parameters</h3>
            {activeFilterCount > 0 && (
              <button onClick={handleClearFilters} className="text-sm text-rose-500 hover:text-rose-700 flex items-center font-medium transition-colors">
                <X size={16} className="mr-1" /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><LayoutGrid size={16} className="text-purple-500"/> Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer font-medium text-slate-700"
              >
                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><BarChart2 size={16} className="text-purple-500"/> Difficulty</label>
              <select 
                value={filters.difficulty} 
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer font-medium text-slate-700"
              >
                {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Users size={16} className="text-purple-500"/> Section Stats</label>
              <select 
                value={filters.section} 
                onChange={(e) => setFilters({...filters, section: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer font-medium text-slate-700"
                title="Filter completion progress bars by a specific section"
              >
                <option value="All">All Sections (Combined)</option>
                {instructorSections.map(sec => <option key={sec} value={sec}>Section: {sec}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><ArrowDownAZ size={16} className="text-purple-500"/> Sort Order</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer font-medium text-slate-700"
              >
                <option value="default">Default Order</option>
                <option value="a-z">Alphabetical (A - Z)</option>
                <option value="z-a">Alphabetical (Z - A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── EXPERIMENT GRID ─── */}
      <div className="relative flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : processedExperiments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {processedExperiments.map((exp) => {
              const stats = getCompletionStats(exp.id);
              const assignedCount = instructorSections.filter(s => (exp.assigned_sections || []).includes(s)).length;
              const isAssignedToAny = assignedCount > 0;

              return (
                <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                      <FlaskConical size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${getDifficultyColor(exp.difficulty)}`}>
                        {exp.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase shadow-sm ${isAssignedToAny ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {isAssignedToAny ? `Posted to ${assignedCount} Classes` : 'Not Posted'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-purple-800 transition-colors">{exp.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{exp.description}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-500 uppercase flex items-center gap-1">
                          {filters.section !== 'All' ? `Section ${filters.section} Stats` : 'Class Completion'}
                        </span>
                        <span className={stats.percentage === 100 && stats.total > 0 ? 'text-emerald-600' : 'text-purple-600'}>
                          {stats.completed} / {stats.total}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${stats.percentage === 100 && stats.total > 0 ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <button onClick={() => setSelectedExpForAssign(exp)} className={`flex-1 flex items-center justify-center text-xs font-bold px-3 py-2.5 rounded-lg border transition-all ${isAssignedToAny ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        <Send size={14} className="mr-1.5" /> Assign Module
                      </button>
                      <button onClick={() => setSelectedExpForRoster(exp)} className="flex-1 flex items-center justify-center text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                        <Users size={14} className="mr-1.5" /> View Roster
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <BookOpen size={32} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Modules Found</h3>
            <p className="text-sm text-slate-400 mt-2">Try adjusting your filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorExperiments;