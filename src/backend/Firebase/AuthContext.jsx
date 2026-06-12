import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword // ✨ NEW: Needed to scramble the temporary password
} from 'firebase/auth';
import { auth, supabase } from './firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── LISTEN TO SUPABASE SYSTEM PREFERENCES ───
  useEffect(() => {
    const fetchPrefs = async () => {
      const { data } = await supabase.from('system_preferences').select('*').eq('id', 'default').single();
      if (data) {
        setPlatformSettings({ 
          maintenanceMode: data.maintenance_mode, 
          allowRegistrations: data.allow_registrations,
          announcementBanner: data.announcement_banner 
        });
      }
    };
    fetchPrefs();

    const channel = supabase.channel('system_prefs_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_preferences' }, (payload) => {
        setPlatformSettings({ 
          maintenanceMode: payload.new.maintenance_mode, 
          allowRegistrations: payload.new.allow_registrations,
          announcementBanner: payload.new.announcement_banner 
        });
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (platformSettings?.maintenanceMode && currentUser && currentUser.role !== 'admin') {
      signOut(auth).then(() => {
        setCurrentUser(null);
      });
    }
  }, [platformSettings?.maintenanceMode, currentUser]);

  // ─── LOGIN (SUPABASE SQL HYBRID) ───
  const login = async (email, password) => {
    try {
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const [userRes, prefsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.uid).single(),
        supabase.from('system_preferences').select('*').eq('id', 'default').single()
      ]);
      
      const userData = userRes.data;
      const freshPrefs = prefsRes.data;

      if (userRes.error || !userData) {
        await signOut(auth);
        throw new Error("This account has been removed by an administrator.");
      }

      // ✨ NEW: FIRST-LOGIN FORCED PASSWORD CHANGE LOGIC
      if (userData.requires_password_change) {
        try {
          // 1. Scramble the password so the admin's temporary one is destroyed forever
          const scrambledPassword = Math.random().toString(36).slice(-10) + "aA1!@"; 
          await updatePassword(user, scrambledPassword);

          // 2. Update Supabase so they don't get blocked next time
          await supabase.from('users').update({ requires_password_change: false }).eq('id', user.uid);

          // 3. Send the reset email
          await sendPasswordResetEmail(auth, email);
          
          // 4. Kick them out and throw a special flag to the Landing page
          await signOut(auth);
          throw new Error(`FIRST_LOGIN_RESET: Account verified! For your security, you must set a permanent password. A secure reset link has been sent to ${email}.`);
        } catch (resetErr) {
          if (resetErr.message.startsWith("FIRST_LOGIN_RESET:")) throw resetErr;
          await signOut(auth);
          throw new Error("Action required: Please use the 'Forgot Password' feature to set a secure password for your new account.");
        }
      }

      if (freshPrefs?.maintenance_mode && userData.role !== 'admin') {
        await signOut(auth); 
        throw new Error("System is currently undergoing maintenance. Please try again later.");
      }

      if (userData.status === 'disabled') {
        await signOut(auth);
        throw new Error("Your account has been disabled. Please contact the administrator.");
      }

      if (userData.status === 'pending') {
        await signOut(auth); 
        const errorMsg = userData.role === 'instructor' 
          ? "Your instructor account is pending admin approval." 
          : `Your student account is pending Admin verification for Section: ${userData.section || '-'}`;
        throw new Error(errorMsg);
      }

      await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.uid);
      
      return { userCredential, userData }; 
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const [userRes, prefsRes] = await Promise.all([
            supabase.from('users').select('*').eq('id', firebaseUser.uid).single(),
            supabase.from('system_preferences').select('*').eq('id', 'default').single()
          ]);
          
          const customUserData = userRes.data;
          const freshPrefs = prefsRes.data;
          
          if (customUserData) {
            // Prevent auto-login if they still require a password change somehow
            if (customUserData.requires_password_change) {
              await signOut(auth);
              setCurrentUser(null);
            } else if (freshPrefs?.maintenance_mode && customUserData.role !== 'admin') {
              await signOut(auth);
              setCurrentUser(null);
            } else if (customUserData.status === 'pending' || customUserData.status === 'disabled') {
              await signOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser({ 
                ...firebaseUser, 
                ...customUserData,
                displayName: customUserData.display_name, 
                hasAcceptedDPA: customUserData.has_accepted_dpa
              });
            }
          } else {
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (err) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    platformSettings,
    loading,
    error,
    login,
    resetPassword, 
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};