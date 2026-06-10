import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  HelpCircle, 
  Atom, 
  ChevronRight, 
  Beaker,
  AlertCircle,
  Link,
  Info
} from 'lucide-react';
import Modal from '../Common/Modal';
import { useExperiments } from '../../backend/Firebase/useExperiments';

const QuickLinks = () => {
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const [activeModal, setActiveModal] = useState(null);
  const [randomExperiments, setRandomExperiments] = useState([]);
  const { experiments, loading } = useExperiments();
  
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (activeModal === 'beginExperiment' && experiments.length > 0 && !loading) {
      const shuffled = [...experiments];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setRandomExperiments(shuffled.slice(0, 3));
    }
  }, [activeModal, experiments, loading]);

  const getDifficultyStyles = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': 
        return { iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'intermediate': 
        return { iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'advanced': 
        return { iconBg: 'bg-rose-100', iconColor: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
      default: 
        return { iconBg: 'bg-gray-100', iconColor: 'text-gray-600', badge: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const modals = {
    beginExperiment: {
      title: 'Try These Experiments',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Here are 3 experiments we recommend for you today:</p>
          {loading ? (
            <div className="text-center py-4">Loading Experiments...</div>
          ) : randomExperiments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No experiments available.</div>
          ) : (
            <div className="space-y-3">
              {randomExperiments.map((exp) => {
                const styles = getDifficultyStyles(exp.difficulty);
                return (
                  <div 
                    key={exp.id}
                    onClick={() => {
                      setActiveModal(null);
                      navigate('/experiments', { state: { highlightExpId: exp.id } });
                    }}
                    className="flex items-start p-3 border border-transparent rounded-xl hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 cursor-pointer group bg-white"
                  >
                    <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-sm`}>
                      <Beaker size={20} className={`${styles.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{exp.title}</p>
                        <div className="flex gap-2 text-[10px] sm:text-xs text-gray-500">
                          <span className={`px-2.5 py-0.5 rounded-md border font-bold ${styles.badge}`}>
                            {exp.difficulty?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{exp.description}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 ml-2 flex-shrink-0 group-hover:text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                );
              })}
            </div>
          )}
          <button 
            onClick={() => {
              setActiveModal(null);
              navigate('/experiments');
            }}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-2 font-bold flex items-center justify-center gap-2 group"
          >
            View All Experiments
            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      )
    },
    
    howTo: {
      title: 'How to Use Lab Buddy',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { step: '1', title: 'Create an Account', desc: 'Sign up with your email to start your lab journey', icon: '📝' },
              { step: '2', title: 'Browse Experiments', desc: 'Explore our library of virtual chemistry experiments', icon: '🔍' },
              { step: '3', title: 'Start Experiment', desc: 'Click on any experiment to begin the interactive session', icon: '🧪' },
              { step: '4', title: 'Take Notes', desc: 'Record observations and save them for later review', icon: '📓' },
              { step: '5', title: 'Track Progress', desc: 'Monitor your completion rate and revisit experiments', icon: '📈' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-blue-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md group-hover:border-blue-100">
                  <span className="text-blue-600 font-black text-sm">{item.step}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{item.title}</p>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <span className="ml-2 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{item.icon}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mt-2 border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-blue-600 animate-pulse" />
              <p className="font-bold text-blue-800 text-sm">Pro Tip</p>
            </div>
            <p className="text-blue-700 text-sm font-medium">Always read the safety guide before starting any experiment!</p>
          </div>
        </div>
      )
    },
    
    periodicTable: {
      title: 'Interactive Periodic Table',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 font-medium text-sm">Click on any element to view its properties:</p>
          <div className="grid grid-cols-8 gap-2 text-xs">
            {[
              'H', 'He',
              'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
              'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
              'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr'
            ].map((element, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveModal(null);
                  navigate('/periodic-table', { state: { selectedElement: element } });
                }}
                className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-center font-black font-mono"
              >
                {element}
              </button>
            ))}
          </div>
          <div className="bg-purple-50 rounded-xl p-4 mt-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Atom size={18} className="text-purple-600" />
              <p className="font-bold text-purple-800 text-sm">Element Groups</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-purple-900/80">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded shadow-sm"></div><span>Alkali Metals</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-400 rounded shadow-sm"></div><span>Alkaline Earth</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-400 rounded shadow-sm"></div><span>Transition Metals</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-400 rounded shadow-sm"></div><span>Noble Gases</span></div>
            </div>
          </div>
          <button 
            onClick={() => {
              setActiveModal(null);
              navigate('/periodic-table');
            }}
            className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-4 flex items-center justify-center gap-2 group"
          >
            <Atom size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
            Open Full Periodic Table
          </button>
        </div>
      )
    }
  };

  const links = [
    { icon: PlayCircle, title: 'Begin Experiment!', color: 'text-green-600', bg: 'bg-green-100', modalKey: 'beginExperiment' },
    { icon: HelpCircle, title: 'How to', color: 'text-blue-600', bg: 'bg-blue-100', modalKey: 'howTo' },
    { icon: Atom, title: 'Periodic Table', color: 'text-purple-600', bg: 'bg-purple-100', modalKey: 'periodicTable' },
  ];

  if (pageLoading) {
    return (
      <div>
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full flex items-center justify-between p-4 rounded-xl border border-transparent">
                <div className="flex items-center w-full">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="ml-4 h-5 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Link className="mr-2 text-green-600" size={24} />
          Quick Links
        </h3>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="space-y-3">
            {links.map((link, index) => (
              <button
                key={index}
                onClick={() => setActiveModal(link.modalKey)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 group border border-transparent hover:border-gray-200 hover:shadow-md hover:-translate-y-1 bg-gray-50/50 hover:bg-white relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex items-center relative z-10">
                  <div className={`${link.bg} p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-sm`}>
                    <link.icon size={20} className={link.color} />
                  </div>
                  <span className="ml-4 text-gray-700 font-bold group-hover:text-blue-700 transition-colors">
                    {link.title}
                  </span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeModal && modals[activeModal] && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title={modals[activeModal].title} size="lg">
          {modals[activeModal].content}
        </Modal>
      )}

      {/* ─── CUSTOM INFO MODAL ─── */}
      {infoMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed whitespace-pre-wrap">
                {infoMessage}
              </p>
              <button 
                onClick={() => setInfoMessage('')}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default QuickLinks;