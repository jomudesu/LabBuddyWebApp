import React from 'react';
import { Book, BookOpen, Video, FileText, Search } from 'lucide-react';

const Library = () => {
  const resources = [
    { id: 1, title: 'Chemistry Lab Manual', type: 'PDF', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 2, title: 'Periodic Table Guide', type: 'Interactive', icon: Book, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 3, title: 'Safety Procedures', type: 'Video', icon: Video, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 4, title: 'Experiment Templates', type: 'Document', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 5, title: 'Video Tutorials', type: 'Video', icon: Video, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 6, title: 'Research Papers', type: 'PDF', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Library</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">PDFs</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Videos</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Interactive</button>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100">
            <div className={`${resource.bg} p-3 rounded-lg w-fit mb-3`}>
              <resource.icon className={resource.color} size={24} />
            </div>
            <h3 className="font-semibold text-gray-800">{resource.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{resource.type}</p>
            <button className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700">
              View Resource →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;