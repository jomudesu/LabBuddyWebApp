import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  ChevronRight, 
  Mail,
  GraduationCap,
  LayoutGrid,
  ShieldAlert
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';
import { useNavigate } from 'react-router-dom'; 

const InstructorStudents = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');

  // Extract the instructor's assigned sections from their Auth profile
  const instructorSections = useMemo(() => {
    return currentUser?.handledSections || [];
  }, [currentUser]);

  // ─── FETCH STUDENTS FROM FIREBASE ───
  useEffect(() => {
    // If the instructor has no sections assigned, don't bother querying
    if (instructorSections.length === 0) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedStudents = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Format the lastLogin timestamp gracefully
        const lastActive = data.lastLogin 
          ? data.lastLogin.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Never logged in';

        fetchedStudents.push({
          id: doc.id,
          ...data,
          lastActive
        });
      });
      
      // Sort alphabetically by name
      fetchedStudents.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      setStudents(fetchedStudents);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [instructorSections]);

  // ─── EXTRACT DYNAMIC SECTIONS ───
  const availableSections = useMemo(() => {
    // Only show sections that this instructor specifically handles
    return ['All', ...instructorSections].sort();
  }, [instructorSections]);

  // ─── FILTERING ENGINE ───
  const processedStudents = useMemo(() => {
    return students.filter(student => {
      // STRICT FILTER: Must belong to one of their assigned sections
      if (!instructorSections.includes(student.section)) return false;

      const safeName = (student.displayName || '').toLowerCase();
      const safeEmail = (student.email || '').toLowerCase();
      const queryText = searchQuery.toLowerCase();
      
      const matchesSearch = safeName.includes(queryText) || safeEmail.includes(queryText);
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      
      return matchesSearch && matchesSection;
    });
  }, [students, searchQuery, sectionFilter, instructorSections]);

  // ✨ NEW: Render a warning if the Admin hasn't assigned them any sections yet
  if (!loading && instructorSections.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full items-center justify-center animate-fade-in">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-lg">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ShieldAlert size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Sections Assigned</h2>
          <p className="text-sm text-slate-500">
            You currently do not have any class sections assigned to your instructor profile. Please contact a System Administrator to link your sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      
      {/* ─── HEADER ─── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            <Users className="mr-3 text-purple-600" size={32} /> My Students
          </h1>
          <p className="text-slate-500 font-medium mt-1">View your roster and monitor individual student engagement.</p>
        </div>
        
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 font-bold text-sm flex items-center shadow-sm w-fit">
          <GraduationCap size={18} className="mr-2" /> Total Enrolled: {processedStudents.length}
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
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium" 
          />
        </div>
        
        <div className="relative shrink-0 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LayoutGrid className="text-slate-400" size={18} />
          </div>
          <select 
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
          >
            {availableSections.map(section => (
              <option key={section} value={section}>
                {section === 'All' ? 'All My Sections' : `Section: ${section}`}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Filter className="text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 relative">
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        )}

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStudents.length > 0 ? (
                processedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4 shrink-0 shadow-sm shadow-purple-200">
                          {(student.displayName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{student.displayName || 'Unknown Student'}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                            <Mail size={12} className="mr-1 opacity-70" /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200`}>
                        {student.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.status === 'disabled' ? (
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100">Disabled</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {student.lastActive}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate('/instructor/analytics', { state: { searchTarget: student.displayName } })}
                        className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        View Grades <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Users size={32} className="text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-600 mb-1">No students found</p>
                    <p className="text-sm">No students currently enrolled in your assigned sections.</p>
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

export default InstructorStudents;