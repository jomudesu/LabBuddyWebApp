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
  XCircle,
  Download,
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

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('uploading');
      
      // Simulate upload
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

  // Modal configurations
  const modals = {
    attachFile: {
      title: 'Upload Lab File',
      content: (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
            {!selectedFile ? (
              <>
                <Upload size={48} className="mx-auto text-purple-400 mb-3" />
                <p className="text-gray-600 mb-2">Drag & drop your file here</p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <label className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition inline-block">
                  Browse Files
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-4">Supports: PDF, DOC, TXT, JPG, PNG (Max 10MB)</p>
              </>
            ) : uploadStatus === 'uploading' ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">Uploading {selectedFile.name}...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-3">
                <CheckCircle size={48} className="mx-auto text-green-500" />
                <p className="text-green-600 font-semibold">Upload Successful!</p>
                <p className="text-gray-500 text-sm">{selectedFile.name}</p>
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
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Periodic Table', icon: Beaker, color: 'purple', action: () => navigate('/library') },
              { name: 'Calculator', icon: Settings, color: 'blue', action: () => alert('Scientific calculator coming soon!') },
              { name: 'Unit Converter', icon: Download, color: 'green', action: () => alert('Unit converter coming soon!') },
              { name: 'Lab Timer', icon: Clock, color: 'orange', action: () => alert('Lab timer coming soon!') }
            ].map((tool, idx) => (
              <button
                key={idx}
                onClick={tool.action}
                className={`p-4 bg-${tool.color}-50 rounded-xl hover:bg-${tool.color}-100 transition text-center group`}
              >
                <tool.icon className={`mx-auto mb-2 text-${tool.color}-600 group-hover:scale-110 transition`} size={28} />
                <p className={`text-sm font-medium text-${tool.color}-700`}>{tool.name}</p>
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
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2" size={20} />
              <p className="font-semibold text-red-700">Always prioritize safety!</p>
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
              <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl mr-3">{item.icon}</span>
                <p className="text-gray-700 text-sm">{item.rule}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
            Download Full Safety Manual (WORK IN PROGRESS)
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
              { name: 'Paper Chromatography', difficulty: 'Beginner', duration: '20 min', color: 'green' },
              { name: 'Electrolysis of Water', difficulty: 'Advanced', duration: '45 min', color: 'purple' },
              { name: 'pH Scale Measurement', difficulty: 'Beginner', duration: '15 min', color: 'orange' }
            ].map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-xl hover:shadow-md transition cursor-pointer group">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-${exp.color}-100 rounded-lg flex items-center justify-center mr-3`}>
                    <Beaker size={20} className={`text-${exp.color}-600`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-blue-600">{exp.name}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>{exp.difficulty}</span>
                      <span>•</span>
                      <span>{exp.duration}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/experiments')}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                >
                  <Eye size={18} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/experiments')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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
              <div key={idx} className="flex items-center p-3 border-b border-gray-100 last:border-0">
                <div className={`p-2 rounded-lg mr-3 ${
                  activity.status === 'completed' ? 'bg-green-100' :
                  activity.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <activity.icon size={16} className={
                    activity.status === 'completed' ? 'text-green-600' :
                    activity.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-600'
                  } />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                {activity.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
              </div>
            ))}
          </div>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
            View Full History
          </button>
        </div>
      )
    }
  };

  const activities = [
    { 
      icon: FileText, 
      title: 'Attach File', 
      description: 'Upload lab files',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:border-purple-200',
      modalKey: 'attachFile'
    },
    { 
      icon: Wrench, 
      title: 'Tools', 
      description: 'Lab equipment',
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverColor: 'hover:border-green-200',
      modalKey: 'tools'
    },
    { 
      icon: Shield, 
      title: 'Safety Guide', 
      description: 'Lab safety rules',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverColor: 'hover:border-orange-200',
      modalKey: 'safetyGuide'
    },
    { 
      icon: Flask, 
      title: 'View Experiments', 
      description: 'Browse experiments',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:border-blue-200',
      modalKey: 'experiments'
    },
    { 
      icon: Activity, 
      title: 'Recent Activity', 
      description: 'Your history',
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
      hoverColor: 'hover:border-pink-200',
      modalKey: 'recentActivity'
    },
  ];

  const openModal = (modalKey) => {
    setActiveModal(modalKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // --- Skeleton Loader Render ---
  if (pageLoading) {
    return (
      <div>
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 w-1/3 bg-gray-200 rounded mt-4"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item, index) => (
            <div
              key={index}
              onClick={() => openModal(item.modalKey)}
              className={`
                bg-white rounded-xl p-5 shadow-sm border border-gray-100 
                transition-all cursor-pointer group
                ${item.hoverColor} hover:shadow-md
              `}
            >
              <div className={`${item.color} p-3 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className={item.iconColor} size={24} />
              </div>
              <h4 className="font-semibold text-gray-800">{item.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              <div className="mt-3 flex items-center text-xs text-gray-400 group-hover:text-gray-600">
                Click to start <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render active modal */}
      {activeModal && modals[activeModal] && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={modals[activeModal].title}
          size={activeModal === 'tools' ? 'md' : 'lg'}
        >
          {modals[activeModal].content}
        </Modal>
      )}
    </>
  );
};

export default ActivityCards;