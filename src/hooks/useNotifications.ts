
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: NoticeAuthor;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar notificações do usuário
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      const notificationsData = data as Notification[];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (err: any) {
      console.error('Erro ao buscar notificações:', err);
      setError(err.message || 'Erro ao buscar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      // Recalcular contador de não lidas
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Erro ao marcar notificação como lida:', err);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (err: any) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  // Configurar inscrição para notificações em tempo real
  useEffect(() => {
    if (!user) return;
    
    // Buscar notificações iniciais
    fetchNotifications();
    
    // Configurar canal para atualizações em tempo real
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Adicionar à lista local
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Mostrar toast para notificar usuário
          toast.info(newNotification.title, {
            description: newNotification.content.substring(0, 100)
          });
        }
      )
      .subscribe();
      
    // Limpar inscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };
}
