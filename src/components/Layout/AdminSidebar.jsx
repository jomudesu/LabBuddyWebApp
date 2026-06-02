import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Users, 
  Database, 
  LogOut, 
  ShieldCheck, 
  Printer,
  Settings
} from 'lucide-react';
import { useAuth } from '../../backend/Firebase/AuthContext';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'Manage Accounts', path: '/admin/accounts' },
    { icon: FlaskConical, label: 'Manage Experiments', path: '/admin/experiments' },
    { icon: Database, label: 'Global Inventory', path: '/admin/inventory' },
    { icon: Printer, label: 'Reports & Printing', path: '/admin/reports' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
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
    <aside className="w-64 bg-slate-950 shadow-2xl flex flex-col border-r border-slate-800 z-50 relative shrink-0">
      {/* ─── Logo Section ─── */}
      <div className="p-7 border-b border-slate-800/50">
        <h1 className="text-xl font-black text-slate-100 flex items-center tracking-tight cursor-default">
          <div className="bg-blue-600/20 p-2 rounded-xl mr-3 border border-blue-500/30">
            <ShieldCheck className="text-blue-400" size={24} />
          </div>
          LAB ADMIN
        </h1>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-4 mt-6 overflow-y-auto scrollbar-hide">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3.5 mb-2 rounded-xl transition-all duration-300 group relative overflow-hidden font-medium
              before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-500 before:rounded-r-md before:transition-transform before:duration-300
              ${isActive 
                ? 'bg-blue-500/10 text-blue-400 shadow-inner border border-blue-500/20 font-bold before:scale-y-100' 
                : 'text-slate-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 hover:text-slate-200 before:scale-y-0 group-hover:before:scale-y-100'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110 group-hover:-rotate-3'}`} 
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
      <div className="p-5 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center mb-4 group cursor-default">
          <div className="w-11 h-11 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 font-bold shadow-md">
            {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-slate-200 truncate">
              {currentUser?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-xs text-blue-400 font-medium mt-0.5">System Admin</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-rose-500 bg-slate-900/50 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-300 border border-slate-800 hover:border-rose-500/30"
        >
          <LogOut size={18} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;