import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X,
  Shield, 
  User, 
  GraduationCap, 
  Edit2, 
  Trash2, 
  MoreVertical,
  LayoutGrid,
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle 
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase'; 

const ManageAccounts = () => {
  // ─── STATE MANAGEMENT ───
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'All',
    section: 'All',
    status: 'All',
    sortBy: 'default'
  });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── REAL-TIME FIREBASE CONNECTION ───
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const formatDate = (timestamp) => {
          if (!timestamp) return 'Never';
          return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          });
        };

        fetchedUsers.push({
          id: doc.id,
          ...data,
          createdAtRaw: data.createdAt?.toDate() || new Date(0), 
          createdAt: formatDate(data.createdAt),
          lastLogin: formatDate(data.lastLogin)
        });
      });

      setUsers(fetchedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── ACTIONS LOGIC ───

  const handleApprove = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: 'active' });
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', editingUser.id);
      
      // Base payload
      let updatePayload = {
        displayName: (editingUser.displayName || '').trim(),
        role: editingUser.role,
        status: editingUser.status || 'active'
      };

      // ✨ NEW: Handle Sections dynamically based on role
      if (editingUser.role === 'student') {
        updatePayload.section = (editingUser.section || '').toUpperCase() || '-';
      } else if (editingUser.role === 'instructor') {
        const rawSections = editingUser.handledSections || '';
        updatePayload.handledSections = Array.isArray(rawSections) 
          ? rawSections 
          : rawSections.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
      }

      await updateDoc(userRef, updatePayload);
      
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── DYNAMIC DATA EXTRACTION ───
  const sections = useMemo(() => {
    const allSections = users
      .filter(u => u.role === 'student' && u.section && u.section !== '-')
      .map(u => u.section);
    return ['All', ...new Set(allSections)];
  }, [users]);

  // ─── FILTERING & SORTING ENGINE ───
  const processedUsers = useMemo(() => {
    let result = users.filter(user => {
      const safeName = (user.displayName || '').toLowerCase();
      const safeEmail = (user.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = safeName.includes(query) || safeEmail.includes(query);
      const matchesRole = filters.role === 'All' || user.role === filters.role.toLowerCase();
      const matchesSection = filters.section === 'All' || user.section === filters.section;
      const matchesStatus = filters.status === 'All' || (user.status || 'active') === filters.status.toLowerCase();
      
      return matchesSearch && matchesRole && matchesSection && matchesStatus;
    });

    if (filters.sortBy === 'a-z') {
      result.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    } else if (filters.sortBy === 'z-a') {
      result.sort((a, b) => (b.displayName || '').localeCompare(a.displayName || ''));
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => b.createdAtRaw - a.createdAtRaw);
    } else if (filters.sortBy === 'oldest') {
      result.sort((a, b) => a.createdAtRaw - b.createdAtRaw);
    }

    return result;
  }, [users, searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters({ role: 'All', section: 'All', status: 'All', sortBy: 'default' });
    setSearchQuery('');
  };

  const activeFilterCount = (filters.role !== 'All' ? 1 : 0) + (filters.section !== 'All' ? 1 : 0) + (filters.status !== 'All' ? 1 : 0) + (filters.sortBy !== 'default' ? 1 : 0);

  // ─── UI HELPERS ───
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-wider">
            <Shield size={12} className="mr-1.5" /> ADMIN
          </span>
        );
      case 'instructor':
        return (
          <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase tracking-wider">
            <GraduationCap size={12} className="mr-1.5" /> INSTRUCTOR
          </span>
        );
      case 'student':
        return (
          <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
            <User size={12} className="mr-1.5" /> STUDENT
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wider">
            <Clock size={12} className="mr-1.5" /> PENDING
          </span>
        );
      case 'disabled':
        return (
          <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase tracking-wider">
            <AlertCircle size={12} className="mr-1.5" /> DISABLED
          </span>
        );
      default: // active
        return (
          <span className="flex items-center w-fit px-2.5 py-1 rounded-md border text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
            <CheckCircle size={12} className="mr-1.5" /> ACTIVE
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative">
      
      {/* ─── EDIT USER MODAL ─── */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100 flex items-center">
                <Edit2 className="mr-2 text-blue-400" size={20} /> Edit Account
              </h2>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto form-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={editingUser.displayName || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  placeholder="Enter display name"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                />
                <p className="text-[10px] text-slate-500 mt-1">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* ✨ NEW: Conditionally render input based on role */}
              {editingUser.role === 'student' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Section</label>
                  <input 
                    type="text" 
                    value={editingUser.section}
                    onChange={(e) => setEditingUser({...editingUser, section: e.target.value})}
                    placeholder="e.g. BSXX-XX"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium uppercase"
                  />
                </div>
              )}

              {editingUser.role === 'instructor' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Sections</label>
                  <input 
                    type="text" 
                    value={Array.isArray(editingUser.handledSections) ? editingUser.handledSections.join(', ') : (editingUser.handledSections || '')}
                    onChange={(e) => setEditingUser({...editingUser, handledSections: e.target.value})}
                    placeholder="e.g. BSCS-1A, BSIT-2B"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-200 transition-all font-medium uppercase"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Separate multiple sections with commas.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Status</label>
                <select 
                  value={editingUser.status || 'active'} 
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all font-medium"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="pending">Pending (Awaiting Approval)</option>
                  <option value="disabled">Disabled (Revoked Access)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOM DANGER MODAL (DELETE) ─── */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.15)] overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Revoke Access?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to permanently delete <strong className="text-slate-200">{userToDelete.displayName}</strong>'s account? This action will remove their database record and cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Manage Accounts</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">View, filter, and manage platform access roles.</p>
        </div>

      </div>

      {/* ─── CONTROL BAR ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium" 
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${
            showFilters || activeFilterCount > 0 
            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-900/20' 
            : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
          }`}
        >
          <Filter size={20} className="mr-2" /> 
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-3 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── EXPANDABLE FILTER PANEL ─── */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Refine Directory</h3>
            {activeFilterCount > 0 && (
              <button onClick={handleClearFilters} className="text-sm text-rose-400 hover:text-rose-300 flex items-center font-medium transition-colors">
                <X size={16} className="mr-1" /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><LayoutGrid size={16} className="text-blue-400"/> Role</label>
              <select 
                value={filters.role} 
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-200"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Instructor">Instructor</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><Shield size={16} className="text-blue-400"/> Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><Users size={16} className="text-blue-400"/> Class Section</label>
              <select 
                value={filters.section} 
                onChange={(e) => setFilters({...filters, section: e.target.value})}
                disabled={filters.role === 'Admin' || filters.role === 'Instructor'}
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-slate-300 mb-2 items-center gap-2"><CalendarDays size={16} className="text-blue-400"/> Sort By</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-200"
              >
                <option value="default">Default Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Name (A - Z)</option>
                <option value="z-a">Name (Z - A)</option>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Section / Handled</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {processedUsers.length > 0 ? (
                processedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 font-bold mr-4 shrink-0 border border-slate-600 shadow-sm">
                          {(user.displayName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{user.displayName || 'Unknown User'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status || 'active')}
                    </td>

                    {/* ✨ NEW: Conditionally render Student Section or Instructor Handled Sections */}
                    <td className="px-6 py-4">
                      {user.role === 'instructor' ? (
                        <span className="text-sm font-medium text-purple-400">
                          {user.handledSections && user.handledSections.length > 0 
                            ? user.handledSections.join(', ') 
                            : 'Unassigned'}
                        </span>
                      ) : (
                        <span className={`text-sm font-medium ${!user.section || user.section === '-' ? 'text-slate-600' : 'text-slate-300'}`}>
                          {user.section || '-'}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {user.status === 'pending' && (
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/30" 
                            title="Approve Account"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" 
                          title="Revoke Access"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                    <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                      <User size={32} className="text-slate-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">No accounts found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter parameters.</p>
                    <button onClick={handleClearFilters} className="mt-4 text-blue-400 font-bold hover:underline">
                      Reset Filters
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

export default ManageAccounts;