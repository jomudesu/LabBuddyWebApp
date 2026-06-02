import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Shield, 
  Activity,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';
import Modal from '../Common/Modal';
import { useExperiments } from '../../backend/Firebase/useExperiments';
import { useProgress } from '../../backend/Firebase/useProgress';

const ActivityCards = () => {
  const navigate = useNavigate();
  
  const { experiments } = useExperiments();
  const { getStatus } = useProgress();

  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const [activeModal, setActiveModal] = useState(null);

  // Grab the 4 most recent activities from user progress
  const userActivities = experiments
    .filter(exp => {
      const status = getStatus(exp.id);
      return status === 'completed' || status === 'in_progress';
    })
    .map(exp => {
      const status = getStatus(exp.id);
      return {
        id: exp.id,
        action: status === 'completed' ? `Completed ${exp.title}` : `Started ${exp.title}`,
        subtitle: exp.category,
        status: status === 'completed' ? 'completed' : 'in-progress',
        icon: status === 'completed' ? CheckCircle : Clock
      };
    })
    .slice(0, 4);

  // Modals for the remaining popup cards
  const modals = {
    safetyGuide: {
      title: 'Safety Guide',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2 animate-pulse" size={20} />
              <p className="font-bold text-red-700">Always prioritize safety!</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { rule: 'Wear appropriate PPE (goggles, gloves, lab coat)', icon: '🥽' },
              { rule: 'Know the location of safety equipment', icon: '🚨' },
              { rule: 'Never eat or drink in the lab', icon: '🚫' },
              { rule: 'Report all accidents immediately', icon: '📢' },
              { rule: 'Read instructions before starting', icon: '📖' },
              { rule: 'Dispose of chemicals properly', icon: '🗑️' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center p-3.5 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-300">
                <span className="text-2xl mr-4">{item.icon}</span>
                <p className="text-gray-700 font-medium">{item.rule}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-2">
            Download Full Safety Manual (WIP)
          </button>
        </div>
      )
    },
    
    recentActivity: {
      title: 'Recent Activity',
      content: (
        <div className="space-y-4">
          
          {userActivities.length > 0 ? (
            <div className="space-y-3">
              {userActivities.map((activity, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/experiments', { state: { highlightExpId: activity.id } });
                  }}
                  className="flex items-center p-3 border border-transparent hover:border-gray-200 hover:shadow-sm hover:bg-gray-50 rounded-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl mr-4 transition-transform duration-300 group-hover:scale-110 ${
                    activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <activity.icon size={18} className={
                      activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{activity.subtitle}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Activity size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No recent activity yet.</p>
              <p className="text-xs text-gray-400 mt-1">Start an experiment to see it here!</p>
            </div>
          )}

          <button 
            onClick={() => {
              setActiveModal(null);
              navigate('/experiments');
            }}
            className="w-full border-2 border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-300 mt-2"
          >
            {userActivities.length > 0 ? 'View All Experiments' : 'Browse Experiments'}
          </button>
        </div>
      )
    }
  };

  // The focused, 3-card layout
  const activities = [
    { 
      icon: Wrench, 
      title: 'Lab Inventory', 
      description: 'Chemicals, metals & equipment', 
      color: 'bg-green-100', 
      iconColor: 'text-green-600', 
      hoverBorder: 'hover:border-green-300', 
      glow: 'from-green-50/50', 
      route: '/inventory'
    },
    { 
      icon: Shield, 
      title: 'Safety Guide', 
      description: 'Lab safety rules', 
      color: 'bg-orange-100', 
      iconColor: 'text-orange-600', 
      hoverBorder: 'hover:border-orange-300', 
      glow: 'from-orange-50/50', 
      modalKey: 'safetyGuide' 
    },
    { 
      icon: Activity, 
      title: 'Recent Activity', 
      description: 'Your history', 
      color: 'bg-pink-100', 
      iconColor: 'text-pink-600', 
      hoverBorder: 'hover:border-pink-300', 
      glow: 'from-pink-50/50', 
      modalKey: 'recentActivity' 
    },
  ];

  if (pageLoading) {
    return (
      <div>
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-[160px]">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="mr-2 text-blue-600" size={24} />
          Activities
        </h3>
        {/* Exactly 3 cards will fill this grid perfectly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {activities.map((item, index) => (
            <div
              key={index}
              onClick={() => item.route ? navigate(item.route) : setActiveModal(item.modalKey)}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:-translate-y-1.5 ${item.hoverBorder}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <div className={`${item.color} p-3.5 rounded-xl w-fit mb-4 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md`}>
                <item.icon className={item.iconColor} size={24} />
              </div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-900 transition-colors">{item.title}</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">{item.description}</p>
              </div>
              
              <div className="mt-5 flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors relative z-10">
                {item.route ? 'Open Directory' : 'Click to view'}
                <ChevronRight size={16} className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModal && modals[activeModal] && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title={modals[activeModal].title} size="lg">
          {modals[activeModal].content}
        </Modal>
      )}
    </>
  );
};

export default ActivityCards;