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

  const fetchNotices = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId) {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
      return;
    }

    const cacheKey = `notices_${targetCompanyId}`;
    
    const cachedData = getCache({ key: cacheKey });
    const hasLocalData = !!cachedData && Array.isArray(cachedData) && cachedData.length > 0;
    
    if (!shouldMakeRequest(forceRefresh, hasLocalData, undefined, cacheKey) || fetchingRef.current) {
      if (hasLocalData) {
        console.log(`Usando dados em cache para avisos da empresa ${targetCompanyId}`);
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
      
      console.log(`Fetching notices for company: ${targetCompanyId}`);
      
      // Buscar IDs de avisos para a empresa específica através da tabela notice_companies
      const { data: noticeRelations, error: relationsError } = await supabase
        .from('notice_companies')
        .select('notice_id')
        .eq('company_id', targetCompanyId);
      
      if (relationsError) throw relationsError;
      
      console.log("Found", relations?.length || 0, "company relations");
      
      if (!noticeRelations || noticeRelations.length === 0) {
        console.log(`No notices found for company: ${targetCompanyId}`);
        setNotices([]);
        setCurrentNotice(null);
        setIsLoading(false);
        completeRequest(false);
        fetchingRef.current = false;
        setCache({ key: cacheKey }, []);
        return;
      }
      
      const noticeIds = noticeRelations.map(item => item.notice_id);
      console.log(`Found ${noticeIds.length} notice IDs for company: ${targetCompanyId}`);
      
      // Buscar detalhes completos dos avisos usando os IDs encontrados
      const { data: noticesData, error: noticesError } = await supabase
        .from('company_notices')
        .select('*')
        .in('id', noticeIds)
        .order('created_at', { ascending: false });
      
      if (noticesError) throw noticesError;
      
      if (!noticesData || noticesData.length === 0) {
        console.log(`No notice data found for IDs: ${noticeIds.join(', ')}`);
        clearCache({ key: cacheKey });
        setNotices([]);
        setCurrentNotice(null);
        setIsLoading(false);
        resetRequestState();
        fetchingRef.current = false;
        return;
      }
      
      console.log(`Retrieved ${noticesData.length} notices`);
      
      // Buscar informações dos autores dos avisos
      const authorIds = [...new Set(noticesData.map(n => n.created_by))];
      
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);
        
      if (authorsError) throw authorsError;
      
      // Adicionar empresas relacionadas a cada aviso
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
      
      completeRequest(false);
    } catch (err: any) {
      console.error('Erro ao buscar avisos:', err);
      setError(err.message || 'Erro ao buscar avisos');
      resetRequestState();
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [selectedCompany?.id, getCache, setCache, clearCache, shouldMakeRequest, startRequest, completeRequest, resetRequestState]);

  const createNotice = async (data: NoticeFormData) => {
    if (!user || !data.companies || data.companies.length === 0) {
      toast.error("Não foi possível criar o aviso. Usuário ou empresa não identificados.");
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Criando aviso para empresas:", data.companies);

      // Criar o aviso principal - use a primeira empresa como referência principal
      const { data: newNotice, error } = await supabase
        .from('company_notices')
        .insert({
          title: data.title,
          content: data.content,
          type: data.type,
          created_by: user.id,
          company_id: data.companies[0], // Usando a primeira empresa como referência principal
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (!newNotice || !newNotice.id) {
        throw new Error("Erro ao criar aviso: ID do aviso não retornado");
      }

      // Criar relações para todas as empresas selecionadas
      const noticeRelations = data.companies.map(companyId => ({
        notice_id: newNotice.id,
        company_id: companyId
      }));

      const { error: relationsError } = await supabase
        .from('notice_companies')
        .insert(noticeRelations);

      if (relationsError) throw relationsError;

      // Criar notificações para todos os usuários de cada empresa
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

      // Limpar cache para todas as empresas afetadas
      for (const companyId of data.companies) {
        clearCache({ key: `notices_${companyId}` });
      }

      // Atualizar avisos após a criação
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

      // Atualizar dados do aviso
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

      // Obter relações de empresa existentes
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

      // Remover empresas que não estão mais relacionadas
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

      // Adicionar novas empresas relacionadas
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

      // Criar notificações para usuários das novas empresas
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

      // Limpar cache para todas as empresas afetadas
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
      
      // Obter empresas relacionadas antes de excluir
      const { data: relatedCompanies, error: relatedError } = await supabase
        .from('notice_companies')
        .select('company_id')
        .eq('notice_id', noticeId);
        
      if (relatedError) throw relatedError;
      
      // Excluir o aviso
      const { error } = await supabase
        .from('company_notices')
        .delete()
        .eq('id', noticeId);
      
      if (error) throw error;
      
      // Limpar cache para todas as empresas relacionadas
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
      
      debouncedRequest(() => {
        fetchNotices(selectedCompany.id);
      }, 300);
    } else {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
    }
  }, [selectedCompany?.id, debouncedRequest]);

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
