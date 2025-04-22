import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useCallback } from "react";
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
  companies?: string[]; // Companies property
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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchNotifications = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 1000) {
      console.log("Evitando múltiplas requisições rápidas de notificações");
      return;
    }
    
    setLastFetchTime(now);

    try {
      setIsLoading(true);
      setError(null);

      console.log(`Fetching notifications for company ID: ${targetCompanyId}`);
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`Retrieved ${data?.length || 0} notifications`);
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar notificações:', err);
      setError(err.message || 'Erro ao buscar notificações');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany?.id, lastFetchTime]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prevNotifications => 
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err: any) {
      console.error('Erro ao marcar como lida:', err);
      toast.error(err.message || 'Erro ao marcar como lida');
    }
  };

  const markAllAsRead = async () => {
    if (!notifications.length || !selectedCompany?.id) return;
    
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          unreadIds.includes(n.id) ? { ...n, read: true } : n
        )
      );
      
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (err: any) {
      console.error('Erro ao marcar todas como lidas:', err);
      toast.error(err.message || 'Erro ao marcar todas como lidas');
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (selectedCompany?.id) {
      console.log(`Company changed, fetching notifications for: ${selectedCompany.id}`);
      fetchNotifications(selectedCompany.id);
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [selectedCompany?.id, fetchNotifications]);

  useEffect(() => {
    if (!selectedCompany?.id) return;

    console.log('Setting up real-time notification subscription');
    
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `company_id=eq.${selectedCompany.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
          
          toast.info('Nova notificação', {
            description: (payload.new as Notification).title
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedCompany?.id]);

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount
  };
}
