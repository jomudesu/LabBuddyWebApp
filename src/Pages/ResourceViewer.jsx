import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Video, BookOpen, Download, 
  Printer, Play, Maximize, Volume2, AlignLeft, 
  AlignCenter, AlignRight, Bold, Italic 
} from 'lucide-react';

// Mirroring the library database
const resourceMap = {
  '1': { title: 'Chemistry Lab Manual', type: 'PDF', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
  '3': { title: 'Safety Procedures', type: 'Video', icon: Video, color: 'text-green-600', bg: 'bg-green-100' },
  '4': { title: 'Experiment Templates', type: 'Document', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
  '5': { title: 'Video Tutorials', type: 'Video', icon: Video, color: 'text-orange-600', bg: 'bg-orange-100' },
  '6': { title: 'Research Papers', type: 'PDF', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
};

const ResourceViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const resource = resourceMap[id];

  useEffect(() => {
    // Simulate content loading time
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [id]);

  if (!resource) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-800">Resource not found</h2>
        <button onClick={() => navigate('/library')} className="mt-4 text-blue-600 font-bold hover:underline">Return to Library</button>
      </div>
    );
  }

  const renderPDF = () => (
    <div className="flex flex-col h-full bg-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between text-slate-300 shrink-0">
        <span className="text-sm font-semibold tracking-wide">Page 1 of 42</span>
        <div className="flex gap-4">
          <button className="hover:text-white transition-colors"><Download size={18}/></button>
          <button className="hover:text-white transition-colors"><Printer size={18}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 md:p-10 flex justify-center custom-scrollbar">
        <div className="bg-white w-full max-w-4xl h-[1200px] shadow-lg rounded-sm p-12 md:p-16 border border-slate-200">
          <div className="h-10 bg-slate-200 w-3/4 rounded-md mb-10 animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 w-full rounded animate-pulse"></div>
            <div className="h-4 bg-slate-100 w-full rounded animate-pulse"></div>
            <div className="h-4 bg-slate-100 w-5/6 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-100 w-full rounded animate-pulse"></div>
          </div>
          <div className="mt-12 h-64 bg-slate-100 w-full rounded-xl animate-pulse flex items-center justify-center">
            <span className="text-slate-400 font-medium">Figure 1.1 Diagram Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideo = () => (
    <div className="flex flex-col h-full bg-black rounded-2xl overflow-hidden border border-slate-800 relative group flex-1 max-h-[800px]">
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
        <button className="w-20 h-20 bg-blue-600/90 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
          <Play size={32} className="ml-1" />
        </button>
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-20 pb-6 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <div className="flex items-center gap-4 text-white">
            <Play size={20} className="hover:text-blue-400 cursor-pointer" />
            <div className="text-xs font-mono">00:00 / 14:20</div>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer relative">
               <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full"></div>
               <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
            </div>
            <Volume2 size={20} className="hover:text-blue-400 cursor-pointer" />
            <Maximize size={20} className="hover:text-blue-400 cursor-pointer" />
         </div>
      </div>
    </div>
  );

  const renderDocument = () => (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center gap-6 shrink-0">
         <div className="flex gap-4 text-slate-500">
            <button className="hover:text-blue-600"><Bold size={18}/></button>
            <button className="hover:text-blue-600"><Italic size={18}/></button>
         </div>
         <div className="w-px h-5 bg-slate-300"></div>
         <div className="flex gap-4 text-slate-500">
            <button className="text-blue-600"><AlignLeft size={18}/></button>
            <button className="hover:text-blue-600"><AlignCenter size={18}/></button>
            <button className="hover:text-blue-600"><AlignRight size={18}/></button>
         </div>
         <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>
         <button className="ml-auto bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            Save Copy
         </button>
      </div>
      <div className="flex-1 overflow-auto p-8 lg:p-16 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
           <h1 className="text-4xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-8">Title: [Experiment Name]</h1>
           <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-700">I. Objectives</h3>
              <div className="h-4 bg-slate-100 w-full rounded"></div>
              <div className="h-4 bg-slate-100 w-3/4 rounded"></div>
           </div>
           <div className="space-y-3 pt-6">
              <h3 className="text-lg font-bold text-slate-700">II. Materials Needed</h3>
              <ul className="list-disc pl-5 space-y-2">
                 <li className="h-4 bg-slate-100 w-1/2 rounded"></li>
                 <li className="h-4 bg-slate-100 w-1/3 rounded"></li>
                 <li className="h-4 bg-slate-100 w-2/5 rounded"></li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* Top Navigation */}
        <button 
          onClick={() => navigate('/library')} 
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all w-fit mb-6"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> 
          Back to Library
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <div className={`${resource.bg} p-3.5 rounded-xl`}>
            <resource.icon className={resource.color} size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">{resource.title}</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{resource.type} VIEWER</p>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-h-0 relative">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : null}
          
          {resource.type === 'PDF' && renderPDF()}
          {resource.type === 'Video' && renderVideo()}
          {resource.type === 'Document' && renderDocument()}
        </div>

      </div>
    </div>
  );
};

export default ResourceViewer;