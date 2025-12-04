
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const lastFetchTimeRef = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchNotifications = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || selectedCompany?.id;
    
    if (!targetCompanyId) {
      setIsLoading(false);
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimeRef.current < 1000) {
      return;
    }
    
    lastFetchTimeRef.current = now;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar notificações:', err);
      setError(err.message || 'Erro ao buscar notificações');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [selectedCompany?.id]);

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
    // Limpar timeout anterior se existir
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    if (selectedCompany?.id) {
      // Debounce: aguardar um pouco antes de buscar
      fetchTimeoutRef.current = setTimeout(() => {
        fetchNotifications(selectedCompany.id);
      }, 300);
    } else {
      setNotifications([]);
      setIsLoading(false);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [selectedCompany?.id, fetchNotifications]);

  useEffect(() => {
    if (!selectedCompany?.id) return;

    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const channelName = `user-notifications-${selectedCompany.id}`;

    const setupSubscription = async () => {
      // Verificar se já existe uma subscription ativa para evitar duplicatas
      const existingChannel = supabase.getChannels().find(ch => ch.topic === `realtime:${channelName}`);
      if (existingChannel) {
        return; // Já existe uma subscription ativa
      }

      // Obter o ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      
      // Inscrever-se em mudanças na tabela user_notifications
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!mounted) return;
            
            const newNotification = payload.new as Notification;
            
            // Verificar se a notificação é para o usuário atual e da empresa selecionada
            if (newNotification.user_id !== user.id) {
              return;
            }
            
            // Verificar se a notificação é da empresa selecionada
            if (newNotification.company_id !== selectedCompany.id) {
              return;
            }
            
            // Atualizar estado local com a nova notificação
            setNotifications(prev => {
              // Evitar duplicatas
              if (prev.some(n => n.id === newNotification.id)) {
                return prev;
              }
              return [newNotification, ...prev];
            });
            
            // Mostrar toast com a notificação
            toast.info('Nova notificação', {
              description: newNotification.title,
              duration: 5000,
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Subscription ativa
          }
        });
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
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
