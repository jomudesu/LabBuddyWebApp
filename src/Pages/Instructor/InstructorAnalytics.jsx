import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  LayoutGrid, 
  CheckCircle2, 
  Minus,
  TrendingUp,
  Award,
  AlertCircle,
  FlaskConical,
  Mail
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';
import { useLocation } from 'react-router-dom';

const InstructorAnalytics = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const [students, setStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters (Autofill search if passed via navigation state)
  const [searchQuery, setSearchQuery] = useState(location.state?.searchTarget || '');
  const [sectionFilter, setSectionFilter] = useState('All');

  const instructorSections = useMemo(() => {
    return currentUser?.handledSections || [];
  }, [currentUser]);

  // ─── REAL-TIME DATA FETCHING ───
  useEffect(() => {
    if (instructorSections.length === 0) {
      setLoading(false);
      return;
    }

    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const fetched = [];
      snap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
      const myStudents = fetched.filter(s => instructorSections.includes(s.section));
      myStudents.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      setStudents(myStudents);
    });

    const qExp = collection(db, 'experiment');
    const unsubExp = onSnapshot(qExp, (snap) => {
      const fetched = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.status?.toLowerCase() === 'published') {
          fetched.push({ id: doc.id, ...data });
        }
      });
      fetched.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setExperiments(fetched);
    });

    const qProgress = collection(db, 'userProgress');
    const unsubProgress = onSnapshot(qProgress, (snap) => {
      const fetched = [];
      snap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
      setProgress(fetched);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubExp();
      unsubProgress();
    };
  }, [instructorSections]);

  // ─── GRADEBOOK MATRIX GENERATION ───
  const gradebook = useMemo(() => {
    let filteredStudents = students.filter(student => {
      const safeName = (student.displayName || '').toLowerCase();
      const safeEmail = (student.email || '').toLowerCase();
      const queryText = searchQuery.toLowerCase();
      
      const matchesSearch = safeName.includes(queryText) || safeEmail.includes(queryText);
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
          completions[exp.id] = true;
          completedCount++;
        } else {
          completions[exp.id] = false;
        }
      });

      const progressPercentage = experiments.length > 0 
        ? Math.round((completedCount / experiments.length) * 100) 
        : 0;

      return {
        ...student,
        completions,
        completedCount,
        progressPercentage
      };
    });
  }, [students, experiments, progress, searchQuery, sectionFilter]);

  // ─── METRICS CALCULATION ───
  const metrics = useMemo(() => {
    if (gradebook.length === 0 || experiments.length === 0) return { avgProgress: 0 };
    const totalPercentage = gradebook.reduce((sum, s) => sum + s.progressPercentage, 0);
    const avgProgress = Math.round(totalPercentage / gradebook.length);
    return { avgProgress };
  }, [gradebook, experiments]);

  if (!loading && instructorSections.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full items-center justify-center animate-fade-in">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-lg">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Sections Assigned</h2>
          <p className="text-sm text-slate-500">You must be assigned to at least one class section by an Admin to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      
      {/* Sleek Horizontal Scrollbar */}
      <style>{`
        .table-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .table-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
        .table-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .table-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}</style>

      {/* ─── HEADER & METRICS ─── */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            <BarChart3 className="mr-3 text-purple-600" size={32} /> Grades & Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">Track comprehensive class progress across all published modules.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white px-6 py-4 rounded-2xl border border-blue-100 shadow-sm flex items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-blue-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
            <div className="bg-blue-100 p-3 rounded-xl mr-4 text-blue-600 shadow-inner"><TrendingUp size={24}/></div>
            <div>
              <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-0.5">Class Average</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{metrics.avgProgress}%</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white px-6 py-4 rounded-2xl border border-purple-100 shadow-sm flex items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-purple-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
            <div className="bg-purple-100 p-3 rounded-xl mr-4 text-purple-600 shadow-inner"><Award size={24}/></div>
            <div>
              <p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mb-0.5">Active Modules</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{experiments.length}</p>
            </div>
          </div>
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
            placeholder="Search students by name or email..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium" 
          />
        </div>
        
        <div className="relative shrink-0 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LayoutGrid className="text-slate-400" size={18} />
          </div>
          <select 
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium appearance-none cursor-pointer"
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
      </div>

      {/* ─── ENHANCED GRADEBOOK MATRIX ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 relative">
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        )}

        <div className="overflow-auto flex-1 table-scrollbar bg-slate-50/30">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            
            <thead className="sticky top-0 z-20 bg-slate-100/90 backdrop-blur-md shadow-sm border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-100/95 backdrop-blur-md px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 min-w-[300px] shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
                  Student Roster
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center border-r border-slate-200 bg-slate-100/90">
                  Overall Progress
                </th>
                {experiments.map(exp => (
                  <th key={exp.id} className="px-6 py-4 text-center border-r border-slate-200 bg-slate-100/90 max-w-[160px] truncate" title={exp.title}>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs truncate w-full justify-center">
                        <FlaskConical size={12} className="text-purple-500 shrink-0" />
                        <span className="truncate">{exp.title}</span>
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400 mt-1 tracking-widest uppercase">Module</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 bg-white">
              {gradebook.length > 0 ? (
                gradebook.map((student) => (
                  <tr key={student.id} className="hover:bg-purple-50/20 transition-colors group">
                    
                    {/* ENHANCED: Sticky Student Info Column */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-purple-50/50 px-6 py-3.5 border-r border-slate-200 transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {(student.displayName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm leading-tight">
                              {student.displayName || 'Unknown Student'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium flex items-center mt-0.5">
                              <Mail size={10} className="mr-1 opacity-70" /> {student.email}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 ml-4 shrink-0">
                          {student.section}
                        </span>
                      </div>
                    </td>

                    {/* ENHANCED: Progress Bar Column */}
                    <td className="px-6 py-3.5 border-r border-slate-200 bg-slate-50/30">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${student.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                        <span className={`text-xs font-black w-8 text-right ${student.progressPercentage === 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {student.progressPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* ENHANCED: Dynamic Experiment Completion Cells */}
                    {experiments.map(exp => {
                      const isCompleted = student.completions[exp.id];
                      return (
                        <td key={exp.id} className="px-6 py-3.5 border-r border-slate-100 text-center">
                          <div className="flex justify-center items-center h-full">
                            {isCompleted ? (
                              <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm border border-emerald-200" title="Completed">
                                <CheckCircle2 size={16} strokeWidth={2.5} />
                              </div>
                            ) : (
                              <div className="w-7 h-7 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center border border-slate-200" title="Not Started">
                                <Minus size={16} strokeWidth={2.5} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan={experiments.length + 2} className="px-6 py-16 text-center text-slate-400 bg-white">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Search size={24} className="text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-600 mb-1">No data to display</p>
                    <p className="text-sm">We couldn't find any students matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;