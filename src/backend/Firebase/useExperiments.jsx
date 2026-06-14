import { useState, useEffect } from 'react';
import { supabase } from './firebase'; 

export const useExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        // Fetch all experiments from Supabase Postgres
        const { data, error: fetchError } = await supabase
          .from('experiments')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Map data to ensure compatibility with your legacy React components
        const formattedData = data.map(exp => ({
          ...exp,
          createdAt: exp.created_at
        }));

        setExperiments(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // 1. Initial fetch when the component loads
    fetchExperiments();

    // 2. Use Math.random() to create a TRULY unique channel string (e.g., 'sync_a1b2c3d4').
    const uniqueChannelName = `global_experiments_sync_${Math.random().toString(36).substring(2, 15)}`;
    
    const channel = supabase.channel(uniqueChannelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiments' }, () => {
        // Whenever an instructor toggles an assignment, this triggers and silently refetches the updated list!
        fetchExperiments(); 
      })
      .subscribe();

    // 3. Cleanup the listener when the user leaves the page
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { experiments, loading, error };
};