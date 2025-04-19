
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

  useEffect(() => {
    const fetchAccessItems = async () => {
      if (!companyId || !userId) {
        setAccessItems([]);
        setIsLoading(false);
        return;
      }
      
      if (lastSelectedCompanyIdRef.current === companyId) {
        console.log('Already fetched data for this company, skipping duplicate fetch');
        return;
      }

      if (requestInProgress) {
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
          if (error.code === '42501' || error.message.includes('policy')) {
            console.log('Acesso negado pela política RLS:', error.message);
            setHasPermission(false);
            setAccessItems([]);
          } else {
            console.error('Erro ao buscar itens de acesso:', error);
            throw error;
          }
        } else {
          console.log('Itens de acesso encontrados:', data?.length);
          setAccessItems(data as AccessItem[] || []);
          lastSelectedCompanyIdRef.current = companyId;
        }
      } catch (error: any) {
        console.error('Erro ao carregar informações de acesso:', error);
        toast.error('Não foi possível carregar os dados de acesso');
        setAccessItems([]);
      } finally {
        setIsLoading(false);
        setRequestInProgress(false);
      }
    };

    fetchAccessItems();
    
    return () => {
      if (requestInProgress) {
        setRequestInProgress(false);
      }
    };
  }, [companyId, userId, requestInProgress]);

  return {
    accessItems,
    isLoading,
    hasPermission
  };
};
