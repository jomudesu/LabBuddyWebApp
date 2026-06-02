import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X,
  FlaskConical, 
  Edit2, 
  Trash2, 
  Plus, 
  BookOpen,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  Beaker,
  Atom,
  Microscope
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase'; 

const ManageExperiments = () => {
  // ─── STATE MANAGEMENT ───
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Unified Modal (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingExp, setEditingExp] = useState(null); 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Chemistry',
    difficulty: 'Beginner',
    status: 'published' // Default to published for new ones
  });

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── REAL-TIME FIREBASE CONNECTION ───
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'experiment'), (snapshot) => {
      const fetchedExps = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const formatDate = (timestamp) => {
          if (!timestamp) return 'Just now';
          return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          });
        };

        fetchedExps.push({
          id: doc.id,
          ...data,
          // ✨ FIXED: Pulling createdAt to match your DB schema
          createdAtRaw: data.createdAt?.toDate() || new Date(0), 
          createdAt: formatDate(data.createdAt),
          // ✨ FIXED: If status is missing in legacy DB items, default to 'published'
          status: data.status || 'published' 
        });
      });

      // Sort by newest created first
      fetchedExps.sort((a, b) => b.createdAtRaw - a.createdAtRaw);
      setExperiments(fetchedExps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── CRUD ACTIONS ───

  const openCreateModal = () => {
    setEditingExp(null);
    setFormData({
      title: '',
      description: '',
      category: 'Chemistry',
      difficulty: 'Beginner',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExp(exp);
    setFormData({
      title: exp.title || '',
      description: exp.description || '',
      category: exp.category || 'Chemistry',
      difficulty: exp.difficulty || 'Beginner',
      status: exp.status || 'published' // Default legacy items to published in the edit form
    });
    setIsModalOpen(true);
  };

  const handleSaveExperiment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const expData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        status: formData.status,
      };

      if (editingExp) {
        // UPDATE Existing
        const expRef = doc(db, 'experiment', editingExp.id);
        await updateDoc(expRef, expData);
      } else {
        // CREATE New
        expData.createdAt = serverTimestamp();
        
        // ✨ FIXED: Generate a clean document ID from the title (e.g. "Acid Base Titration" -> "acid_base_titration")
        const customId = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, ''); // Remove leading/trailing underscores
          
        await setDoc(doc(db, 'experiment', customId), expData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving experiment:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!expToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'experiment', expToDelete.id));
      setIsDeleteModalOpen(false);
      setExpToDelete(null);
    } catch (error) {
      console.error("Error deleting experiment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── FILTERING ENGINE ───
  const processedExps = useMemo(() => {
    return experiments.filter(exp => {
      const safeTitle = (exp.title || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = safeTitle.includes(query);
      const matchesStatus = filterStatus === 'All' || (exp.status || 'published').toLowerCase() === filterStatus.toLowerCase();
      const matchesDifficulty = filterDifficulty === 'All' || (exp.difficulty || 'Beginner') === filterDifficulty;
      
      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [experiments, searchQuery, filterStatus, filterDifficulty]);


  // ─── UI HELPERS ───
  const getDifficultyBadge = (level) => {
    switch (level) {
      case 'Advanced':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">Advanced</span>;
      case 'Intermediate':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Intermediate</span>;
      default:
        return <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Beginner</span>;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'draft') {
      return (
        <span className="flex items-center w-fit text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Clock size={14} className="mr-1" /> Draft
        </span>
      );
    }
    return (
      <span className="flex items-center w-fit text-xs font-bold text-blue-400 uppercase tracking-wider">
        <CheckCircle size={14} className="mr-1" /> Published
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative">
      
      {/* ─── CREATE / EDIT MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-100 flex items-center">
                {editingExp ? <Edit2 className="mr-2 text-blue-400" size={20} /> : <Plus className="mr-2 text-emerald-400" size={20} />}
                {editingExp ? 'Edit Experiment' : 'Create New Experiment'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveExperiment} className="p-6 overflow-y-auto form-scrollbar space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experiment Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Acid-Base Titration"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Briefly describe the learning objectives..."
                  rows="3"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                  >
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                  <select 
                    value={formData.difficulty} 
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Publication Status</label>
                <div className="flex gap-4">
                  <label className="flex-1 relative">
                    <input 
                      type="radio" name="status" value="published" 
                      checked={formData.status === 'published'} 
                      onChange={() => setFormData({...formData, status: 'published'})} 
                      className="peer sr-only"
                    />
                    <div className="p-3 text-center border border-slate-700 bg-slate-800 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 font-bold transition-all text-sm text-slate-400">
                      Published
                    </div>
                  </label>
                  <label className="flex-1 relative">
                    <input 
                      type="radio" name="status" value="draft" 
                      checked={formData.status === 'draft'} 
                      onChange={() => setFormData({...formData, status: 'draft'})} 
                      className="peer sr-only"
                    />
                    <div className="p-3 text-center border border-slate-700 bg-slate-800 rounded-xl cursor-pointer peer-checked:border-slate-500 peer-checked:bg-slate-700 peer-checked:text-slate-200 font-bold transition-all text-sm text-slate-400">
                      Draft / Hidden
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOM DANGER MODAL (DELETE) ─── */}
      {isDeleteModalOpen && expToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Delete Experiment?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to permanently delete <strong className="text-slate-200">"{expToDelete.title}"</strong>? This will remove it from the student catalog immediately.
              </p>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsDeleteModalOpen(false); setExpToDelete(null); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Experiment CMS</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Create, edit, and publish virtual laboratory modules.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add Experiment
        </button>
      </div>

      {/* ─── CONTROL BAR ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments by title..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium" 
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative shrink-0 w-40">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none">
              <Activity size={16} />
            </div>
            <select 
              value={filterDifficulty} 
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full pl-10 pr-8 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none text-sm"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="relative shrink-0 w-40">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none">
              <Filter size={16} />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0 relative">
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md">
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Experiment Module</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                {/* ✨ FIXED: Changed from Last Edited to Date Created */}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedExps.length > 0 ? (
                processedExps.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 mr-4 shrink-0 border border-slate-700 shadow-inner">
                          <FlaskConical size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{exp.title || 'Untitled'}</div>
                          <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{exp.description || 'No description provided.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-slate-300">
                        {exp.category === 'Chemistry' && <Beaker size={14} className="mr-1.5 text-blue-400" />}
                        {exp.category === 'Physics' && <Atom size={14} className="mr-1.5 text-purple-400" />}
                        {exp.category === 'Biology' && <Microscope size={14} className="mr-1.5 text-emerald-400" />}
                        {exp.category || 'Chemistry'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getDifficultyBadge(exp.difficulty)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(exp.status)}
                    </td>
                    {/* ✨ FIXED: Reading createdAt instead of updatedAt */}
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {exp.createdAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(exp)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setExpToDelete(exp);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                      <BookOpen size={32} className="text-slate-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">No experiments found</p>
                    <p className="text-sm mt-1 mb-4">You haven't created any virtual modules yet.</p>
                    <button 
                      onClick={openCreateModal}
                      className="text-emerald-400 font-bold hover:underline flex items-center justify-center mx-auto"
                    >
                      <Plus size={16} className="mr-1"/> Create your first experiment
                    </button>
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

export default ManageExperiments;