import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './firebase';
import { useAuth } from './AuthContext';

// 1. Create the Context
const ProgressContext = createContext();

// 2. Create the Provider Component
export const ProgressProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper to fetch progress from Supabase
  const fetchProgress = async () => {
    if (!currentUser) return;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', currentUser.uid); // Fetch ONLY the current student's progress

    if (!error && data) {
      const progressMap = {};
      data.forEach(row => {
        // Format it exactly how the old Firestore context did so the UI doesn't break
        progressMap[row.experiment_id] = {
          id: row.id,
          userId: row.user_id,
          experimentId: row.experiment_id,
          status: row.status,
          grade: row.grade,
          errors: row.errors,
          completedAt: row.completed_at
        };
      });
      setProgress(progressMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser) {
      setProgress({});
      setLoading(false);
      return;
    }

    // Initial Fetch
    fetchProgress();

    // Supabase Real-time Listener (Replaces Firestore onSnapshot)
    const channel = supabase.channel('user_progress_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${currentUser.uid}` }, 
        () => {
          fetchProgress(); // Re-fetch immediately if data changes
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser]);

  const updateExperimentStatus = async (experimentId, status) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    try {
      // 1. Check if a record already exists for this specific experiment
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', currentUser.uid)
        .eq('experiment_id', experimentId)
        .single();

      const updateData = { status };
      if (status === 'completed') updateData.completed_at = now;

      if (existing) {
        // 2. UPDATE existing record
        await supabase
          .from('user_progress')
          .update(updateData)
          .eq('id', existing.id);
      } else {
        // 3. INSERT brand new record
        await supabase
          .from('user_progress')
          .insert([{
            user_id: currentUser.uid,
            experiment_id: experimentId,
            status: status,
            ...(status === 'completed' ? { completed_at: now } : {})
          }]);
      }
    } catch (error) {
      console.error('Error updating progress in Supabase:', error);
    }
  };

  const getStatus = (experimentId) => progress[experimentId]?.status || 'not_started';

  return (
    <ProgressContext.Provider value={{ progress, loading, updateExperimentStatus, getStatus }}>
      {children}
    </ProgressContext.Provider>
  );
};

// 3. Export the hook
export const useProgress = () => useContext(ProgressContext);