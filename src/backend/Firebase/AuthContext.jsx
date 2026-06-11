import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
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

  // ✨ Ref to securely suspend the auth listener during registration
  const isRegisteringRef = useRef(false);

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

  useEffect(() => {
    if (platformSettings?.maintenanceMode && currentUser && currentUser.role !== 'admin') {
      signOut(auth).then(() => {
        setCurrentUser(null);
      });
    }
  }, [platformSettings?.maintenanceMode, currentUser]);


  const register = async (email, password, displayName, role, section) => {
    // Suspend the listener immediately to block ghost-routing
    isRegisteringRef.current = true; 
    
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
        status: 'pending', 
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Force sign-out before the listener is allowed to wake up
      await signOut(auth);
      setCurrentUser(null);

      // ✨ FIX: Delay lifting the shield for 2 seconds to absorb ALL delayed Firebase microtasks!
      setTimeout(() => {
        isRegisteringRef.current = false;
      }, 2000);

      return { status: 'pending' };

    } catch (err) {
      isRegisteringRef.current = false;
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
      
      if (!userDocSnap.exists()) {
        await signOut(auth);
        throw new Error("This account has been removed by an administrator.");
      }

      const userData = userDocSnap.data();
      const userRole = userData.role || 'student';

      if (userData.status === 'disabled') {
        await signOut(auth);
        throw new Error("Your account has been disabled. Please contact the administrator.");
      }

      if (platformSettings?.maintenanceMode && userRole !== 'admin') {
        await signOut(auth); 
        throw new Error("System is currently undergoing maintenance. Please try again later.");
      }

      // Check pending status securely on login
      if (userData.status === 'pending') {
        await signOut(auth); 
        const errorMsg = userRole === 'instructor' 
          ? "Your Instructor account is pending admin approval." 
          : `Your student account is pending Admin verification for Section: ${userData.section || '-'}`;
        throw new Error(errorMsg);
      }

      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      return { userCredential, role: userRole }; 
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
      // If the shield is up, ignore everything Firebase Auth says!
      if (isRegisteringRef.current) return;

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const customUserData = userDocSnap.data();
            if (customUserData.status === 'pending' || customUserData.status === 'disabled') {
              await signOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser({ ...firebaseUser, ...customUserData });
            }
          } else {
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (err) {
          if (err.code !== 'permission-denied') {
            console.error("Error fetching user data/role:", err);
          }
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
    register,
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