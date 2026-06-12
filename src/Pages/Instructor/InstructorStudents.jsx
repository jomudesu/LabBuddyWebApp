import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Users, ChevronRight, Mail, GraduationCap, LayoutGrid, ShieldAlert } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';
import { useNavigate } from 'react-router-dom'; 

const InstructorStudents = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');

  const instructorSections = useMemo(() => {
    return currentUser?.handledSections || [];
  }, [currentUser]);

  // ─── FETCH STUDENTS FROM SUPABASE ───
  useEffect(() => {
    if (instructorSections.length === 0) {
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .in('section', instructorSections)
          .order('display_name', { ascending: true });

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedStudents = data.map(s => ({
          id: s.id,
          displayName: s.display_name,
          email: s.email,
          section: s.section,
          status: s.status,
          lastActive: s.last_login ? new Date(s.last_login).toLocaleDateString() : 'Never'
        }));

        setStudents(mappedStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();

    const channel = supabase.channel('instructor_students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `role=eq.student` }, () => fetchStudents())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [instructorSections]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const safeName = (student.displayName || '').toLowerCase();
      const safeEmail = (student.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = safeName.includes(query) || safeEmail.includes(query);
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [students, searchQuery, sectionFilter]);

  if (!loading && instructorSections.length === 0) {
    return (
      <div className="p-8 flex flex-col h-full items-center justify-center animate-fade-in">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Sections Assigned</h2>
          <p className="text-slate-500 text-sm">You currently do not have any classes assigned to you. Please contact a System Administrator to link sections to your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center"><Users className="mr-3 text-purple-600" size={32} /> My Students</h1>
          <p className="text-slate-500 font-medium mt-1">View your roster and monitor individual student engagement.</p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 font-bold text-sm flex items-center shadow-sm w-fit"><GraduationCap size={18} className="mr-2" /> Total Enrolled: {students.length}</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-20">
        <div className="relative flex-1 group"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students by name or email..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium" /></div>
        <div className="relative shrink-0 min-w-[200px]"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><LayoutGrid className="text-slate-400" size={18} /></div><select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium appearance-none cursor-pointer"><option value="All">All My Sections</option>{instructorSections.map(section => (<option key={section} value={section}>Section: {section}</option>))}</select><div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><Filter className="text-slate-400" size={16} /></div></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 relative">
        {loading && <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm"><tr className="border-b border-slate-100"><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Profile</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Section</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Account Status</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Progress</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4"><div className="flex items-center"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4 shadow-sm">{(student.displayName || 'S').charAt(0).toUpperCase()}</div><div><p className="font-bold text-slate-800">{student.displayName || 'Unknown'}</p><p className="text-[11px] text-slate-500 flex items-center mt-0.5"><Mail size={12} className="mr-1" /> {student.email}</p></div></div></td>
                    <td className="px-6 py-4 text-center"><span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{student.section}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${student.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>{student.status}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{student.lastActive}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => navigate('/instructor/analytics', { state: { searchTarget: student.displayName } })} className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">View Grades <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" /></button></td>
                  </tr>
                ))
              ) : !loading && (
                <tr><td colSpan="5" className="px-6 py-16 text-center text-slate-400"><div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100"><Users size={32} className="text-slate-300" /></div><p className="text-lg font-bold text-slate-600 mb-1">No students found</p><p className="text-sm">No students currently enrolled in your assigned sections.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorStudents;