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

export function useCompanyNotices(showOnlyVisible: boolean = true) {
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

  const cleanupInvalidRelations = useCallback(async (companyId: string, noticeIds: string[]) => {
    if (cleanupInProgressRef.current) return;
    
    const now = Date.now();
    if (now - lastCleanupTimeRef.current < 60000) return;
    
    try {
      cleanupInProgressRef.current = true;
      lastCleanupTimeRef.current = now;
      
      console.log(`Attempting to clean up invalid notice relations for company: ${companyId}`);
      const { error: cleanupError } = await supabase
        .from('notice_companies')
        .delete()
        .eq('company_id', companyId)
        .in('notice_id', noticeIds);
        
      if (cleanupError) {
        console.error("Error cleaning up invalid notice relations:", cleanupError);
      } else {
        console.log("Successfully cleaned up invalid notice relations");
      }
    } catch (cleanupErr) {
      console.error("Failed to clean up invalid notice relations:", cleanupErr);
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, []);

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

    const cacheKey = `notices_${targetCompanyId}_${showOnlyVisible ? 'visible' : 'all'}`;
    
    const cachedData = getCache({ key: cacheKey });
    const hasLocalData = !!cachedData && Array.isArray(cachedData) && cachedData.length > 0;
    
    // Para admin (showOnlyVisible=false), sempre fazer a requisição para garantir dados atualizados
    if (!forceRefresh && showOnlyVisible && !shouldMakeRequest(forceRefresh, hasLocalData, noticesInstanceIdRef.current, cacheKey) || fetchingRef.current) {
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
      
      console.log(`Fetching notices for company: ${targetCompanyId}, showOnlyVisible: ${showOnlyVisible}`);
      
      const { data: noticeRelations, error: relationsError } = await supabase
        .from('notice_companies')
        .select('notice_id')
        .eq('company_id', targetCompanyId);
      
      if (relationsError) throw relationsError;
      
      console.log("Found", noticeRelations?.length || 0, "company relations");
      
      if (!noticeRelations || noticeRelations.length === 0) {
        console.log(`No notices found for company: ${targetCompanyId}`);
        setNotices([]);
        setCurrentNotice(null);
        setIsLoading(false);
        completeRequest();
        fetchingRef.current = false;
        setCache({ key: cacheKey }, []);
        return;
      }
      
      const noticeIds = noticeRelations.map(item => item.notice_id);
      console.log(`Found ${noticeIds.length} notice IDs for company: ${targetCompanyId}`);
      
      // Build query based on visibility filter
      let query = supabase
        .from('company_notices')
        .select('*')
        .in('id', noticeIds);
      
      // Apply visibility filter only if showOnlyVisible is true
      if (showOnlyVisible) {
        console.log('Applying visibility filter - showing only visible notices');
        query = query.eq('visibilidade', true);
      } else {
        console.log('NOT applying visibility filter - showing all notices including hidden ones');
      }
      
      const { data: noticesData, error: noticesError } = await query
        .order('created_at', { ascending: false });
      
      if (noticesError) throw noticesError;
      
      if (!noticesData || noticesData.length === 0) {
        const logMessage = showOnlyVisible 
          ? `No visible notice data found for IDs: ${noticeIds.join(', ')}`
          : `No notice data found for IDs: ${noticeIds.join(', ')}`;
        console.log(logMessage);
        
        setTimeout(() => {
          cleanupInvalidRelations(targetCompanyId, noticeIds).catch(err => {
            console.error("Background cleanup error:", err);
          });
        }, 100);
        
        clearCache({ key: cacheKey });
        setNotices([]);
        setCurrentNotice(null);
        setIsLoading(false);
        resetRequestState();
        fetchingRef.current = false;
        return;
      }
      
      const foundNoticeIds = new Set(noticesData.map(n => n.id));
      const missingNoticeIds = noticeIds.filter(id => !foundNoticeIds.has(id));
      
      if (missingNoticeIds.length > 0) {
        setTimeout(() => {
          cleanupInvalidRelations(targetCompanyId, missingNoticeIds).catch(err => {
            console.error("Background cleanup error:", err);
          });
        }, 100);
      }
      
      console.log(`Retrieved ${noticesData.length} notices (showOnlyVisible: ${showOnlyVisible})`);
      
      const authorIds = [...new Set(noticesData.map(n => n.created_by))];
      
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);
        
      if (authorsError) throw authorsError;
      
      const noticesWithCompaniesPromises = noticesData.map(async (notice) => {
        const { data: companies } = await supabase
          .from('notice_companies')
          .select('company_id')
          .eq('notice_id', notice.id);
        
        const companyIds = companies ? companies.map(c => c.company_id) : [];
        
        const author = authors?.find(a => a.id === notice.created_by) as NoticeAuthor;
        return { 
          ...notice, 
          author,
          companies: companyIds
        };
      });
      
      const noticesWithCompanies = await Promise.all(noticesWithCompaniesPromises);
      
      setCache({ key: cacheKey }, noticesWithCompanies);
      
      setNotices(noticesWithCompanies);
      
      if (noticesWithCompanies.length > 0) {
        setCurrentNotice(noticesWithCompanies[0]);
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
    resetRequestState,
    cleanupInvalidRelations,
    showOnlyVisible
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
        clearCache({ key: `notices_${companyId}_visible` });
        clearCache({ key: `notices_${companyId}_all` });
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
        clearCache({ key: `notices_${companyId}_visible` });
        clearCache({ key: `notices_${companyId}_all` });
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
          clearCache({ key: `notices_${item.company_id}_visible` });
          clearCache({ key: `notices_${item.company_id}_all` });
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
