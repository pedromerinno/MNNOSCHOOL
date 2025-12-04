import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BookOpen, 
  FileText, 
  Key, 
  MessageSquare, 
  Bell, 
  CheckCircle2, 
  Settings2,
  BellRing
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

// Tipo adaptado para notificações do sistema
interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  content: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  related_id: string | null;
}

interface NotificationsMenuProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  variant?: 'card' | 'dropdown';
}

// Função para mapear tipo de notificação para ação e ícone
const getNotificationMetadata = (type: string) => {
  switch (type) {
    case 'course_created':
      return {
        action: 'criou um novo curso',
        icon: BookOpen,
        color: 'text-blue-500',
      };
    case 'lesson_created':
      return {
        action: 'adicionou uma nova aula',
        icon: FileText,
        color: 'text-purple-500',
      };
    case 'access_created':
      return {
        action: 'compartilhou um novo acesso',
        icon: Key,
        color: 'text-emerald-500',
      };
    case 'discussion_created':
      return {
        action: 'criou uma discussão',
        icon: MessageSquare,
        color: 'text-orange-500',
      };
    case 'notice':
    default:
      return {
        action: 'publicou um aviso',
        icon: Bell,
        color: 'text-amber-500',
      };
  }
};

// Função para formatar data
const formatNotificationDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // Se for hoje, mostrar apenas hora
    if (diffInHours < 24 && date.getDate() === now.getDate()) {
      return format(date, "HH:mm", { locale: ptBR });
    }
    
    // Se for esta semana, mostrar dia da semana e hora
    if (diffInHours < 168) {
      return format(date, "EEEE HH:mm", { locale: ptBR });
    }
    
    // Caso contrário, mostrar data completa
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return '';
  }
};

// Função para calcular "time ago"
const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return 'recentemente';
  }
};

function NotificationItemComponent({ 
  notification, 
  onMarkAsRead,
  onNotificationClick 
}: { 
  notification: NotificationItemData;
  onMarkAsRead?: (id: string) => void;
  onNotificationClick?: () => void;
}) {
  const metadata = getNotificationMetadata(notification.type);
  const Icon = metadata.icon;
  
  const handleClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'S';
  };

  return (
    <div 
      className={cn(
        "w-full py-4 first:pt-0 last:pb-0 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className={cn("size-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0", metadata.color)}>
          <Icon className="size-5" />
        </div>

        <div className="flex flex-1 flex-col space-y-2 min-w-0">
          <div className="w-full items-start">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="text-sm flex-1 min-w-0">
                <div className="font-medium text-foreground">{notification.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {notification.content}
                </div>
              </div>
              {!notification.isRead && (
                <div className="size-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="text-xs text-muted-foreground">
                {formatNotificationDate(notification.timestamp)}
              </div>
              <div className="text-xs text-muted-foreground">
                {notification.timeAgo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const NotificationsMenu = ({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  variant = 'card',
}: NotificationsMenuProps) => {
  const [activeTab, setActiveTab] = React.useState<string>("all");

  // Mapear notificações do sistema para formato do componente
  const mappedNotifications: NotificationItemData[] = React.useMemo(() => {
    return notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      content: notif.content,
      timestamp: notif.created_at,
      timeAgo: formatTimeAgo(notif.created_at),
      isRead: notif.read,
      related_id: notif.related_id,
    }));
  }, [notifications]);

  // Contar notificações por tipo
  const courseCount = mappedNotifications.filter(n => n.type === 'course_created').length;
  const lessonCount = mappedNotifications.filter(n => n.type === 'lesson_created').length;
  const noticeCount = mappedNotifications.filter(n => n.type === 'notice').length;
  const unreadCount = mappedNotifications.filter(n => !n.isRead).length;

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "courses":
        return mappedNotifications.filter(n => n.type === 'course_created');
      case "lessons":
        return mappedNotifications.filter(n => n.type === 'lesson_created');
      case "notices":
        return mappedNotifications.filter(n => n.type === 'notice');
      default:
        return mappedNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const headerContent = (
    <div className="flex items-center justify-between">
      <h3 className="text-base leading-none font-semibold tracking-[-0.006em]">
        Suas notificações
      </h3>
      <div className="flex items-center gap-2">
        {onMarkAllAsRead && unreadCount > 0 && (
          <Button 
            className="size-8" 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            title="Marcar todas como lidas"
          >
            <CheckCircle2 className="size-4.5 text-muted-foreground" />
          </Button>
        )}
        <Button className="size-8" variant="ghost" size="icon" title="Configurações">
          <Settings2 className="size-4.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );

  const tabsContent = (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full flex-col justify-start"
    >
      <div className="flex items-center justify-between">
        <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 [&_button]:gap-1.5">
          <TabsTrigger value="all">
            Todas
            {mappedNotifications.length > 0 && (
              <Badge variant="secondary">{mappedNotifications.length}</Badge>
            )}
          </TabsTrigger>
          {courseCount > 0 && (
            <TabsTrigger value="courses">
              Cursos <Badge variant="secondary">{courseCount}</Badge>
            </TabsTrigger>
          )}
          {lessonCount > 0 && (
            <TabsTrigger value="lessons">
              Aulas <Badge variant="secondary">{lessonCount}</Badge>
            </TabsTrigger>
          )}
          {noticeCount > 0 && (
            <TabsTrigger value="notices">
              Avisos <Badge variant="secondary">{noticeCount}</Badge>
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </Tabs>
  );

  const notificationsContent = (
    <div className="space-y-0 divide-y divide-dashed divide-border">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-2.5 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <BellRing className="size-6 text-muted-foreground animate-pulse" />
          </div>
          <p className="text-sm font-medium tracking-[-0.006em] text-muted-foreground">
            Carregando notificações...
          </p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => {
          const originalNotification = notifications.find(n => n.id === notification.id);
          return (
            <NotificationItemComponent
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onNotificationClick={() => {
                if (originalNotification && onNotificationClick) {
                  onNotificationClick(originalNotification);
                }
              }}
            />
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2.5 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Bell className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium tracking-[-0.006em] text-muted-foreground">
            Nenhuma notificação ainda.
          </p>
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="flex w-full max-w-[520px] flex-col gap-6 p-4 shadow-none md:p-8">
        <CardHeader className="p-0">
          {headerContent}
          <div className="mt-4">
            {tabsContent}
          </div>
        </CardHeader>
        <CardContent className="h-full p-0 max-h-[500px] overflow-y-auto">
          {notificationsContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex w-full max-w-[520px] flex-col gap-4">
      <div className="px-4 pt-4">
        {headerContent}
      </div>
      <div className="px-4">
        {tabsContent}
      </div>
      <div className="h-full max-h-[500px] overflow-y-auto px-4 pb-4">
        {notificationsContent}
      </div>
    </div>
  );
};

// Manter o componente original para compatibilidade
export const Component = () => {
  // Este componente original pode ser mantido para referência ou removido
  return null;
};
