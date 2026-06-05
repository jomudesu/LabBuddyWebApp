import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeExperiments: 0,
    totalCompletions: 0 // ✨ Renamed from completionsToday
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        const instructorSections = currentUser.handledSections || [];

        // 1. Fetch published experiments
        const expSnap = await getDocs(collection(db, 'experiment'));
        const activeExperimentsCount = expSnap.docs.filter(doc => {
          const status = doc.data().status || '';
          return status.toLowerCase() === 'published';
        }).length;

        let myStudentCount = 0;
        let totalCompletionsCount = 0; 

        if (instructorSections.length > 0) {
          // 2. Fetch Instructor's Students
          const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'), where('status', '==', 'active'));
          const studentsSnap = await getDocs(studentsQuery);
          
          const myStudents = studentsSnap.docs.filter(doc => {
            return instructorSections.includes(doc.data().section);
          });
          myStudentCount = myStudents.length;

          const myStudentIds = myStudents.map(student => student.id);

          // 3. Fetch ALL Completions
          if (myStudentIds.length > 0) {
            // ✨ Removed the startOfToday timestamp filter completely!
            const progressQuery = query(
              collection(db, 'userProgress'),
              where('status', '==', 'completed')
            );
            const progressSnap = await getDocs(progressQuery);
            
            // Filter to ensure the completion belongs to a student this instructor manages
            const validCompletions = progressSnap.docs.filter(doc => {
              return myStudentIds.includes(doc.data().userId);
            });
            
            totalCompletionsCount = validCompletions.length;
          }
        }

        setStats({
          totalStudents: myStudentCount,
          activeExperiments: activeExperimentsCount,
          totalCompletions: totalCompletionsCount // ✨ Map to the new state variable
        });
      } catch (error) {
        console.error("Error fetching instructor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-black text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 relative z-10 bg-emerald-50 w-fit px-2 py-1 rounded">
          <TrendingUp size={14} className="mr-1" /> {trend}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      
      {/* ─── HEADER ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Welcome back, Prof. {currentUser?.displayName?.split(' ')[0] || ''} 👋
        </h1>
        <p className="text-slate-500 font-medium mt-1">Here is what is happening in your virtual laboratory today.</p>
      </div>

      {/* ─── STATS GRID ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="My Students" value={stats.totalStudents} icon={Users} color="blue" />
          <StatCard title="Active Modules" value={stats.activeExperiments} icon={FlaskConical} color="purple" />
          
          {/* ✨ Updated Title */}
          <StatCard title="Total Completions" value={stats.totalCompletions} icon={CheckCircle} color="emerald" />
        </div>
      )}

      {/* ─── MAIN DASHBOARD CONTENT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Clock className="mr-2 text-purple-500" size={20} /> Recent Student Activity
            </h2>
          </div>
          <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Award className="text-slate-400" size={32} />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">No recent activity</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              Student submissions and experiment completions will appear here once they start working on published modules.
            </p>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Quick Actions</h2>
          
          <button className="p-5 bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md rounded-2xl text-left transition-all group">
            <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
              Manage Sections <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">View and organize your assigned student list.</p>
          </button>

          <button className="p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl text-left transition-all group">
            <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <FlaskConical size={20} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
              Review Experiments <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">Check available lab modules for your classes.</p>
          </button>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboard;