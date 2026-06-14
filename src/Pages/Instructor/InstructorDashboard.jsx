import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FlaskConical, Clock, CheckCircle, TrendingUp, Award, ChevronRight, Activity } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, assignedExperiments: 0, totalCompletions: 0, history: [] });
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
          .select('id, display_name, section')
          .eq('role', 'student')
          .eq('status', 'active')
          .in('section', instructorSections);

        // 2. Fetch Experiments assigned to these sections
        const { data: allExperiments } = await supabase
          .from('experiments')
          .select('id, title, assigned_sections')
          .eq('status', 'published');

        const assignedExperimentsCount = (allExperiments || []).filter(exp => 
          (exp.assigned_sections || []).some(sec => instructorSections.includes(sec))
        ).length;

        // 3. Fetch Progress & History
        let totalCompletionsCount = 0;
        let historyFeed = [];

        if (myStudents && myStudents.length > 0) {
          const studentIds = myStudents.map(s => s.id);
          const { data: rawProgress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('status', 'completed')
            .in('user_id', studentIds);
            
          if (rawProgress) {
            totalCompletionsCount = rawProgress.length;
            
            // Map raw progress into readable history logs
            historyFeed = rawProgress.map(p => {
               const student = myStudents.find(s => s.id === p.user_id);
               const exp = allExperiments?.find(e => e.id === p.experiment_id);
               return {
                   id: p.id || `${p.user_id}-${p.experiment_id}`,
                   studentName: student?.display_name || 'Unknown Student',
                   section: student?.section || 'Unknown',
                   expTitle: exp?.title || 'Unknown Experiment',
                   grade: p.grade,
                   errors: p.errors
               };
            });
            // Reverse to show newest first and limit to the last 5 completions
            historyFeed = historyFeed.reverse().slice(0, 4);
          }
        }

        setStats({
          totalStudents: myStudents?.length || 0,
          assignedExperiments: assignedExperimentsCount,
          totalCompletions: totalCompletionsCount,
          history: historyFeed
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

  // Expanded color mappings to ensure Tailwind compiles the border-colors
  const colorBorders = { blue: 'hover:border-blue-400', purple: 'hover:border-purple-400', emerald: 'hover:border-emerald-400' };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-default ${colorBorders[color]}`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-black text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}><Icon size={24} /></div>
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
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Activity className="mr-2 text-purple-500" size={20} /> Recent Completions History
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white">
            {stats.history && stats.history.length > 0 ? (
              <div className="divide-y divide-slate-100">
                 {stats.history.map((log, i) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 shrink-0">
                             <CheckCircle size={20} />
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{log.studentName} <span className="text-slate-400 font-normal ml-1">({log.section})</span></p>
                             <p className="text-xs text-slate-500 mt-0.5">Finished <strong>{log.expTitle}</strong></p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-base font-black text-emerald-600 leading-tight">{log.grade}%</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.errors} Mistakes</p>
                       </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100"><Award className="text-slate-300" size={32} /></div>
                <h3 className="font-bold text-slate-700 text-lg">No recent activity</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">Student submissions and experiment completions will appear here once they start working on published modules.</p>
              </div>
            )}
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