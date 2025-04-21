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
      
      const { data, error } = await supabase
        .from('company_notices')
        .select('*')
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const noticesData = data as Notice[];
      
      if (noticesData.length > 0) {
        const authorIds = [...new Set(noticesData.map(n => n.created_by))];
        
        const { data: authors, error: authorsError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar')
          .in('id', authorIds);
          
        if (authorsError) throw authorsError;
        
        const noticesWithAuthors = noticesData.map(notice => {
          const author = authors.find(a => a.id === notice.created_by) as NoticeAuthor;
          return { ...notice, author };
        });
        
        setNotices(noticesWithAuthors);
        
        if (noticesWithAuthors.length > 0) {
          setCurrentNotice(noticesWithAuthors[0]);
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
    if (!user || (companyIds && companyIds.length === 0)) {
      toast.error("Não foi possível criar o aviso. Usuário ou empresa não identificados.");
      return false;
    }

    try {
      setIsLoading(true);

      const inserts = companyIds.map(companyId => ({
        company_id: companyId,
        title: data.title,
        content: data.content,
        type: data.type,
        created_by: user.id,
      }));

      const { error } = await supabase
        .from('company_notices')
        .insert(inserts);

      if (error) throw error;

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

    try {
      setIsLoading(true);
      console.log("Updating notice:", { noticeId, data, userId: user.id });

      if (data.companies && data.companies.length > 0) {
        const { data: existingNotice, error: fetchError } = await supabase
          .from('company_notices')
          .select('company_id')
          .eq('id', noticeId)
          .single();

        if (fetchError) {
          console.error("Failed to fetch existing notice:", fetchError);
          throw fetchError;
        }

        console.log("Existing notice company:", existingNotice.company_id);
        console.log("New company:", data.companies[0]);

        if (existingNotice.company_id !== data.companies[0]) {
          const { error: deleteError } = await supabase
            .from('company_notices')
            .delete()
            .eq('id', noticeId);

          if (deleteError) {
            console.error("Failed to delete old notice:", deleteError);
            throw deleteError;
          }

          const { error: insertError } = await supabase
            .from('company_notices')
            .insert({
              company_id: data.companies[0],
              title: data.title,
              content: data.content,
              type: data.type,
              created_by: user.id,
            });

          if (insertError) {
            console.error("Failed to insert new notice:", insertError);
            throw insertError;
          }

          clearCache(`notices_${existingNotice.company_id}`);
          clearCache(`notices_${data.companies[0]}`);

          await fetchNotices();

          toast.success("Aviso movido para outra empresa com sucesso!");
          return true;
        }
      }

      const { error } = await supabase
        .from('company_notices')
        .update({
          title: data.title,
          content: data.content,
          type: data.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', noticeId);

      if (error) {
        console.error("Failed to update notice:", error);
        throw error;
      }

      if (selectedCompany?.id) {
        clearCache(`notices_${selectedCompany.id}`);
      }

      await fetchNotices();

      if (selectedCompany?.id) {
        const { data: usersToNotify, error: errorUsers } = await supabase
          .from('user_empresa')
          .select('user_id')
          .eq('empresa_id', selectedCompany.id)
          .neq('user_id', user.id);

        if (errorUsers) {
          console.error("Failed to fetch users to notify:", errorUsers);
        }

        if (!errorUsers && usersToNotify && Array.isArray(usersToNotify)) {
          const notifications = usersToNotify.map((u) => ({
            user_id: u.user_id,
            company_id: selectedCompany.id,
            title: `Aviso atualizado: ${data.title}`,
            content: data.content.slice(0, 80) + (data.content.length > 80 ? "..." : ""),
            type: "aviso",
            related_id: noticeId,
            read: false
          }));

          const { error: notifyErr } = await supabase
            .from('user_notifications')
            .insert(notifications);

          if (notifyErr) {
            console.error("Failed to create notifications:", notifyErr);
          } else {
            toast.success("Aviso atualizado e membros notificados!");
          }
        } else {
          toast.success("Aviso atualizado com sucesso!");
        }
      } else {
        console.error("No selected company found when trying to notify users");
        toast.success("Aviso atualizado com sucesso!");
      }
      
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
      
      const { error } = await supabase
        .from('company_notices')
        .delete()
        .eq('id', noticeId)
        .eq('company_id', selectedCompany.id);
      
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
