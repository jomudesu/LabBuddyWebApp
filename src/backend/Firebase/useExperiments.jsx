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
    
    fetchExperiments();
  }, []);

  return { experiments, loading, error };
};