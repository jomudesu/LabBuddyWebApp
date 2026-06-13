import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './firebase';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!currentUser) return;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', currentUser.uid); 

    if (!error && data) {
      const progressMap = {};
      data.forEach(row => {
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

    fetchProgress();

    const channel = supabase.channel('user_progress_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${currentUser.uid}` }, 
        () => fetchProgress() 
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser]);

  const updateExperimentStatus = async (experimentId, statusOrPayload) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    try {
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', currentUser.uid)
        .eq('experiment_id', experimentId)
        .single();

      const isPayload = typeof statusOrPayload === 'object';
      const status = isPayload ? statusOrPayload.status : statusOrPayload;
      
      const updateData = { status };
      if (status === 'completed') updateData.completed_at = now;
      if (isPayload && statusOrPayload.grade !== undefined) updateData.grade = statusOrPayload.grade;
      if (isPayload && statusOrPayload.errors !== undefined) updateData.errors = statusOrPayload.errors;

      // This tells React to update the Hub immediately without waiting for Supabase to confirm
      setProgress(prev => ({
        ...prev,
        [experimentId]: {
          ...prev[experimentId],
          status: updateData.status,
          grade: updateData.grade !== undefined ? updateData.grade : prev[experimentId]?.grade,
          errors: updateData.errors !== undefined ? updateData.errors : prev[experimentId]?.errors,
          completedAt: updateData.completed_at || prev[experimentId]?.completedAt
        }
      }));

      if (existing) {
        await supabase.from('user_progress').update(updateData).eq('id', existing.id);
      } else {
        await supabase.from('user_progress').insert([{
          user_id: currentUser.uid,
          experiment_id: experimentId,
          ...updateData
        }]);
      }
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

export const useProgress = () => useContext(ProgressContext);