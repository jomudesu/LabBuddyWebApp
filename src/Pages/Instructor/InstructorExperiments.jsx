import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, FlaskConical, LayoutGrid, BookOpen, Activity, CheckCircle2, Minus, X, Users, Send } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorExperiments = () => {
  const { currentUser } = useAuth();
  
  const [experiments, setExperiments] = useState([]);
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  
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

        if (expRes.data) setExperiments(expRes.data.sort((a,b) => a.title.localeCompare(b.title)));
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

  const availableCategories = useMemo(() => ['All', ...new Set(experiments.map(e => e.category).filter(Boolean))].sort(), [experiments]);

  const processedExperiments = useMemo(() => {
    return experiments.filter(exp => {
      const matchesSearch = (exp.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (exp.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [experiments, searchQuery, categoryFilter]);

  const filteredStudents = useMemo(() => {
    if (sectionFilter === 'All') return students;
    return students.filter(student => student.section === sectionFilter);
  }, [students, sectionFilter]);

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

  // Toggle Assignment for a Section
  const handleToggleAssignment = async (expId, section, currentAssigned) => {
    setUpdating(true);
    const assignedArray = currentAssigned || [];
    const isCurrentlyAssigned = assignedArray.includes(section);
    
    const newAssigned = isCurrentlyAssigned 
      ? assignedArray.filter(s => s !== section) 
      : [...assignedArray, section];

    try {
      await supabase.from('experiments').update({ assigned_sections: newAssigned }).eq('id', expId);
      
      // Update local state immediately for snappy UI
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
                {sectionFilter !== 'All' && <p className="text-xs font-bold text-slate-500 mt-1">Filtering by Section: {sectionFilter}</p>}
              </div>
              <button onClick={() => setSelectedExpForRoster(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5"><X size={20} /></button>
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
                  {filteredStudents.map(student => { 
                    const isCompleted = progress.some(p => p.userId === student.id && p.experimentId === selectedExpForRoster.id && p.status === 'completed'); 
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3"><p className="font-bold text-slate-700 text-sm">{student.displayName}</p></td>
                        <td className="px-4 py-3 text-center"><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{student.section}</span></td>
                        <td className="px-4 py-3 text-center"><div className="flex justify-center">{isCompleted ? <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded flex items-center text-xs font-bold border border-emerald-100"><CheckCircle2 size={14} className="mr-1.5" /> Done</div> : <div className="bg-slate-50 text-slate-400 px-2.5 py-1 rounded flex items-center text-xs font-bold border border-slate-100"><Minus size={14} className="mr-1.5" /> Pending</div>}</div></td>
                      </tr> 
                    )
                  })}
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
              <button onClick={() => setSelectedExpForAssign(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5"><X size={20} /></button>
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
              <button onClick={() => setSelectedExpForAssign(null)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all">Done</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center"><FlaskConical className="mr-3 text-purple-600" size={32} /> Experiment Tracking</h1><p className="text-slate-500 font-medium mt-1">Assign lab modules to your classes and monitor completion.</p></div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 font-bold text-sm flex items-center shadow-sm w-fit"><BookOpen size={18} className="mr-2" /> Global Modules: {processedExperiments.length}</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-20">
        <div className="relative flex-1 group"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search experiments by title..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
        <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0">
          <div className="relative shrink-0 min-w-[200px]"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><LayoutGrid className="text-slate-400" size={18} /></div><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">{availableCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}</select></div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
        {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div> : processedExperiments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {processedExperiments.map((exp) => {
              const stats = getCompletionStats(exp.id);
              
              // Count how many of the instructor's sections are assigned to this experiment
              const assignedCount = instructorSections.filter(s => (exp.assigned_sections || []).includes(s)).length;
              const isAssignedToAny = assignedCount > 0;

              return (
                <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                  
                  {/* ✨ Assignment Status Badge */}
                  <div className={`absolute -top-3 -right-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase shadow-sm ${isAssignedToAny ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {isAssignedToAny ? `Posted to ${assignedCount} Classes` : 'Not Posted'}
                  </div>

                  <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100"><FlaskConical size={24} /></div><span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${getDifficultyColor(exp.difficulty)}`}>{exp.difficulty}</span></div>
                  <div className="flex-1"><h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{exp.title}</h3><p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{exp.description}</p></div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-slate-500 uppercase">Class Completion</span><span className={stats.percentage === 100 && stats.total > 0 ? 'text-emerald-600' : 'text-purple-600'}>{stats.completed} / {stats.total}</span></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${stats.percentage === 100 && stats.total > 0 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${stats.percentage}%` }}/></div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <button onClick={() => setSelectedExpForAssign(exp)} className={`flex-1 flex items-center justify-center text-xs font-bold px-3 py-2.5 rounded-lg border transition-all ${isAssignedToAny ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        <Send size={14} className="mr-1.5" /> Assign Module
                      </button>
                      <button onClick={() => setSelectedExpForRoster(exp)} className="flex-1 flex items-center justify-center text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-2.5 rounded-lg shadow-sm transition-all">
                        <Users size={14} className="mr-1.5" /> View Roster
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-2xl shadow-sm"><BookOpen size={32} className="text-slate-300 mb-4" /><h3 className="text-xl font-bold text-slate-700">No Modules Found</h3></div>}
      </div>
    </div>
  );
};

export default InstructorExperiments;