import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  BarChart3, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../backend/Firebase/AuthContext';

const InstructorLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/instructor/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/instructor/students', icon: Users, label: 'My Students' },
    { path: '/instructor/experiments', icon: FlaskConical, label: 'Experiment Tracking' },
    { path: '/instructor/analytics', icon: BarChart3, label: 'Grades & Analytics' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* ─── INSTRUCTOR SIDEBAR ─── */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0 z-10">
        
        {/* Branding */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-purple-100 p-2.5 rounded-xl border border-purple-200">
            <ShieldCheck className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight leading-tight">Lab Buddy</h1>
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Faculty Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm border
                  ${isActive 
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' 
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                <link.icon size={18} className={isActive ? 'text-purple-600' : 'text-slate-400'} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              {(currentUser?.displayName || 'I').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{currentUser?.displayName || 'Instructor'}</p>
              <p className="text-xs font-medium text-slate-500 truncate capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 overflow-auto flex flex-col bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
};

export default InstructorLayout;