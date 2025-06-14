
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AccessItem } from "@/components/access/types";
import { toast } from "sonner";

interface UseAccessItemsProps {
  companyId?: string;
  userId?: string;
}

export const useAccessItems = ({ companyId, userId }: UseAccessItemsProps) => {
  const [accessItems, setAccessItems] = useState<AccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const lastSelectedCompanyIdRef = useRef<string | null>(null);

  const fetchAccessItems = async (forceRefresh = false) => {
    if (!companyId || !userId) {
      console.log('No companyId or userId provided:', { companyId, userId });
      setAccessItems([]);
      setIsLoading(false);
      setHasPermission(true);
      return;
    }
    
    if (lastSelectedCompanyIdRef.current === companyId && !forceRefresh) {
      console.log('Already fetched data for this company, skipping duplicate fetch');
      setIsLoading(false);
      return;
    }

    if (requestInProgress && !forceRefresh) {
      console.log('Request already in progress, skipping duplicate fetch');
      return;
    }

    setIsLoading(true);
    setHasPermission(true);
    setRequestInProgress(true);

    try {
      console.log('Fetching access items for company:', companyId, 'User ID:', userId);
      
      const { data, error } = await supabase
        .from('company_access')
        .select('*')
        .eq('company_id', companyId)
        .order('tool_name');
      
      if (error) {
        console.error('Error fetching access items:', error);
        if (error.code === '42501' || error.message.includes('policy')) {
          console.log('Access denied by RLS policy:', error.message);
          setHasPermission(false);
          setAccessItems([]);
        } else {
          console.error('Other error type:', error);
          setAccessItems([]);
          toast.error('Erro ao carregar informações de acesso');
        }
      } else {
        console.log('Access items found:', data?.length, 'items');
        setAccessItems(data as AccessItem[] || []);
        lastSelectedCompanyIdRef.current = companyId;
        setHasPermission(true);
      }
    } catch (error: any) {
      console.error('Exception while loading access items:', error);
      setAccessItems([]);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
      setRequestInProgress(false);
    }
  };

  useEffect(() => {
    if (companyId && userId) {
      fetchAccessItems();
    }
  }, [companyId, userId]);

  // Listen for access creation events
  useEffect(() => {
    const handleAccessCreated = () => {
      console.log('Access created event received, refreshing data');
      if (companyId && userId) {
        fetchAccessItems(true);
      }
    };

    window.addEventListener('access-created', handleAccessCreated);
    
    return () => {
      window.removeEventListener('access-created', handleAccessCreated);
    };
  }, [companyId, userId]);

  return {
    accessItems,
    isLoading,
    hasPermission,
    refetch: () => {
      if (companyId && userId) {
        fetchAccessItems(true);
      }
    }
  };
};
