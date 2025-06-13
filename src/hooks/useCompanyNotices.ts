import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "./useCompanies";
import { toast } from "sonner";
import { Notice, NoticeAuthor } from "./useNotifications";
import { useCache } from "@/hooks/useCache";
import { useCompanyRequest } from "@/hooks/company/useCompanyRequest";

export interface NoticeFormData {
  title: string;
  content: string;
  type: string;
  companies?: string[];
}

export function useCompanyNotices() {
  const { user } = useAuth();
  const { selectedCompany } = useCompanies();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCache, setCache, clearCache } = useCache();
  const {
    shouldMakeRequest,
    startRequest,
    completeRequest,
    resetRequestState,
    debouncedRequest
  } = useCompanyRequest();
  
  const fetchingRef = useRef(false);
  const cleanupInProgressRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const noticesInstanceIdRef = useRef<string>(`notices-${Math.random().toString(36).substring(2, 9)}`);
  const lastFetchedCompanyIdRef = useRef<string | null>(null);
  const pendingFetchTimeoutRef = useRef<number | null>(null);

  const fetchNotices = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId) {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
      return;
    }
    
    // Evitar requisições duplicadas para a mesma empresa em um curto período de tempo
    if (lastFetchedCompanyIdRef.current === targetCompanyId && !forceRefresh) {
      console.log(`Ignorando fetch duplicado para empresa: ${targetCompanyId}`);
      return;
    }
    
    // Limpar qualquer timeout pendente
    if (pendingFetchTimeoutRef.current !== null) {
      clearTimeout(pendingFetchTimeoutRef.current);
      pendingFetchTimeoutRef.current = null;
    }

    const cacheKey = `notices_${targetCompanyId}`;
    
    const cachedData = getCache({ key: cacheKey });
    const hasLocalData = !!cachedData && Array.isArray(cachedData) && cachedData.length > 0;
    
    if (!shouldMakeRequest(forceRefresh, hasLocalData, noticesInstanceIdRef.current, cacheKey) || fetchingRef.current) {
      if (hasLocalData) {
        console.log(`[${noticesInstanceIdRef.current}] Using cached data for notices of company ${targetCompanyId}`);
        setNotices(cachedData);
        if (cachedData.length > 0) {
          setCurrentNotice(cachedData[0]);
          setCurrentIndex(0);
        }
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      fetchingRef.current = true;
      startRequest(cacheKey);
      lastFetchedCompanyIdRef.current = targetCompanyId;
      
      console.log(`Fetching notices for company: ${targetCompanyId}`);
      
      // Buscar diretamente todos os avisos da empresa na tabela company_notices
      const { data: noticesData, error: noticesError } = await supabase
        .from('company_notices')
        .select('*')
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false }); // Order by newest first
      
      if (noticesError) throw noticesError;
      
      if (!noticesData || noticesData.length === 0) {
        console.log(`No notices found for company: ${targetCompanyId}`);
        setNotices([]);
        setCurrentNotice(null);
        setIsLoading(false);
        completeRequest();
        fetchingRef.current = false;
        setCache({ key: cacheKey }, []);
        return;
      }
      
      console.log(`Retrieved ${noticesData.length} notices`);
      
      const authorIds = [...new Set(noticesData.map(n => n.created_by))];
      
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);
        
      if (authorsError) throw authorsError;
      
      const noticesWithAuthors = noticesData.map((notice) => {
        const author = authors?.find(a => a.id === notice.created_by) as NoticeAuthor;
        return { 
          ...notice, 
          author,
          companies: [targetCompanyId] // Assumir que o aviso pertence à empresa atual
        };
      });
      
      setCache({ key: cacheKey }, noticesWithAuthors);
      
      setNotices(noticesWithAuthors);
      
      if (noticesWithAuthors.length > 0) {
        setCurrentNotice(noticesWithAuthors[0]);
        setCurrentIndex(0);
      } else {
        setCurrentNotice(null);
      }
      
      completeRequest();
    } catch (err: any) {
      console.error('Erro ao buscar avisos:', err);
      setError(err.message || 'Erro ao buscar avisos');
      resetRequestState();
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [
    selectedCompany?.id, 
    getCache, 
    setCache, 
    clearCache, 
    shouldMakeRequest, 
    startRequest, 
    completeRequest, 
    resetRequestState
  ]);

  const createNotice = async (data: NoticeFormData) => {
    if (!user || !data.companies || data.companies.length === 0) {
      toast.error("Não foi possível criar o aviso. Usuário ou empresa não identificados.");
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Criando aviso para empresas:", data.companies);

      const { data: newNotice, error } = await supabase
        .from('company_notices')
        .insert({
          title: data.title,
          content: data.content,
          type: data.type,
          created_by: user.id,
          company_id: data.companies[0]
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (!newNotice || !newNotice.id) {
        throw new Error("Erro ao criar aviso: ID do aviso não retornado");
      }

      const noticeRelations = data.companies.map(companyId => ({
        notice_id: newNotice.id,
        company_id: companyId
      }));

      const { error: relationsError } = await supabase
        .from('notice_companies')
        .insert(noticeRelations);

      if (relationsError) throw relationsError;

      for (const companyId of data.companies) {
        const { data: usersToNotify, error: errorUsers } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', companyId)
          .neq('user_id', user.id);

        if (errorUsers) {
          console.error("Erro ao buscar usuários para notificar:", errorUsers);
          continue;
        }

        if (usersToNotify && Array.isArray(usersToNotify) && usersToNotify.length > 0) {
          const notifications = usersToNotify.map((u) => ({
            user_id: u.user_id,
            company_id: companyId,
            title: `Novo aviso: ${data.title}`,
            content: data.content.slice(0, 80) + (data.content.length > 80 ? "..." : ""),
            type: "aviso",
            related_id: newNotice.id,
            read: false
          }));

          const { error: notifyErr } = await supabase
            .from('user_notifications')
            .insert(notifications);

          if (notifyErr) {
            console.error("Erro ao criar notificações:", notifyErr);
          }
        }
      }

      for (const companyId of data.companies) {
        clearCache({ key: `notices_${companyId}` });
      }

      await fetchNotices(undefined, true);

      toast.success("Aviso(s) criado(s) com sucesso!");
      return true;
    } catch (err: any) {
      console.error('Erro ao criar aviso:', err);
      toast.error(err.message || 'Erro ao criar aviso');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotice = async (noticeId: string, data: NoticeFormData) => {
    if (!user?.id) {
      console.error("updateNotice: User not identified");
      toast.error("Não foi possível atualizar o aviso. Usuário não identificado.");
      return false;
    }

    if (!data.companies || data.companies.length === 0) {
      console.error("updateNotice: No companies selected");
      toast.error("Selecione pelo menos uma empresa.");
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Atualizando aviso:", { noticeId, data, userId: user.id });

      const { error: updateError } = await supabase
        .from('company_notices')
        .update({
          title: data.title,
          content: data.content,
          type: data.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', noticeId);

      if (updateError) {
        console.error("Erro ao atualizar aviso:", updateError);
        throw updateError;
      }

      const { data: currentRelations, error: getRelationsError } = await supabase
        .from('notice_companies')
        .select('company_id')
        .eq('notice_id', noticeId);

      if (getRelationsError) {
        console.error("Erro ao buscar relações atuais:", getRelationsError);
        throw getRelationsError;
      }

      const currentCompanyIds = currentRelations.map(rel => rel.company_id);
      const newCompanyIds = data.companies;
      
      console.log("Empresas atuais:", currentCompanyIds);
      console.log("Novas empresas:", newCompanyIds);

      const companiesToRemove = currentCompanyIds.filter(id => !newCompanyIds.includes(id));
      if (companiesToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('notice_companies')
          .delete()
          .eq('notice_id', noticeId)
          .in('company_id', companiesToRemove);

        if (removeError) {
          console.error("Erro ao remover relações:", removeError);
          throw removeError;
        }
      }

      const companiesToAdd = newCompanyIds.filter(id => !currentCompanyIds.includes(id));
      if (companiesToAdd.length > 0) {
        const newRelations = companiesToAdd.map(companyId => ({
          notice_id: noticeId,
          company_id: companyId
        }));

        const { error: addError } = await supabase
          .from('notice_companies')
          .insert(newRelations);

        if (addError) {
          console.error("Erro ao adicionar novas relações:", addError);
          throw addError;
        }
      }

      for (const companyId of companiesToAdd) {
        const { data: usersToNotify, error: errorUsers } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', companyId)
          .neq('user_id', user.id);

        if (errorUsers) {
          console.error("Erro ao buscar usuários para notificar:", errorUsers);
          continue;
        }

        if (usersToNotify && Array.isArray(usersToNotify) && usersToNotify.length > 0) {
          const notifications = usersToNotify.map((u) => ({
            user_id: u.user_id,
            company_id: companyId,
            title: `Novo aviso: ${data.title}`,
            content: data.content.slice(0, 80) + (data.content.length > 80 ? "..." : ""),
            type: "aviso",
            related_id: noticeId,
            read: false
          }));

          const { error: notifyErr } = await supabase
            .from('user_notifications')
            .insert(notifications);

          if (notifyErr) {
            console.error("Erro ao criar notificações:", notifyErr);
          }
        }
      }

      const allAffectedCompanies = [...companiesToAdd, ...companiesToRemove, ...currentCompanyIds];
      for (const companyId of allAffectedCompanies) {
        clearCache({ key: `notices_${companyId}` });
      }

      await fetchNotices(undefined, true);
      
      toast.success("Aviso atualizado com sucesso!");
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar aviso:', err);
      toast.error(err.message || 'Erro ao atualizar aviso');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotice = async (noticeId: string) => {
    if (!selectedCompany) return false;

    try {
      setIsLoading(true);
      
      const { data: relatedCompanies, error: relatedError } = await supabase
        .from('notice_companies')
        .select('company_id')
        .eq('notice_id', noticeId);
        
      if (relatedError) throw relatedError;
      
      const { error } = await supabase
        .from('company_notices')
        .delete()
        .eq('id', noticeId);
      
      if (error) throw error;
      
      if (relatedCompanies && relatedCompanies.length > 0) {
        for (const item of relatedCompanies) {
          clearCache({ key: `notices_${item.company_id}` });
        }
      }
      
      await fetchNotices(undefined, true);
      
      toast.success("Aviso excluído com sucesso!");
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir aviso:', err);
      toast.error(err.message || 'Erro ao excluir aviso');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const nextNotice = () => {
    if (notices.length <= 1) return;
    
    const nextIndex = (currentIndex + 1) % notices.length;
    setCurrentIndex(nextIndex);
    setCurrentNotice(notices[nextIndex]);
  };

  const prevNotice = () => {
    if (notices.length <= 1) return;
    
    const prevIndex = (currentIndex - 1 + notices.length) % notices.length;
    setCurrentIndex(prevIndex);
    setCurrentNotice(notices[prevIndex]);
  };

  useEffect(() => {
    if (selectedCompany?.id) {
      console.log(`Selected company changed to: ${selectedCompany.id}, will fetch notices`);
      
      // Usar um timeout para debounce
      if (pendingFetchTimeoutRef.current !== null) {
        clearTimeout(pendingFetchTimeoutRef.current);
      }
      
      pendingFetchTimeoutRef.current = window.setTimeout(() => {
        fetchNotices(selectedCompany.id);
        pendingFetchTimeoutRef.current = null;
      }, 800);
    } else {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
    }
    
    return () => {
      if (pendingFetchTimeoutRef.current !== null) {
        clearTimeout(pendingFetchTimeoutRef.current);
        pendingFetchTimeoutRef.current = null;
      }
    };
  }, [selectedCompany?.id, fetchNotices]);

  return {
    notices,
    currentNotice,
    isLoading,
    error,
    fetchNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    nextNotice,
    prevNotice
  };
}
