import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X,
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Beaker,
  Thermometer,
  ShieldAlert,
  Archive,
  Droplets,
  Flame,
  Skull
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase'; 

const GlobalInventory = () => {
  // ─── STATE MANAGEMENT ───
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterHazard, setFilterHazard] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Unified Modal (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Chemical',
    details: '',
    hazard: 'None'
  });

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── REAL-TIME FIREBASE CONNECTION ───
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const fetchedItems = [];
      
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

        fetchedItems.push({
          id: doc.id,
          ...data,
          updatedAtRaw: data.updatedAt?.toDate() || new Date(0), 
          updatedAt: formatDate(data.updatedAt)
        });
      });

      fetchedItems.sort((a, b) => b.updatedAtRaw - a.updatedAtRaw);
      setInventory(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── CRUD ACTIONS ───

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Chemical',
      details: '',
      hazard: 'None'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Chemical',
      details: item.details || '',
      hazard: item.hazard || 'None'
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        details: formData.details,
        hazard: formData.hazard,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), itemData);
      } else {
        itemData.createdAt = serverTimestamp();
        // Generate a clean ID (e.g., "Hydrochloric Acid" -> "hydrochloric_acid")
        const customId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
        await setDoc(doc(db, 'inventory', customId), itemData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'inventory', itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── FILTERING ENGINE ───
  const processedInventory = useMemo(() => {
    return inventory.filter(item => {
      const safeName = (item.name || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = safeName.includes(query);
      const matchesCategory = filterCategory === 'All' || (item.category || 'Chemical') === filterCategory;
      const matchesHazard = filterHazard === 'All' || (item.hazard || 'None') === filterHazard;
      
      return matchesSearch && matchesCategory && matchesHazard;
    });
  }, [inventory, searchQuery, filterCategory, filterHazard]);

  // ─── UI HELPERS ───
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Chemical': return <Droplets size={16} className="text-blue-400" />;
      case 'Glassware': return <Beaker size={16} className="text-emerald-400" />;
      case 'Equipment': return <Thermometer size={16} className="text-purple-400" />;
      case 'Safety': return <ShieldAlert size={16} className="text-amber-400" />;
      default: return <Archive size={16} className="text-slate-400" />;
    }
  };

  const getHazardBadge = (hazard) => {
    switch (hazard) {
      case 'Flammable':
        return <span className="flex items-center text-xs font-bold w-fit px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20"><Flame size={12} className="mr-1.5"/> Flammable</span>;
      case 'Toxic':
        return <span className="flex items-center text-xs font-bold w-fit px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20"><Skull size={12} className="mr-1.5"/> Toxic</span>;
      case 'Corrosive':
        return <span className="flex items-center text-xs font-bold w-fit px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><AlertTriangle size={12} className="mr-1.5"/> Corrosive</span>;
      default:
        return <span className="flex items-center text-xs font-bold w-fit px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">None</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative">
      
      {/* ─── CREATE / EDIT MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-100 flex items-center">
                {editingItem ? <Edit2 className="mr-2 text-blue-400" size={20} /> : <Plus className="mr-2 text-emerald-400" size={20} />}
                {editingItem ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto form-scrollbar space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Hydrochloric Acid, 500mL Beaker"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
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
                    <option value="Chemical">Chemical</option>
                    <option value="Glassware">Glassware</option>
                    <option value="Equipment">Equipment / Tools</option>
                    <option value="Safety">Safety Gear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hazard Level</label>
                  <select 
                    value={formData.hazard} 
                    onChange={(e) => setFormData({...formData, hazard: e.target.value})}
                    disabled={formData.category !== 'Chemical'}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="None">None / Safe</option>
                    <option value="Flammable">Flammable</option>
                    <option value="Toxic">Toxic</option>
                    <option value="Corrosive">Corrosive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details (Formula, Vol, Specs)</label>
                <input 
                  type="text" 
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="e.g. HCl (1M), Borosilicate Glass"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                />
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
                  {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOM DANGER MODAL (DELETE) ─── */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Delete Asset?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to permanently delete <strong className="text-slate-200">"{itemToDelete.name}"</strong>? This will remove it from the global inventory.
              </p>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
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
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Global Inventory</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage the virtual catalog of lab equipment and chemicals.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add Asset
        </button>
      </div>

      {/* ─── CONTROL BAR ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by name or formula..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium" 
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${
            showFilters 
            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-900/20' 
            : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
          }`}
        >
          <Filter size={20} className="mr-2" /> 
          Filters
        </button>
      </div>

      {/* ─── EXPANDABLE FILTER PANEL ─── */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[200px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Catalog</h3>
            <button onClick={() => {setFilterCategory('All'); setFilterHazard('All');}} className="text-sm text-rose-400 hover:text-rose-300 flex items-center font-medium transition-colors">
              <X size={16} className="mr-1" /> Clear
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2">Category</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-200"
              >
                <option value="All">All Categories</option>
                <option value="Chemical">Chemicals</option>
                <option value="Glassware">Glassware</option>
                <option value="Equipment">Equipment</option>
                <option value="Safety">Safety Gear</option>
              </select>
            </div>
            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2">Hazard Level</label>
              <select 
                value={filterHazard} 
                onChange={(e) => setFilterHazard(e.target.value)}
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-200"
              >
                <option value="All">All Hazards</option>
                <option value="None">Safe / None</option>
                <option value="Flammable">Flammable</option>
                <option value="Toxic">Toxic</option>
                <option value="Corrosive">Corrosive</option>
              </select>
            </div>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hazard</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedInventory.length > 0 ? (
                processedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mr-4 shrink-0 border border-slate-700 shadow-inner">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.category} • {item.details || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getHazardBadge(item.hazard)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {item.updatedAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setItemToDelete(item);
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
                  <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                    <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                      <Archive size={32} className="text-slate-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">Inventory is empty</p>
                    <p className="text-sm mt-1 mb-4">Start cataloging your virtual assets.</p>
                    <button 
                      onClick={openCreateModal}
                      className="text-blue-400 font-bold hover:underline flex items-center justify-center mx-auto"
                    >
                      <Plus size={16} className="mr-1"/> Add your first item
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

export default GlobalInventory;