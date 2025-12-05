import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePersonalAccessCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user?.id) {
        setCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use count query instead of fetching all data
        const { count: accessCount, error } = await supabase
          .from('user_access')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching personal access count:', error);
          setCount(0);
        } else {
          setCount(accessCount || 0);
        }
      } catch (error) {
        console.error('Exception while loading personal access count:', error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();

    // Listen for access creation/deletion events
    const handleAccessChanged = () => {
      fetchCount();
    };

    window.addEventListener('user-access-changed', handleAccessChanged);
    
    return () => {
      window.removeEventListener('user-access-changed', handleAccessChanged);
    };
  }, [user?.id]);

  return { count, isLoading };
};





