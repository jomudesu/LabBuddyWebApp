import React from 'react';
import { PlayCircle, HelpCircle, Atom, ChevronRight, Calendar } from 'lucide-react';

const QuickLinks = () => {
  const links = [
    { icon: PlayCircle, title: 'Begin Experiment!', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: HelpCircle, title: 'How to', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Atom, title: 'Periodic Table', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
      
      <div className="space-y-3">
        {links.map((link, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-200 transition group"
          >
            <div className="flex items-center">
              <div className={`${link.bg} p-2 rounded-lg`}>
                <link.icon size={20} className={link.color} />
              </div>
              <span className="ml-3 text-gray-700 group-hover:text-gray-900 font-medium">
                {link.title}
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600" />
          </button>
        ))}
      </div>

      {/* Today's Suggestion */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center mb-3">
          <Calendar size={16} className="text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-600">Today's Suggestion</span>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <p className="text-sm text-gray-700 font-medium">Acid-Base Titration</p>
          <p className="text-xs text-gray-500 mt-1">Learn about pH indicators and neutralization</p>
          <button className="mt-3 text-blue-600 text-sm font-semibold flex items-center hover:text-blue-700">
            Start now
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Today's Progress</span>
          <span className="text-xs font-semibold text-blue-600">60%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-3/5 bg-blue-600 rounded-full"></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">3/5 experiments completed</p>
      </div>
    </div>
  );
};

export default QuickLinks;