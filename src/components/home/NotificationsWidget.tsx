
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Eye, ChevronRight, Building2 } from "lucide-react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AllNoticesDialog } from "./AllNoticesDialog";
import { NoticeDetailDialog } from "./NoticeDetailDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { EmptyState } from "@/components/ui/empty-state";

export const NotificationsWidget = () => {
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [showNoticeDetail, setShowNoticeDetail] = useState(false);
  const { selectedCompany } = useCompanies();
  const lastFetchedCompanyRef = useRef<string | null>(null);
  const fetchInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  const { 
    notices, 
    isLoading, 
    error,
    fetchNotices
  } = useCompanyNotices();

  // Use ref to store fetchNotices to avoid recreating effect
  const fetchNoticesRef = useRef(fetchNotices);
  useEffect(() => {
    fetchNoticesRef.current = fetchNotices;
  }, [fetchNotices]);

  // Filtrar apenas avisos visíveis para o widget da home
  const visibleNotices = notices.filter(notice => (notice as any).visibilidade !== false);
  const recentNotices = visibleNotices.slice(0, 2); // Reduzir para 2 avisos
  const unreadCount = visibleNotices.length;

  const handleNoticeClick = (notice: any) => {
    setSelectedNotice(notice);
    setShowNoticeDetail(true);
  };

  // Função otimizada para buscar avisos
  const fetchNoticesForCompany = async (companyId: string) => {
    // Evitar requisições duplicadas
    if (
      fetchInProgressRef.current || 
      lastFetchedCompanyRef.current === companyId ||
      !mountedRef.current
    ) {
      return;
    }
    
    fetchInProgressRef.current = true;
    lastFetchedCompanyRef.current = companyId;
    
    try {
      await fetchNoticesRef.current(companyId, false); // usar cache quando possível
    } finally {
      if (mountedRef.current) {
        fetchInProgressRef.current = false;
      }
    }
  };

  // Effect otimizado para buscar avisos quando empresa muda
  useEffect(() => {
    if (selectedCompany?.id && mountedRef.current) {
      // Carregamento imediato sem debounce
      fetchNoticesForCompany(selectedCompany.id);
    } else {
      // Resetar estado quando não há empresa selecionada
      lastFetchedCompanyRef.current = null;
      fetchInProgressRef.current = false;
    }
  }, [selectedCompany?.id]); // Removed fetchNotices from dependencies

  // Cleanup otimizado
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      fetchInProgressRef.current = false;
    };
  }, []);

  return (
    <>
      <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="p-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium dark:text-white text-left">Avisos da Empresa</h3>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="px-8 pb-8 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>
            ) : !selectedCompany ? (
              <div className="flex justify-center py-8">
                <EmptyState
                  title="Selecione uma empresa"
                  icons={[Building2]}
                  className="border-0 bg-transparent hover:bg-transparent p-8 max-w-none"
                />
              </div>
            ) : recentNotices.length === 0 ? (
              <div className="flex justify-center py-8">
                <EmptyState
                  title="Nenhum aviso disponível"
                  icons={[Bell]}
                  className="border-0 bg-transparent hover:bg-transparent p-8 max-w-none"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="group p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 cursor-pointer"
                    onClick={() => handleNoticeClick(notice)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 text-left">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 text-left">
                          {notice.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                            {notice.type}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {format(new Date(notice.created_at), "dd MMM", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {visibleNotices.length > 2 && (
            <div className="border-t border-gray-100 dark:border-gray-800 py-6 text-center">
              <button 
                onClick={() => setShowAllNotices(true)}
                className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ver todos ({visibleNotices.length})
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <AllNoticesDialog
        open={showAllNotices}
        onOpenChange={setShowAllNotices}
      />

      <NoticeDetailDialog
        open={showNoticeDetail}
        onOpenChange={setShowNoticeDetail}
        notice={selectedNotice}
      />
    </>
  );
};
