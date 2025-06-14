
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
      return;
    }
    
    if (lastSelectedCompanyIdRef.current === companyId && !forceRefresh) {
      console.log('Already fetched data for this company, skipping duplicate fetch');
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
      
      // Primeiro, vamos verificar se o usuário pertence à empresa
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('empresa_id', companyId);
      
      if (userCompanyError) {
        console.error('Erro ao verificar vínculo usuário-empresa:', userCompanyError);
      } else {
        console.log('Vínculo usuário-empresa encontrado:', userCompanyData);
      }
      
      const { data, error } = await supabase
        .from('company_access')
        .select('*')
        .eq('company_id', companyId)
        .order('tool_name');
      
      if (error) {
        console.error('Erro detalhado da consulta:', error);
        if (error.code === '42501' || error.message.includes('policy')) {
          console.log('Acesso negado pela política RLS:', error.message);
          setHasPermission(false);
          setAccessItems([]);
        } else {
          console.error('Outro tipo de erro ao buscar itens de acesso:', error);
          throw error;
        }
      } else {
        console.log('Itens de acesso encontrados:', data?.length, 'itens:', data);
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

  useEffect(() => {
    fetchAccessItems();
  }, [companyId, userId]);

  // Listen for access creation events
  useEffect(() => {
    const handleAccessCreated = () => {
      console.log('Access created event received, refreshing data');
      fetchAccessItems(true);
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
    refetch: () => fetchAccessItems(true)
  };
};
