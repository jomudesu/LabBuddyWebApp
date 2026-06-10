import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FlaskConical, 
  LayoutGrid,
  BookOpen,
  Activity,
  CheckCircle2,
  Minus,
  X,
  Users
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorExperiments = () => {
  const { currentUser } = useAuth();
  
  // ─── STATE MANAGEMENT ───
  const [experiments, setExperiments] = useState([]);
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');

  // Modal State
  const [selectedExp, setSelectedExp] = useState(null);

  const instructorSections = useMemo(() => {
    return currentUser?.handledSections || [];
  }, [currentUser]);

  // ─── FETCH ALL REQUIRED DATA ───
  useEffect(() => {
    if (instructorSections.length === 0) {
      setLoading(false);
      return;
    }

    // 1. Fetch Published Experiments
    const unsubExp = onSnapshot(collection(db, 'experiment'), (snap) => {
      const fetchedExp = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.status?.toLowerCase() === 'published') {
          fetchedExp.push({ id: doc.id, ...data });
        }
      });
      fetchedExp.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setExperiments(fetchedExp);
    });

    // 2. Fetch My Students
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const fetchedStudents = [];
      snap.forEach(doc => {
        const data = doc.data();
        // Only keep students in the instructor's assigned sections
        if (instructorSections.includes(data.section)) {
          fetchedStudents.push({ id: doc.id, ...data });
        }
      });
      fetchedStudents.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      setStudents(fetchedStudents);
    });

    // 3. Fetch Completed Progress
    const qProgress = query(collection(db, 'userProgress'), where('status', '==', 'completed'));
    const unsubProgress = onSnapshot(qProgress, (snap) => {
      const fetchedProg = [];
      snap.forEach(doc => fetchedProg.push({ id: doc.id, ...doc.data() }));
      setProgress(fetchedProg);
      setLoading(false);
    });

    return () => {
      unsubExp();
      unsubStudents();
      unsubProgress();
    };
  }, [instructorSections]);

  // ─── EXTRACT CATEGORIES ───
  const availableCategories = useMemo(() => {
    const categories = experiments.map(e => e.category).filter(Boolean);
    return ['All', ...new Set(categories)].sort();
  }, [experiments]);

  // ─── FILTER EXPERIMENTS ───
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

  // ─── FILTER STUDENTS BY SECTION ───
  const filteredStudents = useMemo(() => {
    if (sectionFilter === 'All') return students;
    return students.filter(student => student.section === sectionFilter);
  }, [students, sectionFilter]);

  // ─── CALCULATION HELPERS ───
  const getCompletionStats = (experimentId) => {
    if (filteredStudents.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    // Count how many of the FILTERED students have a completed record for this specific experiment
    const completedCount = progress.filter(p => 
      p.experimentId === experimentId && filteredStudents.some(s => s.id === p.userId)
    ).length;

    const percentage = Math.round((completedCount / filteredStudents.length) * 100);
    return { completed: completedCount, total: filteredStudents.length, percentage };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'intermediate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'advanced': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full relative animate-fade-in">
      
      {/* Sleek Scrollbar for Modal */}
      <style>{`
        .modal-scrollbar::-webkit-scrollbar { width: 6px; }
        .modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modal-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .modal-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; }
      `}</style>

      {/* ─── ATTENDANCE ROSTER MODAL ─── */}
      {selectedExp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-800 leading-tight pr-4">{selectedExp.title}</h2>
                <p className="text-sm font-bold text-purple-600 mt-1 uppercase tracking-wider">Attendance Roster</p>
                {sectionFilter !== 'All' && (
                  <p className="text-xs font-bold text-slate-500 mt-1">Filtering by Section: {sectionFilter}</p>
                )}
              </div>
              <button 
                onClick={() => setSelectedExp(null)} 
                className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable List) */}
            <div className="flex-1 overflow-y-auto modal-scrollbar p-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Section</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(student => {
                    const isCompleted = progress.some(p => p.userId === student.id && p.experimentId === selectedExp.id);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-700 text-sm">{student.displayName}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {student.section}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            {isCompleted ? (
                              <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded flex items-center text-xs font-bold border border-emerald-100">
                                <CheckCircle2 size={14} className="mr-1.5" /> Done
                              </div>
                            ) : (
                              <div className="bg-slate-50 text-slate-400 px-2.5 py-1 rounded flex items-center text-xs font-bold border border-slate-100">
                                <Minus size={14} className="mr-1.5" /> Pending
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-slate-400 text-sm font-medium">
                        No students found in the selected section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ─── PAGE HEADER ─── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            <FlaskConical className="mr-3 text-purple-600" size={32} /> Experiment Tracking
          </h1>
          <p className="text-slate-500 font-medium mt-1">Browse available lab modules and view completion attendance.</p>
        </div>
        
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 font-bold text-sm flex items-center shadow-sm w-fit">
          <BookOpen size={18} className="mr-2" /> Active Modules: {processedExperiments.length}
        </div>
      </div>

      {/* ─── CONTROL BAR ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-20">
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
        
        <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0">
          {/* Section Filter */}
          <div className="relative shrink-0 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className="text-slate-400" size={18} />
            </div>
            <select 
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="All">All My Sections</option>
              {instructorSections.map(section => (
                <option key={section} value={section}>Section: {section}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Filter className="text-slate-400" size={16} />
            </div>
          </div>

          {/* Category Filter */}
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
              
              return (
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
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {exp.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
                    
                    {/* Minimal Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-500 uppercase tracking-wider">Class Completion</span>
                        <span className={stats.percentage === 100 && stats.total > 0 ? 'text-emerald-600' : 'text-purple-600'}>
                          {stats.completed} / {stats.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${stats.percentage === 100 && stats.total > 0 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                        <Activity size={12} className="mr-1.5" />
                        {exp.category || 'General'}
                      </span>
                      
                      <button 
                        onClick={() => setSelectedExp(exp)}
                        className="flex items-center text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-purple-200"
                      >
                        <Users size={16} className="mr-2" /> View Roster
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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