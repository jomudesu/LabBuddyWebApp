import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, X, Shield, User, GraduationCap, Edit2, Trash2, 
  LayoutGrid, Users, CalendarDays, Clock, CheckCircle, AlertCircle, 
  AlertTriangle, Plus, UserPlus, Unlock, Lock, ArrowDownAZ, Activity
} from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase'; 
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuth } from '../../backend/Firebase/AuthContext'; 

const ManageAccounts = () => {
  const { currentUser } = useAuth(); 
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ─── FILTER STATES ───
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ role: 'All', section: 'All', status: 'All', sortBy: 'default' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── FORM STATES ───
  const [formData, setFormData] = useState({ email: '', password: '', displayName: '', role: 'student', section: '', handledSections: [] });
  const [sectionInput, setSectionInput] = useState('');

  // ─── FETCH SUPABASE USERS ───
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─── CREATE ACCOUNT LOGIC ───
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    let secondaryApp;
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      if (!getApps().length) { secondaryApp = initializeApp(firebaseConfig, "SecondaryApp"); } 
      else {
        try { secondaryApp = getApp("SecondaryApp"); } 
        catch (err) { secondaryApp = initializeApp(firebaseConfig, "SecondaryApp"); }
      }

      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newFirebaseUser = userCredential.user;

      await firebaseSignOut(secondaryAuth);

      const { error: dbError } = await supabase.from('users').insert([{
        id: newFirebaseUser.uid,
        email: formData.email,
        display_name: formData.displayName,
        role: formData.role,
        section: formData.role === 'student' ? formData.section : null,
        handled_sections: formData.role === 'instructor' ? formData.handledSections : null,
        status: 'active'
      }]);

      if (dbError) throw dbError;

      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert("Error creating account: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── EDIT ACCOUNT LOGIC ───
  const handleEditAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('users').update({
        display_name: formData.displayName,
        role: formData.role,
        section: formData.role === 'student' ? formData.section : null,
        handled_sections: formData.role === 'instructor' ? formData.handledSections : null,
        status: formData.status
      }).eq('id', editingUser.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert("Error updating account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDevice = async (userId) => {
    if (!window.confirm("Are you sure you want to reset this user's authorized device? They will need to verify via email on their next login.")) return;
    try {
      const { error } = await supabase.from('users').update({
        authorized_device_id: null,
        device_verified: false
      }).eq('id', userId);
      if (error) throw error;
      alert("Device restrictions reset successfully.");
      fetchUsers();
    } catch (error) {
      alert("Error resetting device.");
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    await supabase.from('users').delete().eq('id', userToDelete.id);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setIsDeleting(false);
    fetchUsers();
  };

  const openCreateModal = () => { 
    setFormData({ email: '', password: '', displayName: '', role: 'student', section: '', handledSections: [] }); 
    setSectionInput('');
    setIsCreateModalOpen(true); 
  };
  
  const openEditModal = (user) => { 
    setEditingUser(user); 
    setFormData({ email: user.email, displayName: user.display_name, role: user.role, section: user.section || '', handledSections: user.handled_sections || [], status: user.status || 'active' }); 
    setSectionInput('');
    setIsEditModalOpen(true); 
  };

  // ─── FILTER LOGIC ───
  const sections = useMemo(() => {
    const s = new Set();
    users.forEach(u => {
      if (u.section) s.add(u.section);
      if (u.handled_sections) u.handled_sections.forEach(hs => s.add(hs));
    });
    return ['All', ...Array.from(s)].sort();
  }, [users]);

  const processedUsers = useMemo(() => {
    let result = users.filter(user => {
      const matchesSearch = (user.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filters.role === 'All' || user.role === filters.role;
      const matchesStatus = filters.status === 'All' || (user.status || 'active') === filters.status;
      
      let matchesSection = filters.section === 'All';
      if (filters.section !== 'All') {
        if (user.role === 'student') matchesSection = user.section === filters.section;
        if (user.role === 'instructor') matchesSection = (user.handled_sections || []).includes(filters.section);
      }
      return matchesSearch && matchesRole && matchesSection && matchesStatus;
    });

    if (filters.sortBy === 'a-z') result.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''));
    else if (filters.sortBy === 'z-a') result.sort((a, b) => (b.display_name || '').localeCompare(a.display_name || ''));
    else if (filters.sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // default newest

    return result;
  }, [users, searchQuery, filters]);

  const activeFilterCount = (filters.role !== 'All' ? 1 : 0) + (filters.section !== 'All' ? 1 : 0) + (filters.status !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({ role: 'All', section: 'All', status: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  const addHandledSection = () => {
    if (sectionInput.trim() && !formData.handledSections.includes(sectionInput.trim())) {
      setFormData({ ...formData, handledSections: [...formData.handledSections, sectionInput.trim()] });
      setSectionInput('');
    }
  };

  const removeHandledSection = (sec) => {
    setFormData({ ...formData, handledSections: formData.handledSections.filter(s => s !== sec) });
  };

  // Dark Mode Badges
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'super_admin': return <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md uppercase tracking-wider"><Shield size={12} className="mr-1"/> Super Admin</span>;
      case 'instructor': return <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md uppercase tracking-wider"><GraduationCap size={12} className="mr-1"/> Instructor</span>;
      case 'admin': return <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md uppercase tracking-wider"><Shield size={12} className="mr-1"/> Admin</span>;
      default: return <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md uppercase tracking-wider"><User size={12} className="mr-1"/> Student</span>;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'suspended') return <span className="flex items-center text-xs font-bold text-rose-400 uppercase"><AlertCircle size={14} className="mr-1"/> Suspended</span>;
    return <span className="flex items-center text-xs font-bold text-emerald-400 uppercase"><CheckCircle size={14} className="mr-1"/> Active</span>;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative animate-fade-in">
      
      {/* ─── CREATE ACCOUNT MODAL (Dark Mode) ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-100 flex items-center"><UserPlus className="mr-2 text-emerald-400" size={20} /> Create New Account</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateAccount} className="p-6 overflow-y-auto max-h-[75vh] space-y-5 form-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label><input required type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500"><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option>{currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}</select></div>
              </div>

              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label><input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporary Password</label><input required type="password" minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" placeholder="Minimum 6 characters" /></div>

              {formData.role === 'student' && (
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enrolled Section</label><input required type="text" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" placeholder="e.g. BSCS-3A" /></div>
              )}

              {formData.role === 'instructor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Handled Sections</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={sectionInput} onChange={(e) => setSectionInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHandledSection())} className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" placeholder="Add a section..." />
                    <button type="button" onClick={addHandledSection} className="px-4 bg-blue-600/20 text-blue-400 font-bold rounded-xl border border-blue-600/30 hover:bg-blue-600/30 transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.handledSections.map(sec => (
                      <span key={sec} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm flex items-center gap-2">
                        {sec} <button type="button" onClick={() => removeHandledSection(sec)} className="text-purple-400 hover:text-purple-300"><X size={14}/></button>
                      </span>
                    ))}
                    {formData.handledSections.length === 0 && <span className="text-xs text-slate-500 italic">No sections added yet.</span>}
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50">{isSaving ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT ACCOUNT MODAL (Dark Mode) ─── */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-100 flex items-center"><Edit2 className="mr-2 text-blue-400" size={20} /> Edit Account</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleEditAccount} className="p-6 overflow-y-auto max-h-[75vh] space-y-5 form-scrollbar">
              
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-3 opacity-70">
                <Mail size={16} className="text-slate-400 ml-1"/> <span className="text-sm font-medium text-slate-300">{formData.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label><input required type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" /></div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                  <select disabled={editingUser.id === currentUser?.id} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500 disabled:opacity-50">
                    <option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option>{currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>
              </div>

              {formData.role === 'student' && (
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enrolled Section</label><input required type="text" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" /></div>
              )}

              {formData.role === 'instructor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Handled Sections</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={sectionInput} onChange={(e) => setSectionInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHandledSection())} className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-blue-500" placeholder="Add a section..." />
                    <button type="button" onClick={addHandledSection} className="px-4 bg-blue-600/20 text-blue-400 font-bold rounded-xl border border-blue-600/30 hover:bg-blue-600/30 transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.handledSections.map(sec => (
                      <span key={sec} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm flex items-center gap-2">
                        {sec} <button type="button" onClick={() => removeHandledSection(sec)} className="text-purple-400 hover:text-purple-300"><X size={14}/></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Status</label>
                <div className="flex gap-4">
                  <label className="flex-1 relative">
                    <input disabled={editingUser.id === currentUser?.id} type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={() => setFormData({...formData, status: 'active'})} className="peer sr-only"/>
                    <div className="p-3 text-center border border-slate-700 bg-slate-800 rounded-xl cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 font-bold transition-all text-sm text-slate-400 peer-disabled:opacity-50">Active</div>
                  </label>
                  <label className="flex-1 relative">
                    <input disabled={editingUser.id === currentUser?.id} type="radio" name="status" value="suspended" checked={formData.status === 'suspended'} onChange={() => setFormData({...formData, status: 'suspended'})} className="peer sr-only"/>
                    <div className="p-3 text-center border border-slate-700 bg-slate-800 rounded-xl cursor-pointer peer-checked:border-rose-500 peer-checked:bg-rose-500/10 peer-checked:text-rose-400 font-bold transition-all text-sm text-slate-400 peer-disabled:opacity-50">Suspended</div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL (Dark Mode) ─── */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Delete Account?</h2>
              <p className="text-slate-400 text-sm mb-6">Are you sure you want to permanently delete the account for <strong className="text-slate-200">"{userToDelete.display_name}"</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 transition-all disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center">
            <Users className="mr-3 text-blue-500" size={32} /> User Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage student and instructor accounts.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all">
          <UserPlus size={18} className="mr-2" /> New Account
        </button>
      </div>

      {/* ─── SEARCH & FILTER TOGGLE ROW (Dark Mode) ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 outline-none focus:border-blue-500 transition-all shadow-sm" 
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

      {/* ─── EXPANDABLE FILTERS PANEL (Dark Mode) ─── */}
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
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><User size={16} className="text-blue-400"/> Role</label>
              <select 
                value={filters.role} 
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admins</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><LayoutGrid size={16} className="text-blue-400"/> Section</label>
              <select 
                value={filters.section} 
                onChange={(e) => setFilters({...filters, section: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-300"
              >
                {sections.map(sec => <option key={sec} value={sec}>{sec === 'All' ? 'All Sections' : `Section: ${sec}`}</option>)}
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
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
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

      {/* ─── DATA TABLE (Dark Mode) ─── */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0 relative">
        {loading && <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>}
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead className="sticky top-0 z-10 bg-slate-900/95 border-b border-slate-700/50 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Section(s)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedUsers.length > 0 ? processedUsers.map((user) => {
                const isMyAccount = currentUser?.id === user.id;

                return (
                <tr key={user.id} className={`transition-colors group ${isMyAccount ? 'bg-blue-900/10' : 'hover:bg-slate-800/80'}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        {user.display_name} 
                        {isMyAccount && <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded uppercase tracking-wider">You</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    {user.role === 'student' ? (
                      <span className="text-sm font-medium text-slate-300">{user.section || '-'}</span>
                    ) : user.role === 'instructor' ? (
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {(user.handled_sections || []).length > 0 ? (
                           user.handled_sections.map(s => <span key={s} className="px-1.5 py-0.5 bg-slate-700 border border-slate-600 text-slate-300 text-[10px] rounded">{s}</span>)
                        ) : <span className="text-slate-500 text-sm">-</span>}
                      </div>
                    ) : <span className="text-slate-500 text-sm">-</span>}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-400">
                    <div className="flex items-center"><CalendarDays size={14} className="mr-1.5 opacity-70"/> {new Date(user.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(() => {
                      const isSuperAdmin = currentUser?.role === 'super_admin';
                      const isAdmin = currentUser?.role === 'admin';
                      const isTargetSuperAdmin = user.role === 'super_admin';
                      // Super Admin: can act on everyone. Admin: blocked from super_admin rows.
                      const canAct = isSuperAdmin || (isAdmin && !isTargetSuperAdmin);

                      return canAct ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 size={18} /></button>
                          <button 
                            onClick={() => handleResetDevice(user.id)} 
                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Reset Authorized Devices"
                          >
                            <Unlock size={18} />
                          </button>
                          {currentUser?.id !== user.id && (
                            <button onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex justify-end items-center opacity-50">
                          <Lock size={12} className="mr-1.5"/> Restricted
                        </span>
                      );
                    })()}
                  </td>
                </tr>
                )
              }) : !loading && (
                <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-500"><div className="bg-slate-800/50 border border-slate-700/50 w-20 h-20 rounded-full flex mx-auto mb-4 items-center justify-center"><User size={32} className="text-slate-500" /></div><p className="text-lg font-bold text-slate-400">No accounts found</p><button onClick={handleClearFilters} className="mt-4 text-blue-400 font-bold hover:underline">Reset Filters</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simple Mock component to avoid breaking layout if Lucide icon is missing
const Mail = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

export default ManageAccounts;