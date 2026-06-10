import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, BookOpen, Video, FileText, Search, Filter, X, ArrowDownAZ, LayoutGrid, Database } from 'lucide-react';

const Library = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ─── STATE MANAGEMENT FOR CONTROLS ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'All',
    sortBy: 'default' // 'default', 'a-z', 'z-a'
  });

  // Simulate a network fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Mock Database - All standard resources now route to the ResourceViewer
  const resources = useMemo(() => [
    { id: 'inv', title: 'Lab Inventory Database', type: 'Interactive', icon: Database, color: 'text-teal-600', bg: 'bg-teal-100', route: '/inventory' },
    { id: 1, title: 'Chemistry Lab Manual', type: 'PDF', icon: FileText, color: 'text-red-600', bg: 'bg-red-100', route: '/library/view/1' },
    { id: 2, title: 'Periodic Table Guide', type: 'Interactive', icon: Book, color: 'text-blue-600', bg: 'bg-blue-100', route: '/periodic-table' },
    { id: 3, title: 'Safety Procedures', type: 'Video', icon: Video, color: 'text-green-600', bg: 'bg-green-100', route: '/library/view/3' },
    { id: 4, title: 'Experiment Templates', type: 'Document', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', route: '/library/view/4' },
    { id: 5, title: 'Video Tutorials', type: 'Video', icon: Video, color: 'text-orange-600', bg: 'bg-orange-100', route: '/library/view/5' },
    { id: 6, title: 'Research Papers', type: 'PDF', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100', route: '/library/view/6' },
  ], []);

  // ─── DYNAMIC DATA EXTRACTION ───
  const resourceTypes = useMemo(() => ['All', ...new Set(resources.map(r => r.type))], [resources]);

  // ─── FILTERING & SORTING ENGINE ───
  const processedResources = useMemo(() => {
    let result = resources.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filters.type === 'All' || res.type === filters.type;
      return matchesSearch && matchesType;
    });

    if (filters.sortBy === 'a-z') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'z-a') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [resources, searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters({ type: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  // ─── SKELETON LOADER ───
  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[200px] animate-pulse">
                <div className="bg-gray-200 h-12 w-12 rounded-xl mb-4"></div>
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeFilterCount = (filters.type !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  return (
    <div className="bg-slate-50 min-h-screen w-full">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Resource Library</h1>
        </div>

        {/* ─── CONTROL BAR (Search & Main Filter Button) ─── */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, manuals, and databases..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${
              showFilters || activeFilterCount > 0 
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 hover:bg-blue-700' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <Filter size={20} className="mr-2" /> 
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-3 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── EXPANDABLE FILTER PANEL ─── */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Refine Resources</h3>
              {activeFilterCount > 0 && (
                <button onClick={handleClearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center font-medium transition-colors">
                  <X size={16} className="mr-1" /> Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Filter */}
              <div>
                <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2"><LayoutGrid size={16} className="text-blue-500"/> Format Type</label>
                <select 
                  value={filters.type} 
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  {resourceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2"><ArrowDownAZ size={16} className="text-blue-500"/> Sort Order</label>
                <select 
                  value={filters.sortBy} 
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  <option value="default">Default Order</option>
                  <option value="a-z">Alphabetical (A - Z)</option>
                  <option value="z-a">Alphabetical (Z - A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── EMPTY STATE HANDLER ─── */}
        {processedResources.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-600 mb-2">No resources found</h2>
            <p className="text-gray-400">Try adjusting your search or filter settings.</p>
            <button onClick={handleClearFilters} className="mt-4 text-blue-600 font-semibold hover:underline">Reset all filters</button>
          </div>
        )}

        {/* ─── RESOURCES GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedResources.map((resource) => (
            <div 
              key={resource.id} 
              // Smart Click: Navigates if route exists, otherwise triggers an alert placeholder
              onClick={() => resource.route ? navigate(resource.route) : alert(`Opening ${resource.title}...`)}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className={`${resource.bg} p-3.5 rounded-xl w-fit mb-4 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md`}>
                <resource.icon className={resource.color} size={24} />
              </div>
              
              <div className="relative z-10 flex-1">
                <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-900 transition-colors">{resource.title}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{resource.type}</p>
              </div>
              
              <button className="mt-5 text-blue-600 text-sm font-bold flex items-center group-hover:text-blue-700 transition-colors relative z-10">
                {resource.route ? 'Open Directory' : 'View Resource'}
                <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Library;