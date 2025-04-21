
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "./useCompanies";
import { toast } from "sonner";
import { Notice, NoticeAuthor } from "./useNotifications";
import { useCache } from "@/hooks/useCache";

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
  const { clearCache } = useCache();

  const fetchNotices = async (companyId?: string) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId) {
      setNotices([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Obter avisos associados à empresa através da tabela de relação notice_companies
      const { data, error } = await supabase
        .from('notice_companies')
        .select('notice_id')
        .eq('company_id', targetCompanyId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setNotices([]);
        setCurrentNotice(null);
        setIsLoading(false);
        return;
      }
      
      const noticeIds = data.map(item => item.notice_id);
      
      // Buscar os detalhes completos dos avisos
      const { data: noticesData, error: noticesError } = await supabase
        .from('company_notices')
        .select('*')
        .in('id', noticeIds)
        .order('created_at', { ascending: false });
      
      if (noticesError) throw noticesError;
      
      if (noticesData.length > 0) {
        const authorIds = [...new Set(noticesData.map(n => n.created_by))];
        
        const { data: authors, error: authorsError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar')
          .in('id', authorIds);
          
        if (authorsError) throw authorsError;
        
        // Para cada aviso, buscar todas as empresas associadas a ele
        const noticesWithCompanies = await Promise.all(noticesData.map(async (notice) => {
          const { data: companies } = await supabase
            .from('notice_companies')
            .select('company_id')
            .eq('notice_id', notice.id);
          
          const companyIds = companies ? companies.map(c => c.company_id) : [];
          
          const author = authors.find(a => a.id === notice.created_by) as NoticeAuthor;
          return { 
            ...notice, 
            author,
            companies: companyIds
          };
        }));
        
        setNotices(noticesWithCompanies);
        
        if (noticesWithCompanies.length > 0) {
          setCurrentNotice(noticesWithCompanies[0]);
          setCurrentIndex(0);
        } else {
          setCurrentNotice(null);
        }
      } else {
        setNotices([]);
        setCurrentNotice(null);
      }
    } catch (err: any) {
      console.error('Erro ao buscar avisos:', err);
      setError(err.message || 'Erro ao buscar avisos');
    } finally {
      setIsLoading(false);
    }
  };

  const createNotice = async (data: NoticeFormData, companyIds?: string[]) => {
    if (!user || !companyIds || companyIds.length === 0) {
      toast.error("Não foi possível criar o aviso. Usuário ou empresa não identificados.");
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Criando aviso para empresas:", companyIds);

      // Criar o aviso na tabela company_notices
      const { data: newNotice, error } = await supabase
        .from('company_notices')
        .insert({
          company_id: companyIds[0], // Mantemos um valor para compatibilidade com o esquema atual
          title: data.title,
          content: data.content,
          type: data.type,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (!newNotice || !newNotice.id) {
        throw new Error("Erro ao criar aviso: ID do aviso não retornado");
      }

      // Criar as relações entre o aviso e as empresas selecionadas
      const noticeRelations = companyIds.map(companyId => ({
        notice_id: newNotice.id,
        company_id: companyId
      }));

      const { error: relationsError } = await supabase
        .from('notice_companies')
        .insert(noticeRelations);

      if (relationsError) throw relationsError;

      // Notificar os usuários das empresas
      for (const companyId of companyIds) {
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

      await fetchNotices();

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

      // 1. Atualizar os dados básicos do aviso
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

      // 2. Obter as empresas atualmente associadas ao aviso
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

      // 3. Remover relações que não existem mais
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

      // 4. Adicionar novas relações
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

      // 5. Notificar os usuários das novas empresas
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

      // 6. Limpar cache e recarregar
      if (selectedCompany?.id) {
        clearCache(`notices_${selectedCompany.id}`);
      }

      await fetchNotices();
      
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
      
      // Ao excluir o aviso, as relações serão automaticamente excluídas devido à restrição ON DELETE CASCADE
      const { error } = await supabase
        .from('company_notices')
        .delete()
        .eq('id', noticeId);
      
      if (error) throw error;
      
      await fetchNotices();
      
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
      fetchNotices(selectedCompany.id);
    } else {
      setNotices([]);
      setCurrentNotice(null);
      setIsLoading(false);
    }
  }, [selectedCompany?.id]);

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
