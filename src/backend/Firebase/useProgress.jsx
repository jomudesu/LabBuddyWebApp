import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

// 1. Create the Context
const ProgressContext = createContext();

// 2. Create the Provider Component
export const ProgressProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProgress({});
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'userProgress'), where('userId', '==', currentUser.uid));
    
    // onSnapshot automatically listens for real-time updates from Firebase
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progressMap = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        progressMap[data.experimentId] = data;
      });
      setProgress(progressMap);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching progress:', error);
      setLoading(false);
    });

    // Cleanup the listener when the user logs out or leaves
    return () => unsubscribe();
  }, [currentUser]);

  const updateExperimentStatus = async (experimentId, status) => {
    if (!currentUser) return;
    const docId = `${currentUser.uid}_${experimentId}`;
    const docRef = doc(db, 'userProgress', docId);
    const now = new Date();

    const data = {
      userId: currentUser.uid,
      experimentId,
      status,
      lastAccessed: now,
    };
    
    if (status === 'in_progress') data.startedAt = now;
    if (status === 'completed') data.completedAt = now;

    try {
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }
      // Notice we no longer manually call setProgress() here!
      // onSnapshot detects the change and updates the whole app instantly.
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getStatus = (experimentId) => progress[experimentId]?.status || 'not_started';

  return (
    <ProgressContext.Provider value={{ progress, loading, updateExperimentStatus, getStatus }}>
      {children}
    </ProgressContext.Provider>
  );
};

// 3. Export the hook so your other components don't need to change their imports
export const useProgress = () => useContext(ProgressContext);