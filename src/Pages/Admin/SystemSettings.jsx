import React, { useState, useEffect } from 'react';
import { Settings, User, Globe, ShieldAlert, Save, Bell, Lock, AlertTriangle, FileMinus, RefreshCw, UserX, X, Info } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth, supabase } from '../../backend/Firebase/firebase'; 
import { useAuth } from '../../backend/Firebase/AuthContext';

const SystemSettings = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Added announcementBanner to the initial state
  const [profileData, setProfileData] = useState({ displayName: '', email: '' });
  const [platformData, setPlatformData] = useState({ maintenanceMode: false, allowRegistrations: true, announcementBanner: '' });
  const [originalPlatformData, setOriginalPlatformData] = useState({ maintenanceMode: false, allowRegistrations: true, announcementBanner: '' });

  const [isPlatformConfirmOpen, setIsPlatformConfirmOpen] = useState(false); 
  const [dangerModal, setDangerModal] = useState({ isOpen: false, actionType: null, title: '', expectedText: '', description: '' });
  const [confirmInput, setConfirmInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // ─── SUPABASE FETCH ───
  useEffect(() => {
    if (currentUser) {
      setProfileData({ displayName: currentUser.displayName || '', email: currentUser.email || '' });
    }

    const fetchSettings = async () => {
      const { data } = await supabase.from('system_preferences').select('*').eq('id', 'default').single();
      if (data) {
        // ✨ FIX: Ensure we fetch the banner text from the database when settings load
        const currentSettings = { 
          maintenanceMode: data.maintenance_mode, 
          allowRegistrations: data.allow_registrations,
          announcementBanner: data.announcement_banner || ''
        };
        setPlatformData(currentSettings);
        setOriginalPlatformData(currentSettings);
      }
    };
    fetchSettings();
  }, [currentUser]);

  // ─── SAVE ACTIONS ───
  const showToast = (msg) => { setSaveMessage(msg); setTimeout(() => setSaveMessage(''), 3000); };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: profileData.displayName });
      if (currentUser?.uid) await supabase.from('users').update({ display_name: profileData.displayName }).eq('id', currentUser.uid);
      showToast('Profile updated successfully!');
    } catch (error) {
      showToast('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlatformSubmit = (e) => { e.preventDefault(); setIsPlatformConfirmOpen(true); };

  const executeSavePlatform = async () => {
    setIsPlatformConfirmOpen(false);
    setIsSaving(true);
    try {
      // If maintenance mode is OFF, erase the banner text
      const finalBannerText = platformData.maintenanceMode ? platformData.announcementBanner : '';

      await supabase.from('system_preferences').update({
        maintenance_mode: platformData.maintenanceMode,
        allow_registrations: platformData.allowRegistrations,
        announcement_banner: finalBannerText 
      }).eq('id', 'default');
      
      const updatedSettings = { ...platformData, announcementBanner: finalBannerText };
      setPlatformData(updatedSettings);
      setOriginalPlatformData(updatedSettings); 
      showToast('Platform preferences saved successfully!');
    } catch (error) {
      showToast('Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── SUPABASE DANGER ZONE ───
  const openDangerModal = (actionType, title, expectedText, description) => {
    setDangerModal({ isOpen: true, actionType, title, expectedText, description });
    setConfirmInput('');
  };

  const executeDangerAction = async () => {
    if (confirmInput !== dangerModal.expectedText) return;
    setIsExecuting(true);
    
    try {
      if (dangerModal.actionType === 'reset_progress') {
        await supabase.from('user_progress').delete().not('id', 'is', null);
      } else if (dangerModal.actionType === 'clean_drafts') {
        await supabase.from('experiments').delete().eq('status', 'draft');
      } else if (dangerModal.actionType === 'disable_students') {
        await supabase.from('users').update({ status: 'disabled' }).eq('role', 'student');
      }
      
      showToast(`${dangerModal.title} completed successfully.`);
      setDangerModal({ isOpen: false, actionType: null, title: '', expectedText: '', description: '' });
    } catch (error) {
      showToast('Action failed. Check console.');
    } finally {
      setIsExecuting(false);
    }
  };

  const CustomToggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
      <div><h4 className="text-sm font-bold text-slate-200">{label}</h4><p className="text-xs text-slate-400 mt-0.5">{description}</p></div>
      <button type="button" onClick={() => onChange(!checked)} className={`transition-colors duration-300 relative inline-flex h-6 w-11 items-center rounded-full ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full relative">
      {saveMessage && (<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up"><div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/20 flex items-center"><Bell size={18} className="mr-2" />{saveMessage}</div></div>)}

      {isPlatformConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50"><h2 className="text-lg font-bold text-slate-100 flex items-center"><Globe className="mr-2 text-blue-400" size={20} /> Confirm Changes</h2><button onClick={() => { setIsPlatformConfirmOpen(false); setPlatformData(originalPlatformData); }} className="text-slate-400 hover:text-slate-200"><X size={20} /></button></div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">You are about to apply global changes to the platform. These settings will immediately affect all active users.</p>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => { setIsPlatformConfirmOpen(false); setPlatformData(originalPlatformData); }} className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700">Cancel</button><button type="button" onClick={executeSavePlatform} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20">Confirm & Apply</button></div>
            </div>
          </div>
        </div>
      )}

      {dangerModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.15)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-rose-500/20 bg-rose-500/5"><h2 className="text-lg font-bold text-rose-400 flex items-center"><AlertTriangle className="mr-2" size={20} /> Action Required</h2><button onClick={() => setDangerModal({...dangerModal, isOpen: false})} className="text-slate-400 hover:text-slate-200"><X size={20} /></button></div>
            <div className="p-6 space-y-4"><h3 className="text-xl font-black text-slate-100">{dangerModal.title}</h3><p className="text-sm text-slate-400">{dangerModal.description}</p>
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-4"><label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Type <span className="text-white select-all bg-rose-500/30 px-1 py-0.5 rounded mx-1">{dangerModal.expectedText}</span></label><input type="text" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} placeholder={dangerModal.expectedText} className="w-full p-3 bg-slate-950 border border-rose-500/30 rounded-lg text-slate-200 font-mono text-center outline-none" /></div>
              <div className="pt-2 flex gap-3"><button type="button" onClick={() => setDangerModal({...dangerModal, isOpen: false})} className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancel</button><button type="button" onClick={executeDangerAction} disabled={confirmInput !== dangerModal.expectedText || isExecuting} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 disabled:opacity-50">{isExecuting ? 'Processing...' : 'Confirm Action'}</button></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">System Settings</h1><p className="text-sm text-slate-400 mt-1 font-medium">Manage your admin profile and global platform preferences.</p></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        <div className="lg:w-64 shrink-0">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 flex flex-col gap-1">
            {[{ id: 'profile', icon: User, label: 'Admin Profile' }, { id: 'platform', icon: Globe, label: 'Platform Preferences' }, { id: 'security', icon: ShieldAlert, label: 'Danger Zone', danger: true }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center w-full p-3 rounded-xl font-bold text-sm ${activeTab === tab.id ? (tab.danger ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20') : 'text-slate-400 hover:bg-slate-800/80'}`}>
                <tab.icon size={18} className="mr-3 shrink-0" />{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl h-full overflow-hidden">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="flex flex-col h-full animate-fade-in">
                <div className="p-6 border-b border-slate-700/50"><h2 className="text-xl font-bold text-slate-100 flex items-center"><User className="mr-2 text-blue-400" size={20} /> Personal Information</h2></div>
                <div className="p-6 flex-1 space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-700/50"><div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold text-blue-400 border-4 border-slate-800 shadow-xl">{profileData.displayName.charAt(0).toUpperCase() || 'A'}</div><div><h3 className="text-lg font-bold text-slate-200">System Administrator</h3><p className="text-sm text-slate-500">ID: {currentUser?.uid || 'Unknown'}</p></div></div>
                  <div className="max-w-md space-y-4">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Display Name</label><input type="text" required value={profileData.displayName} onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-200 outline-none" /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label><div className="relative"><input type="email" disabled value={profileData.email} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-500 outline-none cursor-not-allowed pr-10" /><Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" /></div><p className="text-[10px] text-slate-500 mt-1">Email changes require identity verification via Firebase console.</p></div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 text-right"><button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 inline-flex items-center">{isSaving ? 'Saving...' : 'Save Changes'}</button></div>
              </form>
            )}

            {activeTab === 'platform' && (
              <form onSubmit={handlePlatformSubmit} className="flex flex-col h-full animate-fade-in">
                <div className="p-6 border-b border-slate-700/50"><h2 className="text-xl font-bold text-slate-100 flex items-center"><Globe className="mr-2 text-emerald-400" size={20} /> Platform Preferences</h2></div>
                <div className="p-6 flex-1 space-y-6">
                  <div className="space-y-4 max-w-2xl">
                    <CustomToggle label="Maintenance Mode" description="Locks out all non-admin users. Displays a maintenance screen on login." checked={platformData.maintenanceMode} onChange={(val) => setPlatformData({...platformData, maintenanceMode: val})} />
                    <CustomToggle label="Allow New Registrations" description="When disabled, the 'Register' button on the landing page is hidden." checked={platformData.allowRegistrations} onChange={(val) => setPlatformData({...platformData, allowRegistrations: val})} />
                    <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl mt-4">
                      <label className="block text-sm font-bold text-slate-200 mb-2">Maintenance Announcement</label>
                      <textarea
                        value={platformData.announcementBanner || ''}
                        onChange={(e) => setPlatformData({...platformData, announcementBanner: e.target.value})}
                        disabled={!platformData.maintenanceMode}
                        placeholder={platformData.maintenanceMode ? "e.g., System will be down for maintenance until 2:00 PM." : "Enable Maintenance Mode to set an announcement."}
                        className={`w-full p-3 border rounded-lg outline-none resize-none transition-all ${platformData.maintenanceMode ? 'bg-slate-900/50 border-slate-700 text-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed'}`}
                        rows="2"
                      />
                      <p className="text-xs text-slate-500 mt-2">This message will be displayed globally on the login screen when Maintenance Mode is active.</p>
                    </div>  
                  </div>
                </div>
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 text-right"><button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 inline-flex items-center">{isSaving ? 'Saving...' : 'Save Preferences'}</button></div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="flex flex-col h-full animate-fade-in">
                <div className="p-6 border-b border-rose-500/20 bg-rose-500/5"><h2 className="text-xl font-bold text-rose-400 flex items-center"><AlertTriangle className="mr-2" size={20} /> Targeted Data Resets</h2></div>
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-700 rounded-2xl gap-4"><div><h3 className="text-slate-200 font-bold flex items-center"><RefreshCw size={16} className="mr-2 text-blue-400"/> Reset Student Progress</h3><p className="text-sm text-slate-500">Deletes all saved student scores.</p></div><button onClick={() => openDangerModal('reset_progress', 'Reset Progress', 'RESET-DATA', 'This deletes all student records.')} className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 font-bold rounded-lg">Reset Progress</button></div>
                  <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-700 rounded-2xl gap-4"><div><h3 className="text-slate-200 font-bold flex items-center"><FileMinus size={16} className="mr-2 text-amber-400"/> Delete Drafts</h3><p className="text-sm text-slate-500">Removes all unfinished draft experiments.</p></div><button onClick={() => openDangerModal('clean_drafts', 'Delete Drafts', 'CLEAN-DRAFTS', 'Deletes all draft experiments.')} className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 font-bold rounded-lg">Clean Drafts</button></div>
                  <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-700 rounded-2xl gap-4"><div><h3 className="text-slate-200 font-bold flex items-center"><UserX size={16} className="mr-2 text-purple-400"/> Mass Disable Students</h3><p className="text-sm text-slate-500">Changes status of all students to Disabled.</p></div><button onClick={() => openDangerModal('disable_students', 'Disable All Students', 'REVOKE-ACCESS', 'Locks all students out.')} className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 font-bold rounded-lg">Disable Accounts</button></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;