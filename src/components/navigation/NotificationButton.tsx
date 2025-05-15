
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export const NotificationButton = () => {
  const { notifications, isLoading, markAsRead, unreadCount, markAllAsRead, fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRefreshNotifications = () => {
      console.log("Refreshing notifications from event");
      fetchNotifications(undefined, true);
    };

    window.addEventListener('refresh-notifications', handleRefreshNotifications);
    window.addEventListener('course-created', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refresh-notifications', handleRefreshNotifications);
      window.removeEventListener('course-created', handleRefreshNotifications);
    };
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_created':
        return '📚';
      case 'lesson_created':
        return '📝';
      case 'access_created':
        return '🔑';
      case 'discussion_created':
        return '💬';
      case 'notice':
      default:
        return '📢';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    if (notification.type === 'course_created' && notification.related_id) {
      navigate(`/courses/${notification.related_id}`);
    } else if (notification.type === 'lesson_created' && notification.related_id) {
    } else if (notification.type === 'discussion_created' && notification.related_id) {
      navigate(`/community?discussion=${notification.related_id}`);
    } else if (notification.type === 'access_created' && notification.related_id) {
      navigate('/access');
    }
    
    setOpen(false);
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Nenhuma notificação</div>
          ) : (
            notifications.map((notification: Notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg" role="img" aria-label="notification type">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{notification.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notification.content}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
