import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Search, Filter, LayoutGrid, CheckCircle2, Minus, TrendingUp, Award, AlertCircle, FlaskConical, Mail, X, RotateCcw } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';
import { useLocation } from 'react-router-dom';

const getEaristGrade = (percentage) => {
  if (percentage >= 97) return '1.00';
  if (percentage >= 94) return '1.25';
  if (percentage >= 91) return '1.50';
  if (percentage >= 88) return '1.75';
  if (percentage >= 85) return '2.00';
  if (percentage >= 82) return '2.25';
  if (percentage >= 79) return '2.50';
  if (percentage >= 76) return '2.75';
  if (percentage === 75) return '3.00';
  return '5.00'; 
};

const InstructorAnalytics = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const [students, setStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(location.state?.searchTarget || '');
  const [sectionFilter, setSectionFilter] = useState('All');

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [resetting, setResetting] = useState(false);

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
        if (progRes.data) setProgress(progRes.data.map(p => ({ 
          ...p, 
          userId: p.user_id, 
          experimentId: p.experiment_id,
          grade: p.grade,
          errors: p.errors 
        })));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase.channel('instructor_analytics')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [instructorSections]);

  const gradebook = useMemo(() => {
    let filteredStudents = students.filter(student => {
      const matchesSearch = (student.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (student.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      return matchesSearch && matchesSection;
    });

    return filteredStudents.map(student => {
      const studentRecords = progress.filter(p => p.userId === student.id);
      const completions = {};
      let completedCount = 0;

      experiments.forEach(exp => {
        const record = studentRecords.find(p => p.experimentId === exp.id);
        if (record && record.status === 'completed') { 
          completions[exp.id] = { completed: true, grade: record.grade, errors: record.errors || 0 }; 
          completedCount++; 
        } 
        else { completions[exp.id] = { completed: false }; }
      });

      const progressPercentage = experiments.length > 0 ? Math.round((completedCount / experiments.length) * 100) : 0;
      return { ...student, completions, completedCount, progressPercentage };
    });
  }, [students, experiments, progress, searchQuery, sectionFilter]);

  const metrics = useMemo(() => {
    if (gradebook.length === 0 || experiments.length === 0) return { avgProgress: 0 };
    const totalPercentage = gradebook.reduce((sum, s) => sum + s.progressPercentage, 0);
    return { avgProgress: Math.round(totalPercentage / gradebook.length) };
  }, [gradebook, experiments]);

  const handleResetProgress = async () => {
    if (!selectedRecord) return;
    setResetting(true);
    try {
      await supabase
        .from('user_progress')
        .delete()
        .match({ 
          user_id: selectedRecord.student.id, 
          experiment_id: selectedRecord.exp.id 
        });
      setSelectedRecord(null);
    } catch (error) {
      console.error("Error resetting progress:", error);
    } finally {
      setResetting(false);
    }
  };

  if (!loading && instructorSections.length === 0) {
    return <div className="p-8 flex items-center justify-center h-full"><div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-lg border border-slate-200"><AlertCircle size={48} className="text-amber-500 mx-auto mb-4" /><h2 className="text-xl font-bold">No Sections Assigned</h2></div></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in relative">
      <style>{`.table-scrollbar::-webkit-scrollbar { height: 8px; } .table-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }`}</style>

      {/* Reconsideration Reset Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 leading-tight pr-4">{selectedRecord.exp.title}</h3>
                <p className="text-xs font-bold text-purple-600 mt-1 uppercase tracking-wider">{selectedRecord.student.displayName}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5 transition-colors"><X size={16} /></button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl mb-6">
                 <div className="text-center w-1/2 border-r border-slate-200">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">EARIST Grade</p>
                   <p className={`text-3xl font-black ${selectedRecord.details.grade >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {getEaristGrade(selectedRecord.details.grade)}
                   </p>
                   <p className="text-xs font-bold text-slate-400 mt-1">({selectedRecord.details.grade}%)</p>
                 </div>
                 <div className="text-center w-1/2">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Misclicks</p>
                   <p className="text-3xl font-black text-amber-500">{selectedRecord.details.errors}</p>
                   <p className="text-xs font-bold text-slate-400 mt-1">Errors Made</p>
                 </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
                 <h4 className="text-sm font-bold text-rose-800 mb-2 flex items-center justify-center gap-2"><RotateCcw size={16}/> Reconsideration Request</h4>
                 <p className="text-xs text-rose-600 mb-4 leading-relaxed">This will completely wipe the student's recorded grade for this module and allow them to attempt it again from scratch.</p>
                 <button 
                   onClick={handleResetProgress}
                   disabled={resetting}
                   className="w-full bg-rose-600 text-white font-bold py-2.5 rounded-lg hover:bg-rose-700 shadow-sm transition-all disabled:opacity-50"
                 >
                   {resetting ? 'Wiping Record...' : 'Wipe & Reset Progress'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div><h1 className="text-3xl font-extrabold text-slate-800 flex items-center"><BarChart3 className="mr-3 text-purple-600" size={32} /> Grades & Analytics</h1><p className="text-slate-500 mt-1">Track comprehensive class progress across all published modules.</p></div>
        <div className="flex gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white px-6 py-4 rounded-2xl border border-blue-100 shadow-sm flex items-center"><div className="bg-blue-100 p-3 rounded-xl mr-4 text-blue-600"><TrendingUp size={24}/></div><div><p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-0.5">Class Average</p><p className="text-2xl font-black">{metrics.avgProgress}%</p></div></div>
          <div className="bg-gradient-to-br from-purple-50 to-white px-6 py-4 rounded-2xl border border-purple-100 shadow-sm flex items-center"><div className="bg-purple-100 p-3 rounded-xl mr-4 text-purple-600"><Award size={24}/></div><div><p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mb-0.5">Active Modules</p><p className="text-2xl font-black">{experiments.length}</p></div></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 z-20"><div className="relative flex-1 group"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" /></div><div className="relative shrink-0 min-w-[200px]"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><LayoutGrid className="text-slate-400" size={18} /></div><select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl appearance-none"><option value="All">All My Sections</option>{instructorSections.map(s => <option key={s} value={s}>Section: {s}</option>)}</select></div></div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 relative">
        {loading && <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>}
        <div className="overflow-auto flex-1 table-scrollbar bg-slate-50/30">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead className="sticky top-0 z-20 bg-slate-100/90 backdrop-blur-md shadow-sm border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-100/95 backdrop-blur-md px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 min-w-[300px]">Student Roster</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center border-r border-slate-200 bg-slate-100/90">Overall Progress</th>
                {experiments.map(exp => <th key={exp.id} className="px-6 py-4 text-center border-r border-slate-200 bg-slate-100/90 max-w-[160px] truncate" title={exp.title}><div className="flex flex-col items-center"><div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs"><FlaskConical size={12} className="text-purple-500 shrink-0" /><span className="truncate">{exp.title}</span></div><span className="text-[9px] font-extrabold text-slate-400 mt-1 tracking-widest uppercase">Module</span></div></th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {gradebook.length > 0 ? gradebook.map((student) => (
                <tr key={student.id} className="hover:bg-purple-50/20 group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-purple-50/50 px-6 py-3.5 border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.02)]"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">{(student.displayName || 'S').charAt(0).toUpperCase()}</div><div className="flex flex-col"><span className="font-bold text-slate-800 text-sm leading-tight">{student.displayName}</span><span className="text-[10px] text-slate-500 flex items-center mt-0.5"><Mail size={10} className="mr-1 opacity-70" /> {student.email}</span></div></div><span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 ml-4">{student.section}</span></div></td>
                  <td className="px-6 py-3.5 border-r border-slate-200 bg-slate-50/30"><div className="flex items-center gap-3 justify-center"><div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${student.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${student.progressPercentage}%` }}/></div><span className={`text-xs font-black w-8 text-right ${student.progressPercentage === 100 ? 'text-emerald-600' : 'text-slate-700'}`}>{student.progressPercentage}%</span></div></td>
                  {experiments.map(exp => (
                    <td key={exp.id} className="px-6 py-3.5 border-r border-slate-100 text-center">
                      <div className="flex justify-center items-center h-full">
                        {/* Interactive Completion Pill with Reset Modal */}
                        {student.completions[exp.id]?.completed ? (
                          <button 
                            onClick={() => setSelectedRecord({ student, exp, details: student.completions[exp.id] })} 
                            className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 hover:bg-emerald-200 hover:scale-110 transition-all cursor-pointer" 
                            title="View Details & Reset"
                          >
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <div className="w-7 h-7 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center border border-slate-200" title="Not Started">
                            <Minus size={16} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              )) : !loading && <tr><td colSpan={experiments.length + 2} className="px-6 py-16 text-center text-slate-400"><Search size={24} className="mx-auto mb-4 text-slate-300" /><p className="text-lg font-bold text-slate-600">No data</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;