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
  data_inicio?: string | null;
  data_fim?: string | null;
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
  const cachingRef = useRef<string | null>(null);

  const fetchNotices = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId || !mountedRef.current) {
      console.log('No company ID or component unmounted, clearing notices');
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
      return;
    }
    
    // Removido: verificação de flag RLS que estava bloqueando carregamento
    
    // Evitar requisições duplicadas
    if (fetchingRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping');
      return;
    }

    const cacheKey = `notices_${targetCompanyId}`;
    
    // Tentar usar cache primeiro se não for refresh forçado
    if (!forceRefresh) {
      const cachedData = getCache<Notice[]>(cacheKey);
      if (cachedData && Array.isArray(cachedData)) {
        console.log(`Using cached notices for company ${targetCompanyId}:`, cachedData.length);
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
      
      console.log(`Fetching notices for company: ${targetCompanyId}`);
      
      // Buscar avisos com limite menor para home
      const { data: noticesData, error: noticesError } = await supabase
        .from('company_notices')
        .select('*')
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false })
        .limit(10); // Reduzir limite para home
      
      if (noticesError) {
        // Se for erro de RLS, tentar continuar sem perfis mas ainda mostrar avisos
        if (noticesError.code === '42P17') {
          console.warn('[useCompanyNotices] RLS error detected, continuing without profiles');
          // Não bloquear completamente - definir dados vazios e continuar
          setNotices([]);
          setCurrentNotice(null);
          setCache(cacheKey, [], 3);
          setIsLoading(false);
          fetchingRef.current = false;
          return;
        }
        console.error('Error fetching notices:', noticesError);
        throw noticesError;
      }
      
      // Verificar se componente ainda está montado
      if (!mountedRef.current) {
        console.log('Component unmounted during notices fetch');
        return;
      }
      
      console.log(`Retrieved ${noticesData?.length || 0} notices:`, noticesData);
      
      if (!noticesData || noticesData.length === 0) {
        console.log('No notices found, setting empty array');
        setNotices([]);
        setCurrentNotice(null);
        setCache(cacheKey, [], 3); // Cache dados vazios por 3 minutos
        setIsLoading(false);
        return;
      }
      
      // Buscar perfis dos autores em uma query separada
      const authorIds = [...new Set(noticesData.map(notice => notice.created_by))];
      console.log('Fetching authors for IDs:', authorIds);
      
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', authorIds);
      
      if (authorsError) {
        // Se for erro de RLS, continuar sem perfis mas ainda mostrar avisos
        if (authorsError.code === '42P17') {
          console.warn('[useCompanyNotices] RLS error detected when fetching authors, continuing without profiles');
          // Continuar sem perfis - notices ainda podem ser exibidos
        } else if (authorsError) {
          console.error('Error fetching authors:', authorsError);
        }
      }
      
      if (!mountedRef.current) {
        console.log('Component unmounted during authors fetch');
        return;
      }
      
      // Log removido para reduzir ruído
      
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
      const noticesWithAuthors = noticesData.map((notice) => {
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
      
      // Log removido para reduzir ruído
      
      // Cache por 3 minutos - evitar cache duplicado no mesmo ciclo
      // Truncar conteúdo grande antes de armazenar para evitar problemas de tamanho
      const noticesToCache = noticesWithAuthors.map(notice => {
        if (notice.content && notice.content.length > 500) {
          return {
            ...notice,
            content: notice.content.substring(0, 500) + '...'
          };
        }
        return notice;
      });

      if (cachingRef.current !== cacheKey) {
        cachingRef.current = cacheKey;
        try {
          setCache(cacheKey, noticesToCache, 3);
          // Resetar após um delay para permitir novo cache se necessário
          setTimeout(() => {
            if (cachingRef.current === cacheKey) {
              cachingRef.current = null;
            }
          }, 1000);
        } catch (cacheError) {
          console.warn('Failed to cache notices:', cacheError);
          cachingRef.current = null;
        }
      }
      
      if (!mountedRef.current) {
        console.log('Component unmounted before setting state');
        return;
      }
      
      setNotices(noticesWithAuthors);
      
      if (noticesWithAuthors.length > 0) {
        setCurrentNotice(noticesWithAuthors[0]);
        setCurrentIndex(0);
      } else {
        setCurrentNotice(null);
      }
      
    } catch (err: any) {
      console.error('Error fetching notices:', err);
      if (mountedRef.current) {
        setError(err.message || 'Erro ao buscar avisos');
        toast.error('Erro ao carregar avisos');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      fetchingRef.current = false;
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
          company_id: data.companies[0],
          data_inicio: data.data_inicio || null,
          data_fim: data.data_fim || null
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
          updated_at: new Date().toISOString(),
          data_inicio: data.data_inicio || null,
          data_fim: data.data_fim || null
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
      // Só buscar se não for a mesma empresa que já foi buscada
      if (lastFetchedCompanyIdRef.current !== selectedCompany.id) {
        console.log(`Selected company changed to: ${selectedCompany.id}, fetching notices`);
        fetchNotices(selectedCompany.id);
      }
    } else {
      console.log('No selected company, clearing notices');
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
      lastFetchedCompanyIdRef.current = null;
    }
    // Remover fetchNotices das dependências para evitar loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.id]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
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
