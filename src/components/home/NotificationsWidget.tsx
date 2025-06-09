
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Eye } from "lucide-react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AllNoticesDialog } from "./AllNoticesDialog";
import { Company } from "@/types/company";

export const NotificationsWidget = () => {
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Load selected company from localStorage
  useEffect(() => {
    const loadSelectedCompany = () => {
      try {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
          const company = JSON.parse(storedCompany);
          console.log('[NotificationsWidget] Loading selected company:', company.nome);
          setSelectedCompany(company);
        }
      } catch (error) {
        console.error('[NotificationsWidget] Error loading selected company:', error);
      }
    };

    loadSelectedCompany();
  }, []);

  // Listen for company selection events
  useEffect(() => {
    const handleCompanyEvents = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[NotificationsWidget] Company event received, updating to:', company.nome);
      setSelectedCompany(company);
    };

    window.addEventListener('company-selected', handleCompanyEvents as EventListener);
    window.addEventListener('company-changed', handleCompanyEvents as EventListener);
    window.addEventListener('company-content-reload', handleCompanyEvents as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanyEvents as EventListener);
      window.removeEventListener('company-changed', handleCompanyEvents as EventListener);
      window.removeEventListener('company-content-reload', handleCompanyEvents as EventListener);
    };
  }, []);

  const { 
    notices, 
    isLoading, 
    error,
    fetchNotices
  } = useCompanyNotices();

  console.log('[NotificationsWidget] Rendering with company:', selectedCompany?.nome, 'notices:', notices.length);

  const recentNotices = notices.slice(0, 3);

  // Calculate unread count from notices (assuming notices don't have is_read property)
  const unreadCount = notices.length; // For now, consider all notices as unread

  // Since markAsRead doesn't exist in the hook, we'll remove the functionality for now
  const handleMarkAsRead = async (noticeId: string) => {
    console.log('Mark as read not implemented yet:', noticeId);
  };

  // Trigger fetch when company changes
  useEffect(() => {
    if (selectedCompany?.id) {
      fetchNotices(selectedCompany.id);
    }
  }, [selectedCompany?.id, fetchNotices]);

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Avisos da Empresa
            {selectedCompany && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({selectedCompany.nome})
              </span>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : !selectedCompany ? (
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa para ver os avisos
            </p>
          ) : recentNotices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aviso disponível</p>
          ) : (
            <div className="space-y-3">
              {recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 border rounded-lg bg-blue-50 border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notice.created_at), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notice.id)}
                      className="ml-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {notices.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllNotices(true)}
                  className="w-full mt-2"
                >
                  Ver todos os avisos ({notices.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AllNoticesDialog
        open={showAllNotices}
        onOpenChange={setShowAllNotices}
      />
    </>
  );
};
