import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Library, Beaker, LogOut } from 'lucide-react';
import { useAuth } from '../../backend/Firebase/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FlaskConical, label: 'Experiments', path: '/experiments' },
    { icon: Library, label: 'Library', path: '/library' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col border-r border-gray-100 z-50 relative">
      {/* ─── Logo Section ─── */}
      <div className="p-7">
        <h1 className="text-2xl font-black text-blue-900 flex items-center tracking-tight cursor-default group">
          <div className="bg-blue-50 p-2 rounded-xl mr-3 transition-all duration-300 group-hover:bg-blue-100 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-sm">
            <Beaker className="text-blue-600" size={24} />
          </div>
          LAB BUDDY
        </h1>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-4 mt-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3.5 mb-2 rounded-xl transition-all duration-300 group relative overflow-hidden font-medium
              before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-600 before:rounded-r-md before:transition-transform before:duration-300
              ${isActive 
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-bold before:scale-y-100' 
                : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:text-blue-600 hover:shadow-sm before:scale-y-0 group-hover:before:scale-y-100'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-600' : 'group-hover:scale-110 group-hover:-rotate-3'}`} 
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
      <div className="p-5 border-t border-gray-100 bg-gray-50/50">
        
        {/* Profile Card */}
        <div className="flex items-center mb-4 group cursor-default">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:scale-105">
            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate transition-colors duration-300 group-hover:text-blue-700">
              {currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Student</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-300 border border-transparent hover:border-red-100 hover:shadow-sm"
        >
          {/* Icon slides left slightly to emphasize "exiting" */}
          <LogOut size={18} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;