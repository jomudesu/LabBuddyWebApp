import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, FlaskConical, Edit2, Trash2, Plus, BookOpen, Activity, AlertTriangle, Clock, CheckCircle, Beaker, Atom, Microscope, LayoutGrid, BarChart2, ArrowDownAZ } from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase'; 

const ManageExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ─── FILTER STATES (Unified with Student Dashboard) ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All',
    status: 'All',
    sortBy: 'default'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingExp, setEditingExp] = useState(null); 
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Chemistry', difficulty: 'Beginner', status: 'published' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── SUPABASE FETCH ───
  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase.from('experiments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setExperiments(data.map(exp => ({ ...exp, createdAtStr: new Date(exp.created_at).toLocaleDateString() })));
    } catch (error) {
      console.error("Error fetching experiments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExperiments(); }, []);

  // ─── SUPABASE CRUD ───
  const handleSaveExperiment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { title: formData.title, description: formData.description, category: formData.category, difficulty: formData.difficulty, status: formData.status };

      if (editingExp) {
        await supabase.from('experiments').update(payload).eq('id', editingExp.id);
      } else {
        const customId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
        await supabase.from('experiments').insert([{ id: customId, ...payload }]);
      }
      setIsModalOpen(false);
      fetchExperiments();
    } catch (error) {
      alert("Failed to save experiment.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!expToDelete) return;
    setIsDeleting(true);
    await supabase.from('experiments').delete().eq('id', expToDelete.id);
    setIsDeleteModalOpen(false);
    setExpToDelete(null);
    setIsDeleting(false);
    fetchExperiments();
  };

  const openCreateModal = () => { setEditingExp(null); setFormData({ title: '', description: '', category: 'Chemistry', difficulty: 'Beginner', status: 'published' }); setIsModalOpen(true); };
  const openEditModal = (exp) => { setEditingExp(exp); setFormData({ title: exp.title, description: exp.description, category: exp.category, difficulty: exp.difficulty, status: exp.status }); setIsModalOpen(true); };

  // ─── FILTERS & UI LOGIC ───
  const categories = useMemo(() => ['All', ...new Set(experiments.map(e => e.category).filter(Boolean))], [experiments]);
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const processedExps = useMemo(() => {
    let result = experiments.filter(exp => {
      const matchesSearch = (exp.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || exp.category === filters.category;
      const matchesDifficulty = filters.difficulty === 'All' || (exp.difficulty || 'Beginner') === filters.difficulty;
      const matchesStatus = filters.status === 'All' || (exp.status || 'published').toLowerCase() === filters.status.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });

    if (filters.sortBy === 'a-z') result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (filters.sortBy === 'z-a') result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    else if (filters.sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // default to newest

    return result;
  }, [experiments, searchQuery, filters]);

  const activeFilterCount = (filters.category !== 'All' ? 1 : 0) + (filters.difficulty !== 'All' ? 1 : 0) + (filters.status !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({ category: 'All', difficulty: 'All', status: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  const getDifficultyBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'advanced': return <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">Advanced</span>;
      case 'intermediate': return <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Intermediate</span>;
      default: return <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Beginner</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative">
      
      {/* ─── MODALS ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0"><h2 className="text-xl font-bold text-slate-100 flex items-center">{editingExp ? <Edit2 className="mr-2 text-blue-400" size={20} /> : <Plus className="mr-2 text-emerald-400" size={20} />} {editingExp ? 'Edit Experiment' : 'Create Experiment'}</h2><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200"><X size={24} /></button></div>
            <form onSubmit={handleSaveExperiment} className="p-6 overflow-y-auto max-h-[75vh] space-y-5 form-scrollbar">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label><input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label><textarea required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500"><option value="Chemistry">Chemistry</option><option value="Physics">Physics</option><option value="Biology">Biology</option></select></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label><select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500"><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex-1 relative"><input type="radio" name="status" value="published" checked={formData.status === 'published'} onChange={() => setFormData({...formData, status: 'published'})} className="peer sr-only"/><div className="p-3 text-center border border-slate-700 bg-slate-800 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 font-bold transition-all text-sm text-slate-400">Published</div></label>
                  <label className="flex-1 relative"><input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={() => setFormData({...formData, status: 'draft'})} className="peer sr-only"/><div className="p-3 text-center border border-slate-700 bg-slate-800 rounded-xl cursor-pointer peer-checked:border-slate-500 peer-checked:bg-slate-700 peer-checked:text-slate-200 font-bold transition-all text-sm text-slate-400">Draft</div></label>
                </div>
              </div>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Experiment'}</button></div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && expToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"><div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden"><div className="p-6 text-center"><div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20"><AlertTriangle className="text-rose-500" size={32} /></div><h2 className="text-xl font-bold text-slate-100 mb-2">Delete Experiment?</h2><p className="text-slate-400 text-sm mb-6">Are you sure you want to permanently delete <strong className="text-slate-200">"{expToDelete.title}"</strong>?</p><div className="flex gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700">Cancel</button><button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button></div></div></div></div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Experiment CMS</h1><p className="text-sm text-slate-400 mt-1 font-medium">Create, edit, and publish virtual laboratory modules.</p></div>
        <button onClick={openCreateModal} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all"><Plus size={18} className="mr-2" /> Add Experiment</button>
      </div>

      {/* ─── SEARCH & FILTER TOGGLE ROW ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 outline-none focus:border-blue-500 transition-all" 
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
            <span className="ml-3 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── EXPANDABLE FILTERS PANEL (Dark Mode Adapted) ─── */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Refine Parameters</h3>
            {activeFilterCount > 0 && (
              <button onClick={handleClearFilters} className="text-sm text-rose-400 hover:text-rose-300 flex items-center font-medium transition-colors">
                <X size={16} className="mr-1" /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><LayoutGrid size={16} className="text-blue-400"/> Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><BarChart2 size={16} className="text-blue-400"/> Difficulty</label>
              <select 
                value={filters.difficulty} 
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><Activity size={16} className="text-blue-400"/> Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><ArrowDownAZ size={16} className="text-blue-400"/> Sort Order</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                <option value="default">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Alphabetical (A - Z)</option>
                <option value="z-a">Alphabetical (Z - A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0 relative">
        {loading && <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-900/95">
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Module</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Difficulty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Date Created</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedExps.length > 0 ? processedExps.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/80 group transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center"><div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 mr-4 border border-slate-700 shadow-inner"><FlaskConical size={20} /></div><div><div className="font-bold text-slate-100 text-sm">{exp.title}</div><div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{exp.description}</div></div></div></td>
                  <td className="px-6 py-4"><div className="flex items-center text-sm font-medium text-slate-300">{exp.category === 'Physics' ? <Atom size={14} className="mr-1.5 text-purple-400"/> : exp.category === 'Biology' ? <Microscope size={14} className="mr-1.5 text-emerald-400"/> : <Beaker size={14} className="mr-1.5 text-blue-400"/>} {exp.category}</div></td>
                  <td className="px-6 py-4">{getDifficultyBadge(exp.difficulty)}</td>
                  <td className="px-6 py-4">{exp.status === 'draft' ? <span className="flex items-center text-xs font-bold text-slate-400 uppercase"><Clock size={14} className="mr-1"/> Draft</span> : <span className="flex items-center text-xs font-bold text-blue-400 uppercase"><CheckCircle size={14} className="mr-1"/> Published</span>}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium">{exp.createdAtStr}</td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEditModal(exp)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 size={18} /></button><button onClick={() => { setExpToDelete(exp); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button></div></td>
                </tr>
              )) : !loading && (
                <tr><td colSpan="6" className="px-6 py-16 text-center"><div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50"><BookOpen size={32} className="text-slate-600" /></div><p className="text-lg font-bold text-slate-400">No experiments found</p><button onClick={openCreateModal} className="mt-4 text-emerald-400 font-bold hover:underline">Create your first experiment</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageExperiments;