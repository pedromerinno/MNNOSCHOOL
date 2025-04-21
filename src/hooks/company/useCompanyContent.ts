
import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { useCompanyCache } from "./useCompanyCache";

export const useCompanyContent = () => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [companyColor, setCompanyColor] = useState<string>("#1EAEDB");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { getCurrentCacheVersion } = useCompanyCache();
  
  // Referência para controlar as solicitações
  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const cacheVersionRef = useRef<string>(getCurrentCacheVersion());

  // Efeito para atualizar a cor quando a empresa muda
  useEffect(() => {
    if (selectedCompany) {
      console.log(`[useCompanyContent] Company changed, updating content for: ${selectedCompany.nome}`);
      setCompanyColor(selectedCompany.cor_principal || "#1EAEDB");
      setCompanyId(selectedCompany.id);
      setIsLoadingContent(false);
      
      // Atualizar versão de cache da referência
      cacheVersionRef.current = getCurrentCacheVersion();
    } else {
      setIsLoadingContent(companyLoading);
    }
  }, [selectedCompany, companyLoading, getCurrentCacheVersion]);

  // Ouvinte para eventos de empresa
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail?.company;
      
      if (updatedCompany) {
        console.log(`[useCompanyContent] Company update event received: ${updatedCompany.nome}`);
        
        if (updatedCompany?.cor_principal) {
          setCompanyColor(updatedCompany.cor_principal);
        }
        
        if (updatedCompany?.id) {
          setCompanyId(updatedCompany.id);
        }
        
        // Atualizar versão de cache da referência
        cacheVersionRef.current = getCurrentCacheVersion();
      }
    };
    
    // Registrar eventos relacionados a alterações de empresa
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    window.addEventListener('company-relation-changed', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
      window.removeEventListener('company-relation-changed', handleCompanyUpdate);
    };
  }, [getCurrentCacheVersion]);

  // Função para buscar dados relacionados à empresa com base no tipo
  const fetchCompanyRelatedData = useCallback(async (tableName: string, limit: number = 10) => {
    if (!companyId) return [];
    
    // Implementação de throttling básico para evitar muitas requisições
    const now = Date.now();
    const lastUpdate = lastUpdateTimeRef.current[tableName] || 0;
    const minInterval = 2000; // 2 segundos
    
    if (now - lastUpdate < minInterval) {
      console.log(`[useCompanyContent] Throttling request for ${tableName}, too soon`);
      // Se estiver solicitando muito rápido, use dados em cache ou aguarde
      return [];
    }
    
    try {
      console.log(`[useCompanyContent] Fetching ${tableName} data for company ${companyId}`);
      lastUpdateTimeRef.current[tableName] = now;
      
      // Use the "from" method with type assertion to avoid the type error
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('company_id', companyId)
        .limit(limit);
        
      if (error) throw error;
      
      console.log(`[useCompanyContent] Successfully fetched ${data?.length || 0} ${tableName} records`);
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching ${tableName} for company ${companyId}:`, error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
      return [];
    }
  }, [companyId]);

  // Função genérica para buscar dados com cache em memoria
  const useCompanyData = useCallback(<T>(
    tableName: string,
    options?: { limit?: number; refreshInterval?: number }
  ) => {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const cachedDataRef = useRef<{data: T[], timestamp: number, version: string}>({
      data: [],
      timestamp: 0,
      version: ''
    });
    
    // Buscar dados e atualizar o estado
    const fetchData = useCallback(async (force = false) => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }
      
      const now = Date.now();
      const limit = options?.limit || 50;
      const refreshInterval = options?.refreshInterval || 60000; // 1 minuto padrão
      
      // Verificar se precisamos atualizar os dados
      const shouldRefresh = force || 
        now - cachedDataRef.current.timestamp > refreshInterval ||
        cachedDataRef.current.version !== cacheVersionRef.current;
      
      if (!shouldRefresh && cachedDataRef.current.data.length > 0) {
        setData(cachedDataRef.current.data);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const result = await fetchCompanyRelatedData(tableName, limit);
        setData(result as T[]);
        setIsLoading(false);
        
        // Atualizar cache
        cachedDataRef.current = {
          data: result as T[],
          timestamp: now,
          version: cacheVersionRef.current
        };
      } catch (error) {
        console.error(`Error in useCompanyData for ${tableName}:`, error);
        setIsLoading(false);
      }
    }, [companyId, options, fetchCompanyRelatedData]);
    
    // Efeito para carregar inicialmente e quando a empresa mudar
    useEffect(() => {
      fetchData(true);
      
      const intervalId = setInterval(() => {
        fetchData();
      }, options?.refreshInterval || 60000);
      
      return () => clearInterval(intervalId);
    }, [companyId, fetchData, options?.refreshInterval]);
    
    // Efeito para atualizar quando a versão do cache mudar
    useEffect(() => {
      const handleCompanyEvent = () => {
        // Re-fetch quando receber eventos de empresa
        fetchData(true);
      };
      
      window.addEventListener('company-selected', handleCompanyEvent);
      window.addEventListener('company-updated', handleCompanyEvent);
      
      return () => {
        window.removeEventListener('company-selected', handleCompanyEvent);
        window.removeEventListener('company-updated', handleCompanyEvent);
      };
    }, [fetchData]);
    
    return { data, isLoading, refetch: () => fetchData(true) };
  }, [companyId, fetchCompanyRelatedData, cacheVersionRef]);

  return {
    companyId,
    companyColor,
    isLoadingContent,
    fetchCompanyRelatedData,
    selectedCompany,
    useCompanyData
  };
};
