import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Library, Beaker, Atom, LogOut } from 'lucide-react';
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
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-900 flex items-center">
          <Beaker className="mr-2 text-blue-600" size={28} />
          LAB BUDDY
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3 mb-2 rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <item.icon size={20} />
            <span className="ml-3 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;