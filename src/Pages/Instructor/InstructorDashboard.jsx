import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FlaskConical, Clock, CheckCircle, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, assignedExperiments: 0, totalCompletions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        const instructorSections = currentUser.handledSections || [];
        if (instructorSections.length === 0) {
          setLoading(false);
          return;
        }

        // 1. Fetch Students
        const { data: myStudents } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('status', 'active')
          .in('section', instructorSections);

        // 2. Fetch Experiments assigned to these sections
        const { data: allExperiments } = await supabase
          .from('experiments')
          .select('id, assigned_sections')
          .eq('status', 'published');

        // Filter experiments where the assigned_sections array overlaps with the instructor's handledSections
        const assignedExperimentsCount = (allExperiments || []).filter(exp => 
          (exp.assigned_sections || []).some(sec => instructorSections.includes(sec))
        ).length;

        // 3. Fetch Completions
        let totalCompletionsCount = 0;
        if (myStudents && myStudents.length > 0) {
          const studentIds = myStudents.map(s => s.id);
          const { count } = await supabase
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')
            .in('user_id', studentIds);
            
          totalCompletionsCount = count || 0;
        }

        setStats({
          totalStudents: myStudents?.length || 0,
          assignedExperiments: assignedExperimentsCount,
          totalCompletions: totalCompletionsCount 
        });
      } catch (error) {
        console.error("Error fetching instructor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const channel = supabase.channel('instructor_dash_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDashboardData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-black text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}><Icon size={24} /></div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 relative z-10 bg-emerald-50 w-fit px-2 py-1 rounded">
          <TrendingUp size={14} className="mr-1" /> {trend}
        </div>
      )}
    </div>
  );

  const safeFirstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : '';

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Welcome back, Prof. {safeFirstName} 👋
        </h1>
        <p className="text-slate-500 font-medium mt-1">Here is what is happening in your virtual laboratory today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="My Students" value={stats.totalStudents} icon={Users} color="blue" />
          <StatCard title="Modules Posted" value={stats.assignedExperiments} icon={FlaskConical} color="purple" />
          <StatCard title="Total Completions" value={stats.totalCompletions} icon={CheckCircle} color="emerald" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Clock className="mr-2 text-purple-500" size={20} /> Recent Student Activity
            </h2>
          </div>
          <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Award className="text-slate-400" size={32} /></div>
            <h3 className="font-bold text-slate-700 text-lg">No recent activity</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">Student submissions and experiment completions will appear here once they start working on published modules.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Quick Actions</h2>
          <button onClick={() => navigate('/instructor/students')} className="p-5 bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md rounded-2xl text-left transition-all group">
            <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform"><Users size={20} /></div>
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">Manage Sections <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600 transition-colors" /></h3>
            <p className="text-xs text-slate-500 font-medium">View and organize your assigned student list.</p>
          </button>
          <button onClick={() => navigate('/instructor/experiments')} className="p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl text-left transition-all group">
            <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform"><FlaskConical size={20} /></div>
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">Post Experiments <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" /></h3>
            <p className="text-xs text-slate-500 font-medium">Assign lab modules to your classes.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;