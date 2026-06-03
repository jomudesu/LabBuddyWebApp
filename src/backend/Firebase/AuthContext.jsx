import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail // ✨ NEW: Imported for password resets
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── LISTEN TO GLOBAL PLATFORM SETTINGS ───
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'preferences'), (docSnap) => {
      if (docSnap.exists()) {
        setPlatformSettings(docSnap.data());
      } else {
        setPlatformSettings({ maintenanceMode: false, allowRegistrations: true, announcementBanner: '' });
      }
    });
    return unsub;
  }, []);

  // ─── AUTO-KICK IF MAINTENANCE MODE ACTIVATES ───
  useEffect(() => {
    if (platformSettings?.maintenanceMode && currentUser && currentUser.role !== 'admin') {
      signOut(auth).then(() => {
        setCurrentUser(null);
      });
    }
  }, [platformSettings?.maintenanceMode, currentUser]);


  const register = async (email, password, displayName, role, section) => {
    try {
      setError(null);
      if (platformSettings && !platformSettings.allowRegistrations) {
        throw new Error("Registrations are currently closed by the administrator.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: displayName });
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role || 'student',
        section: section || '-',
        status: role === 'instructor' ? 'pending' : 'active', 
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      if (role === 'instructor') {
        await signOut(auth);
        setCurrentUser(null);
        return { status: 'pending' };
      }

      setCurrentUser({ ...user, ...userData });
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;
      const userRole = userData ? userData.role : 'student';

      if (platformSettings?.maintenanceMode && userRole !== 'admin') {
        await signOut(auth); 
        throw new Error("System is currently undergoing maintenance. Please try again later.");
      }

      if (userData && userData.status === 'pending') {
        await signOut(auth); 
        throw new Error("Your instructor account is pending admin approval.");
      }

      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      return { userCredential, role: userRole }; 
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ✨ NEW: Password Reset Function
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
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const customUserData = userDocSnap.data();
            if (customUserData.status === 'pending') {
              await signOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser({ ...firebaseUser, ...customUserData });
            }
          } else {
            setCurrentUser(firebaseUser);
          }
        } catch (err) {
          console.error("Error fetching user data/role:", err);
          setCurrentUser(firebaseUser);
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
    register,
    login,
    resetPassword, // ✨ NEW: Exported to the app
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};