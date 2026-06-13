import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, X, Shield, User, GraduationCap, Edit2, Trash2, 
  LayoutGrid, Users, CalendarDays, Clock, CheckCircle, AlertCircle, 
  AlertTriangle, Plus, UserPlus, Unlock, Lock
} from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase'; 
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuth } from '../../backend/Firebase/AuthContext'; 

const ManageAccounts = () => {
  const { currentUser } = useAuth(); 
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [userToUnlock, setUserToUnlock] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    email: '', password: '', displayName: '', role: 'student', section: '', handledSections: '', status: 'active'
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      const mappedUsers = data.map(u => ({
        id: u.id,
        displayName: u.display_name,
        email: u.email,
        role: u.role,
        section: u.section,
        handledSections: u.handled_sections || [],
        status: u.status,
        createdAtRaw: u.created_at ? new Date(u.created_at) : new Date(0),
        createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Never',
        lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      let secondaryApp;
      if (!getApps().length || !getApps().find(app => app.name === 'SecondaryApp')) {
        secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      } else {
        secondaryApp = getApp('SecondaryApp');
      }

      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, createFormData.email, createFormData.password);
      const newUid = userCredential.user.uid;

      await firebaseSignOut(secondaryAuth);

      let payload = {
        id: newUid,
        display_name: createFormData.displayName.trim(),
        email: createFormData.email.trim(),
        role: createFormData.role,
        status: createFormData.status,
        has_accepted_dpa: false,
        requires_password_change: true 
      };

      if (createFormData.role === 'student') {
        payload.section = (createFormData.section || '').toUpperCase() || '-';
      } else if (createFormData.role === 'instructor') {
        const rawSections = createFormData.handledSections || '';
        payload.handled_sections = Array.isArray(rawSections) ? rawSections : rawSections.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
      }

      const { error } = await supabase.from('users').insert([payload]);
      if (error) throw error;

      setIsCreateModalOpen(false);
      setCreateFormData({ email: '', password: '', displayName: '', role: 'student', section: '', handledSections: '', status: 'active' });
      fetchUsers();

    } catch (error) {
      console.error("Creation Error:", error);
      alert("Failed to create user. " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (userId) => {
    await supabase.from('users').update({ status: 'active' }).eq('id', userId);
    fetchUsers();
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

  const confirmUnlock = async () => {
    if (!userToUnlock) return;
    setIsUnlocking(true);
    try {
      await supabase.from('users').update({ known_devices: [] }).eq('id', userToUnlock.id);
      setIsUnlockModalOpen(false);
      setUserToUnlock(null);
      fetchUsers();
    } catch (error) {
      alert("Failed to reset devices.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let updatePayload = {
        display_name: (editingUser.displayName || '').trim(),
        role: editingUser.role,
        status: editingUser.status || 'active'
      };

      if (editingUser.role === 'student') {
        updatePayload.section = (editingUser.section || '').toUpperCase() || '-';
        updatePayload.handled_sections = null;
      } else if (editingUser.role === 'instructor') {
        const rawSections = editingUser.handledSections || '';
        updatePayload.handled_sections = Array.isArray(rawSections) ? rawSections : rawSections.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
        updatePayload.section = null;
      }

      await supabase.from('users').update(updatePayload).eq('id', editingUser.id);
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert("Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  // Combine Student Sections and Instructor Handled Sections into one dropdown list
  const sections = useMemo(() => {
    const studentSections = users.filter(u => u.role === 'student' && u.section && u.section !== '-').map(u => u.section);
    const instructorSections = users.filter(u => u.role === 'instructor' && Array.isArray(u.handledSections)).flatMap(u => u.handledSections);
    return ['All', ...new Set([...studentSections, ...instructorSections])].sort();
  }, [users]);

  const processedUsers = useMemo(() => {
    let result = users.filter(user => {
      const safeName = (user.displayName || '').toLowerCase();
      const safeEmail = (user.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = safeName.includes(query) || safeEmail.includes(query);
      const matchesRole = filters.role === 'All' || user.role === filters.role.toLowerCase();
      
      // Check BOTH student.section AND instructor.handledSections during the filter
      const matchesSection = filters.section === 'All' || 
                             user.section === filters.section || 
                             (Array.isArray(user.handledSections) && user.handledSections.includes(filters.section));
                             
      const matchesStatus = filters.status === 'All' || (user.status || 'active') === filters.status.toLowerCase();
      
      return matchesSearch && matchesRole && matchesSection && matchesStatus;
    });

    if (filters.sortBy === 'a-z') result.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    else if (filters.sortBy === 'z-a') result.sort((a, b) => (b.displayName || '').localeCompare(a.displayName || ''));
    else if (filters.sortBy === 'newest') result.sort((a, b) => b.createdAtRaw - a.createdAtRaw);
    else if (filters.sortBy === 'oldest') result.sort((a, b) => a.createdAtRaw - b.createdAtRaw);

    return result;
  }, [users, searchQuery, filters]);

  const handleClearFilters = () => { setFilters({ role: 'All', section: 'All', status: 'All', sortBy: 'default' }); setSearchQuery(''); };
  const activeFilterCount = (filters.role !== 'All' ? 1 : 0) + (filters.section !== 'All' ? 1 : 0) + (filters.status !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wider"><Shield size={12} className="mr-1.5" /> SUPER ADMIN</span>;
      case 'admin': return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-wider"><Shield size={12} className="mr-1.5" /> ADMIN</span>;
      case 'instructor': return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase tracking-wider"><GraduationCap size={12} className="mr-1.5" /> INSTRUCTOR</span>;
      case 'student': return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider"><User size={12} className="mr-1.5" /> STUDENT</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wider"><Clock size={12} className="mr-1.5" /> PENDING</span>;
      case 'disabled': return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase tracking-wider"><AlertCircle size={12} className="mr-1.5" /> DISABLED</span>;
      default: return <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider"><CheckCircle size={12} className="mr-1.5" /> ACTIVE</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative">
      
      {/* ─── MODALS ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100 flex items-center"><UserPlus className="mr-2 text-emerald-400" size={20} /> Register New Account</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto form-scrollbar">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label><input required type="email" value={createFormData.email} onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })} placeholder="name@earist.edu" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200" /></div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporary Password</label>
                <input required type="password" minLength="6" value={createFormData.password} onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })} placeholder="Min. 6 characters" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200" />
                <p className="text-[10px] text-amber-500 mt-1 font-medium">User will be forced to change this password on their first login.</p>
              </div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label><input required type="text" value={createFormData.displayName} onChange={(e) => setCreateFormData({ ...createFormData, displayName: e.target.value })} placeholder="Full Name" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200" /></div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <select value={createFormData.role} onChange={(e) => setCreateFormData({...createFormData, role: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  {currentUser?.role === 'super_admin' && <option value="admin">System Admin</option>}
                  {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
              {createFormData.role === 'student' && (<div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Section</label><input type="text" value={createFormData.section} onChange={(e) => setCreateFormData({...createFormData, section: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 uppercase" placeholder="e.g. BSCHe-XX"/></div>)}
              {createFormData.role === 'instructor' && (<div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Sections</label><input type="text" value={createFormData.handledSections} onChange={(e) => setCreateFormData({...createFormData, handledSections: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-200 uppercase" placeholder="e.g. BSCHe-XX, BSCHe-XX"/><p className="text-[10px] text-slate-500 mt-1">Separate with commas.</p></div>)}
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Status</label><select value={createFormData.status} onChange={(e) => setCreateFormData({...createFormData, status: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"><option value="active">Active</option><option value="pending">Pending</option></select></div>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">{isSaving ? 'Creating...' : 'Create User'}</button></div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100 flex items-center"><Edit2 className="mr-2 text-blue-400" size={20} /> Edit Account</h2>
              <button onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="text-slate-400 hover:text-slate-200"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto form-scrollbar">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label><input type="text" value={editingUser.displayName || ''} onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200" /><p className="text-[10px] text-slate-500 mt-1">{editingUser.email}</p></div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  {currentUser?.role === 'super_admin' && <option value="admin">System Admin</option>}
                  {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
              {editingUser.role === 'student' && (<div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Section</label><input type="text" value={editingUser.section} onChange={(e) => setEditingUser({...editingUser, section: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 uppercase" /></div>)}
              {editingUser.role === 'instructor' && (<div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Sections</label><input type="text" value={Array.isArray(editingUser.handledSections) ? editingUser.handledSections.join(', ') : (editingUser.handledSections || '')} onChange={(e) => setEditingUser({...editingUser, handledSections: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-200 uppercase" /><p className="text-[10px] text-slate-500 mt-1">Separate multiple sections with commas.</p></div>)}
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Status</label><select value={editingUser.status || 'active'} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"><option value="active">Active (Full Access)</option><option value="pending">Pending (Awaiting Approval)</option><option value="disabled">Disabled (Revoked Access)</option></select></div>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* UNLOCK DEVICES MODAL */}
      {isUnlockModalOpen && userToUnlock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-orange-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.15)] overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                <Unlock className="text-orange-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Reset Devices?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Allow <strong className="text-slate-200">{userToUnlock.displayName}</strong> to log in from new computers? This will clear their saved device history.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsUnlockModalOpen(false); setUserToUnlock(null); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors">Cancel</button>
                <button onClick={confirmUnlock} disabled={isUnlocking} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 transition-colors">
                  {isUnlocking ? 'Resetting...' : 'Reset Devices'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center"><div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20"><AlertTriangle className="text-rose-500" size={32} /></div><h2 className="text-xl font-bold text-slate-100 mb-2">Revoke Access?</h2><p className="text-slate-400 text-sm mb-6">Are you sure you want to permanently delete <strong className="text-slate-200">{userToDelete.displayName}</strong>'s account?</p>
              <div className="flex gap-3"><button type="button" onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700">Cancel</button><button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Account'}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN UI ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Manage Accounts</h1><p className="text-sm text-slate-400 mt-1 font-medium">View, filter, and manage platform access roles.</p></div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Add Account
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-6 py-3.5 rounded-xl font-bold border ${showFilters || activeFilterCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800/50 text-slate-300 border-slate-700/50'}`}><Filter size={20} className="mr-2" /> Filters {activeFilterCount > 0 && <span className="ml-3 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">{activeFilterCount}</span>}</button>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50"><div className="flex justify-between items-center mb-5"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Refine Directory</h3>{activeFilterCount > 0 && <button onClick={handleClearFilters} className="text-sm text-rose-400 flex items-center font-medium"><X size={16} className="mr-1" /> Clear All</button>}</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><LayoutGrid size={16} className="text-blue-400"/> Role</label>
              <select value={filters.role} onChange={(e) => setFilters({...filters, role: e.target.value})} className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-200">
                <option value="All">All Roles</option>
                {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                <option value="admin">System Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div><label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><Shield size={16} className="text-blue-400"/> Status</label><select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-200"><option value="All">All Statuses</option><option value="Active">Active</option><option value="Pending">Pending</option><option value="Disabled">Disabled</option></select></div>
            
            {/* Dynamic disabling based on selected role */}
            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><Users size={16} className="text-blue-400"/> Class Section</label>
              <select 
                value={filters.section} 
                onChange={(e) => setFilters({...filters, section: e.target.value})} 
                disabled={['admin', 'super_admin'].includes(filters.role)} 
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 disabled:opacity-50"
              >
                {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>

            <div><label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><CalendarDays size={16} className="text-blue-400"/> Sort By</label><select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200"><option value="default">Default Order</option><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="a-z">Name (A - Z)</option><option value="z-a">Name (Z - A)</option></select></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0 relative">
        {loading && <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-900/95">
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">User</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Section / Handled</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Joined</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Last Login</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedUsers.length > 0 ? processedUsers.map((user) => {
                
                const isTargetAdmin = ['admin', 'super_admin'].includes(user.role);
                const canManage = currentUser?.role === 'super_admin' || !isTargetAdmin;

                return (
                <tr key={user.id} className="hover:bg-slate-800/80 group">
                  <td className="px-6 py-4"><div className="flex items-center"><div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 font-bold mr-4 shrink-0">{(user.displayName || 'U').charAt(0).toUpperCase()}</div><div><div className="font-bold text-slate-200">{user.displayName || 'Unknown User'}</div><div className="text-xs text-slate-500 mt-0.5">{user.email}</div></div></div></td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status || 'active')}</td>
                  <td className="px-6 py-4">{user.role === 'instructor' ? <span className="text-sm font-medium text-purple-400">{user.handledSections && user.handledSections.length > 0 ? user.handledSections.join(', ') : 'Unassigned'}</span> : <span className={`text-sm font-medium ${!user.section || user.section === '-' ? 'text-slate-600' : 'text-slate-300'}`}>{user.section || '-'}</span>}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium">{user.createdAt}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    
                    {canManage ? (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.status === 'pending' && <button onClick={() => handleApprove(user.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><CheckCircle size={18} /></button>}
                        
                        <button onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit2 size={18} /></button>
                        
                        <button 
                          onClick={() => { setUserToUnlock(user); setIsUnlockModalOpen(true); }} 
                          className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                          title="Reset Authorized Devices"
                        >
                          <Unlock size={18} />
                        </button>

                        {currentUser?.id !== user.id && (
                          <button onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 size={18} /></button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex justify-end items-center opacity-50">
                        <Lock size={12} className="mr-1.5"/> Restricted
                      </span>
                    )}

                  </td>
                </tr>
                )
              }) : !loading && (
                <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-500"><div className="bg-slate-800/50 w-20 h-20 rounded-full flex mx-auto mb-4 items-center justify-center"><User size={32} className="text-slate-600" /></div><p className="text-lg font-bold text-slate-400">No accounts found</p><button onClick={handleClearFilters} className="mt-4 text-blue-400 font-bold hover:underline">Reset Filters</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAccounts;