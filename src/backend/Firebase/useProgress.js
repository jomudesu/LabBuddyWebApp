import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

export const useProgress = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProgress({});
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const q = query(collection(db, 'userProgress'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const progressMap = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          progressMap[data.experimentId] = data;
        });
        setProgress(progressMap);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
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
      setProgress(prev => ({ ...prev, [experimentId]: { ...prev[experimentId], ...data } }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getStatus = (experimentId) => progress[experimentId]?.status || 'not_started';

  return { progress, loading, updateExperimentStatus, getStatus };
};