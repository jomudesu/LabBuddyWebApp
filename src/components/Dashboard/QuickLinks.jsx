import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  HelpCircle, 
  Atom, 
  ChevronRight, 
  Beaker,
  AlertCircle,
} from 'lucide-react';
import Modal from '../Common/Modal';
import { useExperiments } from '../../backend/Firebase/useExperiments';

const QuickLinks = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [randomExperiments, setRandomExperiments] = useState([]);
  const { experiments, loading } = useExperiments();

  // When modal opens, pick 3 random experiments
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

  // Helper to get color class based on difficulty
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'blue';
      case 'Advanced': return 'purple';
      default: return 'gray';
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
                const color = getDifficultyColor(exp.difficulty);
                return (
                  <div 
                    key={exp.id}
                    onClick={() => {
                      setActiveModal(null);
                      navigate('/experiments');
                    }}
                    className="flex items-start p-3 border rounded-xl hover:shadow-md transition cursor-pointer group"
                  >
                    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                      <Beaker size={20} className={`text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-semibold text-gray-800 group-hover:text-blue-600">{exp.title}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>{exp.difficulty}</span>
                          <span>•</span>
                          <span>{exp.duration} min</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-2 flex-shrink-0" />
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-2"
          >
            View All Experiments
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
              { step: '2', title: 'Browse Experiments', desc: 'Explore our library of virtual chemistry experiments', icon: '🔬' },
              { step: '3', title: 'Start Experiment', desc: 'Click on any experiment to begin the interactive session', icon: '⚡' },
              { step: '4', title: 'Take Notes', desc: 'Record observations and save them for later review', icon: '📓' },
              { step: '5', title: 'Track Progress', desc: 'Monitor your completion rate and revisit experiments', icon: '📊' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">{item.step}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <span className="ml-auto text-2xl">{item.icon}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-blue-600" />
              <p className="font-semibold text-blue-800 text-sm">Pro Tip</p>
            </div>
            <p className="text-blue-700 text-sm">Always read the safety guide before starting any experiment!</p>
          </div>
        </div>
      )
    },
    
    periodicTable: {
      title: 'Interactive Periodic Table',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Click on any element to view its properties:</p>
          <div className="grid grid-cols-8 gap-1 text-xs">
            {[
              'H', 'He',
              'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
              'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
              'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'
            ].map((element, idx) => (
              <button
                key={idx}
                onClick={() => alert(`${element}\n\nAtomic properties coming soon!`)}
                className="p-2 bg-gray-100 rounded hover:bg-blue-100 hover:text-blue-700 transition text-center font-mono"
              >
                {element}
              </button>
            ))}
          </div>
          <div className="bg-purple-50 rounded-xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Atom size={16} className="text-purple-600" />
              <p className="font-semibold text-purple-800 text-sm">Element Groups</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"></div><span>Alkali Metals</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded"></div><span>Alkaline Earth</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded"></div><span>Transition Metals</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div><span>Noble Gases</span></div>
            </div>
          </div>
          <button 
            onClick={() => {
              setActiveModal(null);
              alert('Full interactive periodic table coming soon!');
            }}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Open Full Periodic Table
          </button>
        </div>
      )
    }
  };

  const links = [
    { icon: PlayCircle, title: 'Begin Experiment!', color: 'text-green-600', bg: 'bg-green-50', modalKey: 'beginExperiment' },
    { icon: HelpCircle, title: 'How to', color: 'text-blue-600', bg: 'bg-blue-50', modalKey: 'howTo' },
    { icon: Atom, title: 'Periodic Table', color: 'text-purple-600', bg: 'bg-purple-50', modalKey: 'periodicTable' },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div className="space-y-3">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => setActiveModal(link.modalKey)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition group"
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
      </div>

      {activeModal && modals[activeModal] && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={modals[activeModal].title}
          size="lg"
        >
          {modals[activeModal].content}
        </Modal>
      )}
    </>
  );
};

export default QuickLinks;