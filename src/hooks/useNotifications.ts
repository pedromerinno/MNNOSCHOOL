import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useCompanies } from "./useCompanies";
import { toast } from "sonner";

export interface NoticeAuthor {
  id: string;
  display_name: string | null;
  avatar: string | null;
}

export interface Notice {
  id: string;
  company_id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  author?: NoticeAuthor;
  companies?: string[]; // Add the companies property
}

export interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  content: string;
  type: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { selectedCompany } = useCompanies();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (companyId?: string) => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar notificações:', err);
      setError(err.message || 'Erro ao buscar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err: any) {
      console.error('Erro ao marcar como lida:', err);
      toast.error(err.message || 'Erro ao marcar como lida');
    }
  };

  useEffect(() => {
    if (selectedCompany?.id) {
      fetchNotifications(selectedCompany.id);
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [selectedCompany?.id]);

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
  };
}
