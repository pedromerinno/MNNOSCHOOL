import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AccessItem } from "@/components/access/types";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";

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
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const fetchAccessItems = useCallback(async (forceRefresh = false) => {
    if (!companyId || !userId) {
      console.log('No companyId or userId provided:', { companyId, userId });
      setAccessItems([]);
      setIsLoading(false);
      setHasPermission(true);
      return;
    }
    
    // Wait for admin status to be determined
    if (isAdminLoading) {
      console.log('Waiting for admin status to be determined...');
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
      console.log('Fetching access items for company:', companyId, 'User ID:', userId, 'Is Admin:', isAdmin);
      
      // Use different function based on admin status
      // Admins see all access, regular users see filtered access based on permissions
      const rpcFunction = isAdmin 
        ? 'get_company_access_decrypted' 
        : 'get_company_access_for_user';
      
      const { data, error } = await supabase
        .rpc(rpcFunction, { p_company_id: companyId });
      
      if (error) {
        console.error('[useAccessItems] Error fetching access items:', {
          error,
          error_code: error.code,
          error_message: error.message,
          error_details: error.details,
          rpc_function: rpcFunction,
          company_id: companyId,
          is_admin: isAdmin
        });
        
        if (error.code === '42501' || error.message.includes('policy') || error.message.includes('Unauthorized')) {
          console.log('Access denied by RLS policy or insufficient permissions:', error.message);
          setHasPermission(false);
          setAccessItems([]);
        } else if (error.code === '42883' || error.message.includes('does not exist')) {
          // Function doesn't exist
          console.error('Function does not exist:', rpcFunction);
          setAccessItems([]);
          toast.error(`Função ${rpcFunction} não encontrada. Contate o administrador.`);
        } else {
          console.error('Other error type:', error);
          setAccessItems([]);
          toast.error(`Erro ao carregar informações de acesso: ${error.message || 'Erro desconhecido'}`);
        }
      } else {
        console.log('Access items found:', data?.length, 'items');
        
        // Transform the data to match the expected AccessItem format
        const transformedData = data?.map(item => {
          // Debug: Log password data
          console.log('[useAccessItems] Transforming item:', {
            id: item.id,
            tool_name: item.tool_name,
            password_decrypted: item.password_decrypted ? '[REDACTED]' : 'null/undefined',
            password_decrypted_type: typeof item.password_decrypted,
            password_decrypted_length: item.password_decrypted?.length || 0
          });

          return {
            id: item.id,
            company_id: item.company_id,
            tool_name: item.tool_name,
            username: item.username,
            password: item.password_decrypted || '', // Use decrypted password, fallback to empty string
            url: item.url,
            notes: item.notes,
            created_at: item.created_at,
            created_by: item.created_by
          };
        }) || [];
        
        setAccessItems(transformedData as AccessItem[] || []);
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
  }, [companyId, userId, isAdmin, isAdminLoading]);

  useEffect(() => {
    if (companyId && userId && !isAdminLoading) {
      fetchAccessItems();
    }
  }, [companyId, userId, isAdmin, isAdminLoading, fetchAccessItems]);

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