import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Register function updated to accept role and section
  const register = async (email, password, displayName, role, section) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Create user document in Firestore with role, section, and status
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
      
      // If instructor, immediately sign them out so they don't bypass approval
      if (role === 'instructor') {
        await signOut(auth);
        setCurrentUser(null);
        return { status: 'pending' };
      }

      // If student, refresh the user state immediately and let them in
      setCurrentUser({ ...user, ...userData });
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login function updated to reject pending instructors
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch the user data
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;

      // Check for admin approval
      if (userData && userData.status === 'pending') {
        await signOut(auth); // Kick them back out
        throw new Error("Your instructor account is pending admin approval.");
      }

      const userRole = userData ? userData.role : 'student';

      // Update lastLogin in Firestore
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
      
      // Return both the credential AND the role
      return { userCredential, role: userRole }; 
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
            // Double check inside the listener to prevent rogue auth sessions
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
    loading,
    error,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};