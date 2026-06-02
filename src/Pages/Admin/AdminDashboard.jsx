import React, { useState, useEffect, useMemo } from 'react';
import { Users, FlaskConical, CheckCircle, Activity, PieChart as PieChartIcon, UserCheck } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase'; // Adjust path if needed

const AdminDashboard = () => {
  // ─── REAL-TIME STATS STATE ───
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeToday, setActiveToday] = useState(0);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [completedSims, setCompletedSims] = useState(0);
  
  // ─── CHART DATA STATE ───
  const [distributionData, setDistributionData] = useState([
    { name: 'Students', value: 0 },
    { name: 'Instructors', value: 0 },
    { name: 'Admins', value: 0 },
  ]);
  
  const [loginCounts, setLoginCounts] = useState({});
  const [sessionCounts, setSessionCounts] = useState({});

  // ─── FIREBASE REAL-TIME LISTENERS ───
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      let students = 0;
      let instructors = 0;
      let admins = 0;
      let activeCount = 0;
      const loginsByDate = {};
      
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.role === 'student') students++;
        else if (data.role === 'instructor') instructors++;
        else if (data.role === 'admin') admins++;

        if (data.lastLogin) {
          const loginDate = data.lastLogin.toDate();
          if (loginDate >= startOfToday) activeCount++; 
          
          const dateString = loginDate.toDateString();
          loginsByDate[dateString] = (loginsByDate[dateString] || 0) + 1;
        }
      });

      setTotalUsers(snapshot.size);
      setActiveToday(activeCount);
      setDistributionData([
        { name: 'Students', value: students },
        { name: 'Instructors', value: instructors },
        { name: 'Admins', value: admins },
      ]);
      setLoginCounts(loginsByDate);
    });

    const unsubscribeExps = onSnapshot(collection(db, 'experiment'), (snapshot) => {
      setTotalExperiments(snapshot.size);
    });

    const unsubscribeProgress = onSnapshot(collection(db, 'userProgress'), (snapshot) => {
      let completed = 0;
      const sessionsByDate = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'completed') completed++;

        if (data.lastAccessed) {
          const accessDate = data.lastAccessed.toDate();
          const dateString = accessDate.toDateString();
          sessionsByDate[dateString] = (sessionsByDate[dateString] || 0) + 1;
        }
      });

      setCompletedSims(completed);
      setSessionCounts(sessionsByDate);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeExps();
      unsubscribeProgress();
    };
  }, []);

  // ─── DYNAMIC 7-DAY TRAFFIC GENERATOR ───
  const trafficData = useMemo(() => {
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toDateString();
      
      result.push({
        name: daysMap[d.getDay()],
        logins: loginCounts[dateString] || 0,
        sessions: sessionCounts[dateString] || 0
      });
    }
    return result;
  }, [loginCounts, sessionCounts]);

  // ─── DYNAMIC STATS ARRAY ───
  const stats = [
    { label: 'Total Accounts', value: totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Active Today', value: activeToday, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Deployed Experiments', value: totalExperiments, icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Completed Simulations', value: completedSims, icon: CheckCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

  const customTooltipStyle = {
    backgroundColor: '#0f172a', 
    borderColor: '#334155',     
    color: '#f8fafc',           
    borderRadius: '0.5rem',
    padding: '8px',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
  };

  // ─── CUSTOM PIE CHART LABEL ───
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    // Hide the label if the segment is extremely tiny (e.g., 0%)
    if (percent < 0.03) return null; 
    
    // Calculate position right in the middle of the donut ring
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-[11px] font-bold drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Command Center</h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">Real-time system overview and platform analytics.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/50 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.border} border`}>
                <stat.icon className={stat.color} size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-100 leading-none mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1">
        
        {/* Main Traffic Area Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg p-5 md:p-6 flex flex-col min-h-[300px] lg:h-[350px]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center uppercase tracking-wider">
              <Activity className="mr-2 text-blue-400" size={18} />
              Platform Traffic (Last 7 Days)
            </h2>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="sessions" name="Exp. Sessions" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSessions)" />
                <Area type="monotone" dataKey="logins" name="User Logins" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLogins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Distribution Donut Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg p-5 md:p-6 flex flex-col min-h-[300px] lg:h-[350px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center uppercase tracking-wider">
              <PieChartIcon className="mr-2 text-purple-400" size={18} />
              Demographics
            </h2>
          </div>
          
          <div className="flex-1 w-full relative flex items-center justify-center min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#e2e8f0' }} />
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65} 
                  outerRadius={95} 
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  labelLine={false} // Prevents Recharts from drawing a line outside the donut
                  label={renderCustomizedLabel} // ✨ Added our custom label function here!
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-3xl font-black text-slate-100">{totalUsers}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="flex justify-center gap-4 mt-2">
            {distributionData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs font-medium text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;