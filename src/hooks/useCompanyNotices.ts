
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "./useCompanies";
import { Notice } from "@/hooks/useNotifications";
import { toast } from "sonner";

// Add the missing NoticeFormData interface
export interface NoticeFormData {
  title: string;
  content: string;
  type: 'informativo' | 'urgente' | 'padrão';
  companies: string[];
}

// Define the interface for profile data
interface ProfileData {
  display_name: string | null;
  avatar: string | null;
}

export function useCompanyNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCompany } = useCompanies();

  // Current notice getter
  const currentNotice = notices[currentNoticeIndex];

  // Fetch all notices
  const fetchNotices = useCallback(async (companyId?: string, silent: boolean = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId) {
      setIsLoading(false);
      return;
    }

    try {
      if (!silent) setIsLoading(true);
      setError(null);

      console.log(`Fetching notices for company ID: ${targetCompanyId}`);
      
      const { data, error: fetchError } = await supabase
        .from('company_notices')
        .select(`
          id,
          company_id,
          title,
          content,
          type,
          created_at,
          created_by,
          updated_at,
          profiles:created_by (
            display_name,
            avatar
          )
        `)
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      console.log(`Retrieved ${data?.length || 0} notices`);
      
      // Format notices with author data - fix typing issues with proper type assertions
      const formattedNotices = (data || []).map(notice => {
        // Use a type guard to safely handle the profiles data
        const profileData = notice.profiles as unknown;
        const typedProfileData = typeof profileData === 'object' && profileData !== null 
          ? profileData as ProfileData 
          : { display_name: null, avatar: null };
        
        return {
          ...notice,
          author: {
            id: notice.created_by,
            display_name: typedProfileData.display_name || null,
            avatar: typedProfileData.avatar || null
          }
        };
      });

      setNotices(formattedNotices);
      setCurrentNoticeIndex(0); // Reset to first notice
      
    } catch (err: any) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Error fetching notices');
      setNotices([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [selectedCompany?.id]);

  // Setup realtime subscription when component mounts or company changes
  useEffect(() => {
    if (!selectedCompany?.id) return;

    console.log('Setting up realtime subscription for notices');

    const channel = supabase.channel('company_notices_changes')
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'company_notices',
        filter: `company_id=eq.${selectedCompany.id}`
      }, async (payload) => {
        console.log('Received notice change:', payload);

        // Fetch fresh data to ensure we have complete records with profiles
        await fetchNotices(selectedCompany.id, true);

        // Show toast notification based on the event
        if (payload.eventType === 'INSERT') {
          toast.info('Novo aviso disponível!');
        } else if (payload.eventType === 'UPDATE') {
          toast.info('Um aviso foi atualizado.');
        } else if (payload.eventType === 'DELETE') {
          toast.info('Um aviso foi removido.');
        }
      })
      .subscribe((status) => {
        console.log('Notice subscription status:', status);
      });

    // Initial fetch
    fetchNotices(selectedCompany.id);

    return () => {
      console.log('Cleaning up notice subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedCompany?.id, fetchNotices]);

  // Navigation functions
  const nextNotice = useCallback(() => {
    if (currentNoticeIndex < notices.length - 1) {
      setCurrentNoticeIndex(prev => prev + 1);
    }
  }, [currentNoticeIndex, notices.length]);

  const prevNotice = useCallback(() => {
    if (currentNoticeIndex > 0) {
      setCurrentNoticeIndex(prev => prev - 1);
    }
  }, [currentNoticeIndex]);

  // Delete notice function
  const deleteNotice = async (noticeId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('company_notices')
        .delete()
        .eq('id', noticeId);

      if (deleteError) throw deleteError;
      
      toast.success('Aviso removido com sucesso!');
      return true;
      
    } catch (err: any) {
      console.error('Error deleting notice:', err);
      toast.error('Erro ao remover aviso');
      return false;
    }
  };

  // Add create notice function
  const createNotice = async (formData: NoticeFormData): Promise<boolean> => {
    if (!formData.companies || formData.companies.length === 0) {
      toast.error('Selecione pelo menos uma empresa');
      return false;
    }

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // Process each company in the list
      const promises = formData.companies.map(async (companyId) => {
        const { error } = await supabase
          .from('company_notices')
          .insert({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            company_id: companyId,
            created_by: userId
          });

        if (error) throw error;
      });

      await Promise.all(promises);
      
      // Refresh notices
      await fetchNotices(selectedCompany?.id, true);
      
      return true;
    } catch (err: any) {
      console.error('Error creating notice:', err);
      toast.error(`Erro ao criar aviso: ${err.message}`);
      return false;
    }
  };

  // Add update notice function
  const updateNotice = async (noticeId: string, formData: NoticeFormData): Promise<boolean> => {
    if (!formData.companies || formData.companies.length === 0) {
      toast.error('Selecione pelo menos uma empresa');
      return false;
    }

    try {
      // Update notice
      const { error } = await supabase
        .from('company_notices')
        .update({
          title: formData.title,
          content: formData.content,
          type: formData.type
        })
        .eq('id', noticeId);

      if (error) throw error;
      
      // Refresh notices
      await fetchNotices(selectedCompany?.id, true);
      
      return true;
    } catch (err: any) {
      console.error('Error updating notice:', err);
      toast.error(`Erro ao atualizar aviso: ${err.message}`);
      return false;
    }
  };

  return {
    notices,
    currentNotice,
    isLoading,
    error,
    nextNotice,
    prevNotice,
    fetchNotices,
    deleteNotice,
    createNotice, // Added this
    updateNotice  // Added this
  };
}
