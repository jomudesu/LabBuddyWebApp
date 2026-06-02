import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  LayoutGrid, 
  Beaker, 
  FlaskConical, 
  Activity, 
  Box,
  Cpu,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Skull
} from 'lucide-react';

const Inventory = () => {
  const [loading, setLoading] = useState(true);

  // ─── STATE MANAGEMENT ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    hazard: 'All'
  });

  // Simulate a network fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ─── MOCK DATABASE ───
  const inventoryData = useMemo(() => [
    { id: 1, name: 'Hydrochloric Acid', formula: '0.1M HCl', category: 'Chemical', hazard: 'Corrosive', icon: FlaskConical, color: 'blue' },
    { id: 2, name: 'Sodium Hydroxide', formula: '0.1M NaOH', category: 'Chemical', hazard: 'Corrosive', icon: FlaskConical, color: 'blue' },
    { id: 3, name: 'Copper Strips', formula: 'Cu', category: 'Metal', hazard: 'Safe', icon: Box, color: 'orange' },
    { id: 4, name: 'Zinc Powder', formula: 'Zn', category: 'Metal', hazard: 'Flammable', icon: Box, color: 'gray' },
    { id: 5, name: 'Digital pH Meter', formula: 'Instrument', category: 'Equipment', hazard: 'Safe', icon: Cpu, color: 'purple' },
    { id: 6, name: 'Magnetic Stirrer', formula: 'Apparatus', category: 'Equipment', hazard: 'Safe', icon: Activity, color: 'purple' },
    { id: 7, name: '250mL Beaker', formula: 'Borosilicate', category: 'Glassware', hazard: 'Safe', icon: Beaker, color: 'emerald' },
    { id: 8, name: 'Burette 50mL', formula: 'Glassware', category: 'Glassware', hazard: 'Safe', icon: Beaker, color: 'emerald' },
    { id: 9, name: 'Phenolphthalein', formula: 'Indicator', category: 'Chemical', hazard: 'Irritant', icon: FlaskConical, color: 'pink' },
    { id: 10, name: 'Barium Chloride', formula: 'BaCl2', category: 'Chemical', hazard: 'Toxic', icon: FlaskConical, color: 'blue' },
  ], []);

  const categories = ['All', 'Chemical', 'Metal', 'Equipment', 'Glassware'];
  const hazards = ['All', 'Safe', 'Irritant', 'Flammable', 'Corrosive', 'Toxic'];

  // ─── FILTERING ENGINE ───
  const processedItems = useMemo(() => {
    return inventoryData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.formula.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || item.category === filters.category;
      const matchesHazard = filters.hazard === 'All' || item.hazard === filters.hazard;
      return matchesSearch && matchesCategory && matchesHazard;
    });
  }, [inventoryData, searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters({ category: 'All', hazard: 'All' });
    setSearchQuery('');
  };

  // ─── DYNAMIC BADGE STYLING ───
  const getHazardBadge = (hazard) => {
    switch (hazard) {
      case 'Safe': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Irritant': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Flammable': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Corrosive': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Toxic': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getHazardIcon = (hazard) => {
    switch (hazard) {
      case 'Safe': return <CheckCircle2 size={14} className="mr-1" />;
      case 'Irritant': return <AlertCircle size={14} className="mr-1" />;
      case 'Flammable': return <Flame size={14} className="mr-1" />;
      case 'Corrosive': return <ShieldAlert size={14} className="mr-1" />;
      case 'Toxic': return <Skull size={14} className="mr-1" />;
      default: return null;
    }
  };

  // ─── SKELETON LOADER ───
  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen w-full p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[180px] animate-pulse">
                <div className="flex justify-between">
                   <div className="bg-gray-200 h-12 w-12 rounded-xl mb-4"></div>
                   <div className="bg-gray-200 h-6 w-20 rounded-md"></div>
                </div>
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeFilterCount = (filters.category !== 'All' ? 1 : 0) + (filters.hazard !== 'All' ? 1 : 0);

  return (
    <div className="bg-slate-50 min-h-screen w-full">
      <div className="p-8 max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Lab Inventory</h1>
        </div>

        {/* ─── CONTROL BAR ─── */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chemicals, metals, equipment..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium" 
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
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[300px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Refine Inventory</h3>
              {activeFilterCount > 0 && (
                <button onClick={handleClearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center font-medium transition-colors">
                  <X size={16} className="mr-1" /> Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><LayoutGrid size={16} className="text-blue-500"/> Item Category</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-blue-500"/> Hazard Level</label>
                <select 
                  value={filters.hazard} 
                  onChange={(e) => setFilters({...filters, hazard: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  {hazards.map(hazard => <option key={hazard} value={hazard}>{hazard}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── EMPTY STATE HANDLER ─── */}
        {processedItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Box className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-600 mb-2">No items found</h2>
            <p className="text-gray-400 font-medium">Try adjusting your filters or search query.</p>
            <button onClick={handleClearFilters} className="mt-4 text-blue-600 font-bold hover:underline">Reset all filters</button>
          </div>
        )}

        {/* ─── INVENTORY GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedItems.map((item) => (
            <div 
              key={item.id} 
              className={`group bg-white rounded-2xl p-6 transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 hover:border-${item.color}-300`}
              onClick={() => alert(`${item.name} details coming soon!`)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`bg-${item.color}-100 p-3.5 rounded-xl w-fit transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md`}>
                  <item.icon className={`text-${item.color}-600`} size={24} />
                </div>
                
                {/* Dynamically colored hazard badge */}
                <span className={`flex items-center text-[11px] font-bold px-2.5 py-1.5 rounded-md border shadow-sm ${getHazardBadge(item.hazard)}`}>
                  {getHazardIcon(item.hazard)}
                  {item.hazard.toUpperCase()}
                </span>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className={`text-xl font-bold text-gray-800 leading-tight group-hover:text-${item.color}-700 transition-colors`}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-bold text-${item.color}-600 bg-${item.color}-50 px-2 py-1 rounded border border-${item.color}-100`}>
                    {item.category}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {item.formula}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Inventory;