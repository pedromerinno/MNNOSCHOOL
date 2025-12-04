import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { NotificationsMenu } from "@/components/ui/notifications-menu";

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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.type === 'course_created' && notification.related_id) {
      navigate(`/courses/${notification.related_id}`);
    } else if (notification.type === 'lesson_created' && notification.related_id) {
      // Navegação para aula pode ser implementada quando necessário
    } else if (notification.type === 'discussion_created' && notification.related_id) {
      navigate(`/community?discussion=${notification.related_id}`);
    } else if (notification.type === 'access_created' && notification.related_id) {
      navigate('/access');
    }
    
    setOpen(false);
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
      <DropdownMenuContent align="end" className="w-[520px] p-0 max-w-[95vw]">
        <NotificationsMenu
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
          variant="dropdown"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
