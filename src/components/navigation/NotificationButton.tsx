
import React, { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const NotificationButton = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const [open, setOpen] = useState(false);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM, HH:mm", { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-merinno-blue"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-xs font-medium text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 bg-muted/50">
          <h3 className="font-medium">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex justify-center items-center h-20">
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-amber-50 dark:bg-amber-900/10" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium line-clamp-1">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
