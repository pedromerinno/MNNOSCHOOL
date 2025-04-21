
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "./useCompanies";
import { toast } from "sonner";
import { Notice, NoticeAuthor } from "./useNotifications";

export interface NoticeFormData {
  title: string;
  content: string;
  type: string;
}

export function useCompanyNotices() {
  const { user } = useAuth();
  const { selectedCompany } = useCompanies();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar avisos da empresa
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
      
      // Buscar informações dos autores
      if (noticesData.length > 0) {
        const authorIds = [...new Set(noticesData.map(n => n.created_by))];
        
        const { data: authors, error: authorsError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar')
          .in('id', authorIds);
          
        if (authorsError) throw authorsError;
        
        // Associar autores aos avisos
        const noticesWithAuthors = noticesData.map(notice => {
          const author = authors.find(a => a.id === notice.created_by) as NoticeAuthor;
          return { ...notice, author };
        });
        
        setNotices(noticesWithAuthors);
        
        // Definir aviso atual
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

  // Criar novo aviso
  const createNotice = async (data: NoticeFormData) => {
    if (!user || !selectedCompany) {
      toast.error("Não foi possível criar o aviso. Usuário ou empresa não identificados.");
      return false;
    }

    try {
      setIsLoading(true);
      
      const { data: newNotice, error } = await supabase
        .from('company_notices')
        .insert({
          company_id: selectedCompany.id,
          title: data.title,
          content: data.content,
          type: data.type,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      await fetchNotices();
      
      toast.success("Aviso criado com sucesso!");
      return true;
    } catch (err: any) {
      console.error('Erro ao criar aviso:', err);
      toast.error(err.message || 'Erro ao criar aviso');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar aviso existente
  const updateNotice = async (noticeId: string, data: NoticeFormData) => {
    if (!user || !selectedCompany) {
      toast.error("Não foi possível atualizar o aviso. Usuário ou empresa não identificados.");
      return false;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('company_notices')
        .update({
          title: data.title,
          content: data.content,
          type: data.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', noticeId)
        .eq('company_id', selectedCompany.id);
      
      if (error) throw error;
      
      // Atualizar lista local
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

  // Excluir aviso
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
      
      // Atualizar lista local
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

  // Navegar para o próximo aviso
  const nextNotice = () => {
    if (notices.length <= 1) return;
    
    const nextIndex = (currentIndex + 1) % notices.length;
    setCurrentIndex(nextIndex);
    setCurrentNotice(notices[nextIndex]);
  };

  // Navegar para o aviso anterior
  const prevNotice = () => {
    if (notices.length <= 1) return;
    
    const prevIndex = (currentIndex - 1 + notices.length) % notices.length;
    setCurrentIndex(prevIndex);
    setCurrentNotice(notices[prevIndex]);
  };

  // Buscar avisos quando a empresa selecionada mudar
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
