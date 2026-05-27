import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const useExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'experiment'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExperiments(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiments();
  }, []);

  return { experiments, loading, error };
};