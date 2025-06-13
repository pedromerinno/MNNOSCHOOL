import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "./useCompanies";
import { toast } from "sonner";
import { Notice, NoticeAuthor } from "./useNotifications";
import { useOptimizedCache } from "@/hooks/useOptimizedCache";

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
  const { getCache, setCache, clearCache } = useOptimizedCache();
  
  const fetchingRef = useRef(false);
  const lastFetchedCompanyIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNotices = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId || !mountedRef.current) {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
      return;
    }
    
    // Cancelar requisição anterior se ainda estiver em andamento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Evitar requisições duplicadas
    if (fetchingRef.current && !forceRefresh) {
      return;
    }

    const cacheKey = `notices_${targetCompanyId}`;
    
    // Tentar usar cache primeiro se não for refresh forçado
    if (!forceRefresh) {
      const cachedData = getCache<Notice[]>(cacheKey);
      if (cachedData && Array.isArray(cachedData)) {
        console.log(`Using cached notices for company ${targetCompanyId}`);
        setNotices(cachedData);
        if (cachedData.length > 0) {
          setCurrentNotice(cachedData[0]);
          setCurrentIndex(0);
        } else {
          setCurrentNotice(null);
        }
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      fetchingRef.current = true;
      lastFetchedCompanyIdRef.current = targetCompanyId;
      
      // Criar novo AbortController para esta requisição
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      console.log(`Fetching notices for company: ${targetCompanyId}`);
      
      // Buscar avisos com dados do autor em uma query separada para evitar erros de join
      const { data: noticesData, error: noticesError } = await supabase
        .from('company_notices')
        .select(`
          id,
          title,
          content,
          type,
          created_at,
          updated_at,
          company_id,
          created_by,
          visibilidade
        `)
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false })
        .limit(50)
        .abortSignal(signal);
      
      if (noticesError) throw noticesError;
      
      // Verificar se componente ainda está montado
      if (!mountedRef.current || signal.aborted) return;
      
      console.log(`Retrieved ${noticesData?.length || 0} notices`);
      
      // Buscar perfis dos autores em uma query separada
      const authorIds = [...new Set(noticesData?.map(notice => notice.created_by) || [])];
      const { data: authorsData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);
      
      if (!mountedRef.current || signal.aborted) return;
      
      // Criar mapa de autores para facilitar o lookup
      const authorsMap = new Map<string, NoticeAuthor>();
      authorsData?.forEach(author => {
        authorsMap.set(author.id, {
          id: author.id,
          display_name: author.display_name || 'Usuário',
          avatar: author.avatar
        });
      });
      
      // Mapear avisos com autores
      const noticesWithAuthors = (noticesData || []).map((notice) => {
        const author = authorsMap.get(notice.created_by) || {
          id: notice.created_by,
          display_name: 'Usuário',
          avatar: null
        };
        
        return { 
          ...notice, 
          author,
          companies: [targetCompanyId]
        };
      });
      
      // Armazenar no cache com expiração de 3 minutos para melhor performance
      setCache(cacheKey, noticesWithAuthors, 3);
      
      if (!mountedRef.current || signal.aborted) return;
      
      setNotices(noticesWithAuthors);
      
      if (noticesWithAuthors.length > 0) {
        setCurrentNotice(noticesWithAuthors[0]);
        setCurrentIndex(0);
      } else {
        setCurrentNotice(null);
      }
      
    } catch (err: any) {
      // Não mostrar erro se foi cancelado
      if (err.name === 'AbortError') return;
      
      console.error('Erro ao buscar avisos:', err);
      if (mountedRef.current) {
        setError(err.message || 'Erro ao buscar avisos');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      fetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [selectedCompany?.id, getCache, setCache]);

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

      // Criar relações com empresas se necessário
      if (data.companies.length > 1) {
        const noticeRelations = data.companies.slice(1).map(companyId => ({
          notice_id: newNotice.id,
          company_id: companyId
        }));

        const { error: relationsError } = await supabase
          .from('notice_companies')
          .insert(noticeRelations);

        if (relationsError) throw relationsError;
      }

      // Criar notificações para usuários
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

      // Limpar cache das empresas afetadas
      for (const companyId of data.companies) {
        clearCache(`notices_${companyId}`);
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
        clearCache(`notices_${companyId}`);
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
          clearCache(`notices_${item.company_id}`);
        }
      }
      
      clearCache(`notices_${selectedCompany.id}`);
      
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

  // Effect otimizado para buscar avisos quando empresa muda
  useEffect(() => {
    if (selectedCompany?.id) {
      console.log(`Selected company changed to: ${selectedCompany.id}, fetching notices`);
      // Debounce para evitar múltiplas chamadas
      const timeoutId = setTimeout(() => {
        fetchNotices(selectedCompany.id);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    } else {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
    }
  }, [selectedCompany?.id, fetchNotices]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
