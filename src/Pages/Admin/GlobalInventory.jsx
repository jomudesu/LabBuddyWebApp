import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, X, Plus, Edit2, Trash2, AlertTriangle, 
  Beaker, FlaskConical, Cpu, ShieldAlert, Archive, 
  CheckCircle2, Flame, Skull, Box, LayoutGrid, Activity, ArrowDownAZ 
} from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase'; 

const GlobalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ─── FILTER STATES (Unified with other CMS pages) ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    hazard: 'All',
    sortBy: 'default'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [formData, setFormData] = useState({ name: '', category: 'Chemical', hazard: 'None', details: '' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── SUPABASE FETCH ───
  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase.from('inventory').select('*').order('name', { ascending: true });
      if (error) throw error;
      setInventory(data.map(item => ({ ...item, lastUpdatedStr: new Date(item.created_at).toLocaleDateString() })));
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  // ─── SUPABASE CRUD ───
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { name: formData.name, category: formData.category, hazard: formData.hazard, details: formData.details };
      if (editingItem) {
        await supabase.from('inventory').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('inventory').insert([payload]);
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      alert("Failed to save asset.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    await supabase.from('inventory').delete().eq('id', itemToDelete.id);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
    fetchInventory();
  };

  const openCreateModal = () => { setEditingItem(null); setFormData({ name: '', category: 'Chemical', hazard: 'None', details: '' }); setIsModalOpen(true); };
  const openEditModal = (item) => { setEditingItem(item); setFormData({ name: item.name, category: item.category, hazard: item.hazard, details: item.details }); setIsModalOpen(true); };

  // ─── FILTERS & UI ───
  const processedItems = useMemo(() => {
    let result = inventory.filter(item => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.details || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || item.category === filters.category;
      const matchesHazard = filters.hazard === 'All' || item.hazard === filters.hazard;
      return matchesSearch && matchesCategory && matchesHazard;
    });

    if (filters.sortBy === 'a-z') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (filters.sortBy === 'z-a') result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    else if (filters.sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (filters.sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return result;
  }, [inventory, searchQuery, filters]);

  const activeFilterCount = (filters.category !== 'All' ? 1 : 0) + (filters.hazard !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({ category: 'All', hazard: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Chemical': return { icon: Beaker, color: 'text-blue-400' };
      case 'Glassware': return { icon: FlaskConical, color: 'text-emerald-400' };
      case 'Equipment': return { icon: Cpu, color: 'text-purple-400' };
      case 'Safety': return { icon: ShieldAlert, color: 'text-orange-400' };
      default: return { icon: Box, color: 'text-slate-400' };
    }
  };

  const getHazardBadge = (hazard) => {
    switch (hazard) {
      case 'None': return <span className="flex items-center w-fit text-[11px] font-bold px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider"><CheckCircle2 size={12} className="mr-1.5" /> SAFE</span>;
      case 'Flammable': return <span className="flex items-center w-fit text-[11px] font-bold px-2.5 py-1 rounded-md border bg-orange-500/10 text-orange-400 border-orange-500/20 uppercase tracking-wider"><Flame size={12} className="mr-1.5" /> FLAMMABLE</span>;
      case 'Toxic': return <span className="flex items-center w-fit text-[11px] font-bold px-2.5 py-1 rounded-md border bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase tracking-wider"><Skull size={12} className="mr-1.5" /> TOXIC</span>;
      case 'Corrosive': return <span className="flex items-center w-fit text-[11px] font-bold px-2.5 py-1 rounded-md border bg-yellow-500/10 text-yellow-400 border-yellow-500/20 uppercase tracking-wider"><AlertTriangle size={12} className="mr-1.5" /> CORROSIVE</span>;
      default: return <span className="flex items-center w-fit text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 uppercase tracking-wider">UNKNOWN</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative animate-fade-in">
      
      {/* ─── MODALS ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0"><h2 className="text-xl font-bold text-slate-100 flex items-center">{editingItem ? <Edit2 className="mr-2 text-blue-400" size={20} /> : <Plus className="mr-2 text-emerald-400" size={20} />} {editingItem ? 'Edit Asset' : 'Add New Asset'}</h2><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors"><X size={24} /></button></div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto form-scrollbar">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asset Name</label><input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"><option value="Chemical">Chemical</option><option value="Glassware">Glassware</option><option value="Equipment">Equipment</option><option value="Safety">Safety Gear</option></select></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hazard Level</label><select value={formData.hazard} onChange={(e) => setFormData({...formData, hazard: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"><option value="None">Safe / None</option><option value="Flammable">Flammable</option><option value="Toxic">Toxic</option><option value="Corrosive">Corrosive</option></select></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details / Specs</label><textarea rows="3" value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all" placeholder="e.g. 250mL borosilicate..." /></div>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all">{isSaving ? 'Saving...' : 'Save Asset'}</button></div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex mx-auto mb-4 items-center justify-center border border-rose-500/20"><AlertTriangle className="text-rose-500" size={32} /></div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Delete Asset?</h2>
              <p className="text-slate-400 text-sm mb-6">Are you sure you want to permanently delete <strong className="text-slate-200">"{itemToDelete.name}"</strong> from the catalog? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 disabled:opacity-50 transition-all">{isDeleting ? 'Deleting...' : 'Delete Asset'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center">
             <Archive className="mr-3 text-blue-500" size={32} /> Global Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage the virtual catalog of lab equipment and chemicals.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95">
          <Plus size={18} className="mr-2" /> Add Asset
        </button>
      </div>

      {/* ─── SEARCH & FILTER TOGGLE ROW (Unified Dark Mode) ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by name or details..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" 
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${
            showFilters || activeFilterCount > 0 
            ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:bg-blue-700' 
            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Filter size={20} className="mr-2" /> 
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-3 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── EXPANDABLE FILTERS PANEL (Unified Dark Mode) ─── */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Refine Catalog</h3>
            {activeFilterCount > 0 && (
              <button onClick={handleClearFilters} className="text-sm text-rose-400 hover:text-rose-300 flex items-center font-medium transition-colors">
                <X size={16} className="mr-1" /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><LayoutGrid size={16} className="text-blue-400"/> Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                <option value="All">All Categories</option>
                <option value="Chemical">Chemicals</option>
                <option value="Glassware">Glassware</option>
                <option value="Equipment">Equipment</option>
                <option value="Safety">Safety Gear</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><Activity size={16} className="text-blue-400"/> Hazard Level</label>
              <select 
                value={filters.hazard} 
                onChange={(e) => setFilters({...filters, hazard: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                <option value="All">All Hazards</option>
                <option value="None">Safe / None</option>
                <option value="Flammable">Flammable</option>
                <option value="Toxic">Toxic</option>
                <option value="Corrosive">Corrosive</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><ArrowDownAZ size={16} className="text-blue-400"/> Sort Order</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                <option value="default">Default Order</option>
                <option value="a-z">Alphabetical (A - Z)</option>
                <option value="z-a">Alphabetical (Z - A)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE (Unified Dark Mode) ─── */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0 relative">
        {loading && <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead className="sticky top-0 z-10 bg-slate-900/95 border-b border-slate-700/50 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hazard</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedItems.length > 0 ? processedItems.map((item) => {
                const { icon: Icon, color } = getCategoryTheme(item.category);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/80 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 mr-4 shadow-inner">
                          <Icon size={20} className={color} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="bg-slate-700 border border-slate-600 px-2 py-0.5 rounded text-slate-300">{item.category}</span>
                            <span className="truncate max-w-[250px]">{item.details || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getHazardBadge(item.hazard)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">{item.lastUpdatedStr}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                    <div className="bg-slate-800/50 w-20 h-20 rounded-full flex mx-auto mb-4 items-center justify-center border border-slate-700/50">
                      <Archive size={32} className="text-slate-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">Inventory is empty</p>
                    <button onClick={handleClearFilters} className="mt-4 text-blue-400 font-bold hover:underline">Reset Filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalInventory;