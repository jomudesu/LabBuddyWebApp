import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Wrench, 
  Shield, 
  FlaskRound as Flask, 
  Activity,
  ChevronRight,
  Upload,
  Settings,
  AlertTriangle,
  Beaker,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';
import Modal from '../Common/Modal';

const ActivityCards = () => {
  const navigate = useNavigate();
  
  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('uploading');
      setTimeout(() => {
        setUploadStatus('success');
        setTimeout(() => {
          setActiveModal(null);
          setSelectedFile(null);
          setUploadStatus(null);
        }, 1500);
      }, 2000);
    }
  };

  const modals = {
    attachFile: {
      title: 'Upload Lab File',
      content: (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 group">
            {!selectedFile ? (
              <>
                <Upload size={48} className="mx-auto text-purple-400 mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300" />
                <p className="text-gray-600 mb-2 font-medium">Drag & drop your file here</p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <label className="bg-purple-600 text-white px-5 py-2.5 rounded-lg cursor-pointer hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 inline-block font-semibold">
                  Browse Files
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.jpg,.png" onChange={handleFileUpload} />
                </label>
                <p className="text-xs text-gray-400 mt-4">Supports: PDF, DOC, TXT, JPG, PNG (Max 10MB)</p>
              </>
            ) : uploadStatus === 'uploading' ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 font-medium">Uploading {selectedFile.name}...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-3 animate-fade-in-up">
                <CheckCircle size={48} className="mx-auto text-green-500 animate-bounce" />
                <p className="text-green-600 font-bold text-lg">Upload Successful!</p>
                <p className="text-gray-500 font-medium">{selectedFile.name}</p>
              </div>
            ) : null}
          </div>
        </div>
      )
    },
    
    tools: {
      title: 'Lab Tools',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Periodic Table', icon: Beaker, color: 'purple', action: () => navigate('/library') },
              { name: 'Calculator', icon: Settings, color: 'blue', action: () => alert('Scientific calculator coming soon!') },
              { name: 'Unit Converter', icon: Activity, color: 'green', action: () => alert('Unit converter coming soon!') },
              { name: 'Lab Timer', icon: Clock, color: 'orange', action: () => alert('Lab timer coming soon!') }
            ].map((tool, idx) => (
              <button
                key={idx}
                onClick={tool.action}
                className={`p-5 bg-${tool.color}-50 rounded-xl hover:bg-${tool.color}-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group border border-transparent hover:border-${tool.color}-200`}
              >
                <tool.icon className={`mx-auto mb-3 text-${tool.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`} size={32} />
                <p className={`text-sm font-bold text-${tool.color}-800`}>{tool.name}</p>
              </button>
            ))}
          </div>
        </div>
      )
    },
    
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
    
    experiments: {
      title: 'Browse Experiments',
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              { name: 'Acid-Base Titration', difficulty: 'Intermediate', duration: '30 min', color: 'blue' },
              { name: 'Paper Chromatography', difficulty: 'Beginner', duration: '20 min', color: 'emerald' },
              { name: 'Electrolysis of Water', difficulty: 'Advanced', duration: '45 min', color: 'rose' },
              { name: 'pH Scale Measurement', difficulty: 'Beginner', duration: '15 min', color: 'amber' }
            ].map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-xl hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-${exp.color}-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Beaker size={20} className={`text-${exp.color}-600`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{exp.name}</p>
                    <div className="flex gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-semibold">{exp.difficulty}</span>
                      <span>•</span>
                      <span>{exp.duration}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/experiments')}
                  className="text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 p-2 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/experiments')}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-2"
          >
            View All Experiments
          </button>
        </div>
      )
    },
    
    recentActivity: {
      title: 'Recent Activity',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { action: 'Completed Acid-Base Titration', time: '2 hours ago', status: 'completed', icon: CheckCircle },
              { action: 'Started Periodic Table Quiz', time: 'Yesterday', status: 'in-progress', icon: Clock },
              { action: 'Viewed Safety Guide', time: '2 days ago', status: 'viewed', icon: Eye },
              { action: 'Uploaded Lab Report', time: '3 days ago', status: 'completed', icon: Upload }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center p-3 border border-transparent hover:border-gray-100 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                <div className={`p-2.5 rounded-xl mr-4 transition-transform duration-300 group-hover:scale-110 ${
                  activity.status === 'completed' ? 'bg-green-100' :
                  activity.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <activity.icon size={18} className={
                    activity.status === 'completed' ? 'text-green-600' :
                    activity.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-600'
                  } />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{activity.time}</p>
                </div>
                {activity.status === 'completed' && <CheckCircle size={18} className="text-green-500 ml-2" />}
              </div>
            ))}
          </div>
          <button className="w-full border-2 border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 mt-2">
            View Full History
          </button>
        </div>
      )
    }
  };

  // ADDED: hoverBorder and glow colors to power the new interactive effects!
  const activities = [
    { icon: FileText, title: 'Attach File', description: 'Upload lab files', color: 'bg-purple-100', iconColor: 'text-purple-600', hoverBorder: 'hover:border-purple-300', glow: 'from-purple-50/50', modalKey: 'attachFile' },
    { icon: Wrench, title: 'Tools', description: 'Lab equipment', color: 'bg-green-100', iconColor: 'text-green-600', hoverBorder: 'hover:border-green-300', glow: 'from-green-50/50', modalKey: 'tools' },
    { icon: Shield, title: 'Safety Guide', description: 'Lab safety rules', color: 'bg-orange-100', iconColor: 'text-orange-600', hoverBorder: 'hover:border-orange-300', glow: 'from-orange-50/50', modalKey: 'safetyGuide' },
    { icon: Flask, title: 'View Experiments', description: 'Browse experiments', color: 'bg-blue-100', iconColor: 'text-blue-600', hoverBorder: 'hover:border-blue-300', glow: 'from-blue-50/50', modalKey: 'experiments' },
    { icon: Activity, title: 'Recent Activity', description: 'Your history', color: 'bg-pink-100', iconColor: 'text-pink-600', hoverBorder: 'hover:border-pink-300', glow: 'from-pink-50/50', modalKey: 'recentActivity' },
  ];

  const openModal = (modalKey) => setActiveModal(modalKey);
  const closeModal = () => setActiveModal(null);

  if (pageLoading) {
    return (
      <div>
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {activities.map((item, index) => (
            <div
              key={index}
              onClick={() => openModal(item.modalKey)}
              // ✨ Catchy Interactive Hover Applied Here ✨
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
                Click to start 
                <ChevronRight size={16} className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModal && modals[activeModal] && (
        <Modal isOpen={true} onClose={closeModal} title={modals[activeModal].title} size={activeModal === 'tools' ? 'md' : 'lg'}>
          {modals[activeModal].content}
        </Modal>
      )}
    </>
  );
};

export default ActivityCards;