import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  LayoutGrid, 
  CheckCircle2, 
  XCircle, 
  Minus,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorAnalytics = () => {
  const { currentUser } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
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

    // 1. Listen to Students (Filtered by Role)
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const fetched = [];
      snap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
      // Filter in-memory to strictly match the instructor's assigned sections
      const myStudents = fetched.filter(s => instructorSections.includes(s.section));
      myStudents.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      setStudents(myStudents);
    });

    // 2. Listen to Published Experiments
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

    // 3. Listen to User Progress
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
      const matchesSearch = (student.displayName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      return matchesSearch && matchesSection;
    });

    return filteredStudents.map(student => {
      // Find all progress documents for this specific student
      const studentRecords = progress.filter(p => p.userId === student.id);
      
      // Map completion statuses against all published experiments
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
    if (gradebook.length === 0 || experiments.length === 0) return { avgProgress: 0, topSection: '-' };
    
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
      
      {/* Sleek Horizontal Scrollbar for the Gradebook */}
      <style>{`
        .table-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .table-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
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
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="bg-blue-50 p-2 rounded-lg mr-3"><TrendingUp size={20} className="text-blue-600"/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average</p>
              <p className="text-xl font-black text-slate-800 leading-none">{metrics.avgProgress}%</p>
            </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="bg-purple-50 p-2 rounded-lg mr-3"><Award size={20} className="text-purple-600"/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Modules</p>
              <p className="text-xl font-black text-slate-800 leading-none">{experiments.length}</p>
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
            placeholder="Search students by name..." 
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

      {/* ─── GRADEBOOK MATRIX ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 relative">
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        )}

        <div className="overflow-auto flex-1 table-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 min-w-[250px]">
                  Student Roster
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center bg-slate-50 border-r border-slate-200">
                  Overall %
                </th>
                {experiments.map(exp => (
                  <th key={exp.id} className="px-6 py-4 text-xs font-bold text-slate-600 text-center bg-slate-50 border-r border-slate-100 max-w-[150px] truncate" title={exp.title}>
                    <div className="flex flex-col items-center">
                      <span className="truncate w-full block">{exp.title}</span>
                      <span className="text-[9px] font-medium text-slate-400 mt-0.5 tracking-widest uppercase">Module</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {gradebook.length > 0 ? (
                gradebook.map((student) => (
                  <tr key={student.id} className="hover:bg-purple-50/30 transition-colors">
                    
                    {/* Sticky Student Info Column */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-purple-50/50 px-6 py-4 border-r border-slate-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800">{student.displayName || 'Unknown Student'}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 ml-3">
                          {student.section}
                        </span>
                      </div>
                    </td>

                    {/* Progress Bar Column */}
                    <td className="px-6 py-4 border-r border-slate-200 bg-slate-50/30">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-xs font-black text-slate-700">{student.progressPercentage}%</span>
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Dynamic Experiment Completion Cells */}
                    {experiments.map(exp => {
                      const isCompleted = student.completions[exp.id];
                      return (
                        <td key={exp.id} className="px-6 py-4 border-r border-slate-100 text-center">
                          <div className="flex justify-center">
                            {isCompleted ? (
                              <div className="bg-emerald-50 text-emerald-500 p-1.5 rounded-lg border border-emerald-100 shadow-sm" title="Completed">
                                <CheckCircle2 size={18} />
                              </div>
                            ) : (
                              <div className="text-slate-300 p-1.5" title="Not Started">
                                <Minus size={18} />
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