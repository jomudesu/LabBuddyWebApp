import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const navLinks = [
    { path: '/instructor/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/instructor/students', icon: Users, label: 'My Students' },
    { path: '/instructor/experiments', icon: FlaskConical, label: 'Experiment Tracking' },
    { path: '/instructor/analytics', icon: BarChart3, label: 'Grades & Analytics' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const safeDisplayName = currentUser?.displayName || '';
  const safeEmail = currentUser?.email || '';
  
  const avatarLetter = (safeDisplayName || safeEmail || 'I').charAt(0).toUpperCase();
  const displayLabel = safeDisplayName || (safeEmail ? safeEmail.split('@')[0] : 'Instructor');

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* ─── INSTRUCTOR SIDEBAR ─── */}
      <aside className="w-64 bg-slate-50/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col border-r border-slate-100 z-50 relative shrink-0">
        
        {/* ─── Branding ─── */}
        <div className="p-7">
          <div className="flex items-center cursor-default group mb-1">
            <div className="bg-purple-50 p-2 rounded-xl mr-3 transition-all duration-300 group-hover:bg-purple-100 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-sm">
              <ShieldCheck className="text-purple-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-purple-900 tracking-tight leading-none">LAB BUDDY</h1>
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">Faculty Portal</p>
            </div>
          </div>
        </div>

        {/* ─── Navigation ─── */}
        <nav className="flex-1 px-4 mt-2">
          {navLinks.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3.5 mb-2 rounded-xl transition-all duration-300 group relative overflow-hidden font-medium
                before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-purple-600 before:rounded-r-md before:transition-transform before:duration-300
                ${isActive 
                  ? 'bg-purple-50/80 text-purple-700 shadow-sm border border-purple-100 font-bold before:scale-y-100' 
                  : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 hover:text-purple-600 hover:shadow-sm before:scale-y-0 group-hover:before:scale-y-100'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`transition-transform duration-300 ${isActive ? 'scale-110 text-purple-600' : 'group-hover:scale-110 group-hover:-rotate-3'}`} 
                  />
                  <span className={`ml-3 transition-transform duration-300 ${isActive ? '' : 'group-hover:translate-x-1'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ─── User Profile & Logout ─── */}
        <div className="p-5 border-t border-slate-100 bg-white">
          
          {/* Profile Card */}
          <div className="flex items-center mb-4 group cursor-default">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:scale-105 shrink-0">
              {avatarLetter}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate transition-colors duration-300 group-hover:text-purple-700">
                {displayLabel}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">
                {currentUser?.role || 'Instructor'}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-300 border border-transparent hover:border-red-100 hover:shadow-sm"
          >
            <LogOut size={18} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 overflow-auto flex flex-col bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
};

export default InstructorLayout;