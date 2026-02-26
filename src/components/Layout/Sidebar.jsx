import React from 'react';
import { LayoutDashboard, FlaskConical, Library, Beaker, Atom } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true, href: '#' },
    { icon: FlaskConical, label: 'Experiments', active: false, href: '#' },
    { icon: Library, label: 'Library', active: false, href: '#' },
  ];

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
          <a
            key={index}
            href={item.href}
            className={`
              flex items-center px-4 py-3 mb-2 rounded-lg transition-colors
              ${item.active 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <item.icon size={20} />
            <span className="ml-3 font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            LB
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Lebron James</p>
            <p className="text-xs text-gray-500">THE GOAT</p>
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center text-purple-700 mb-2">
            <Atom size={16} className="mr-2" />
            <span className="text-sm font-medium">Quick Tools</span>
          </div>
          <button className="text-xs text-purple-600 hover:text-purple-700">
            Periodic Table →
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;