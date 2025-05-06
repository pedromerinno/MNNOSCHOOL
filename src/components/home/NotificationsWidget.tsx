import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useState, useRef, memo, useCallback, useEffect } from "react";
import NewNoticeDialog from "../admin/dialogs/NewNoticeDialog";
import { AllNoticesDialog } from "./AllNoticesDialog";
import { useCompanies } from "@/hooks/useCompanies";

export const NotificationsWidget = memo(() => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const { 
    currentNotice, 
    isLoading, 
    error, 
    nextNotice, 
    prevNotice,
    fetchNotices
  } = useCompanyNotices();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noticesDialogOpen, setNoticesDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const initialFetchDoneRef = useRef(false);
  const fetchTimeoutRef = useRef<number | null>(null);
  const lastSelectedCompanyIdRef = useRef<string | null>(null);
  
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  
  const formatRelativeTime = useCallback((dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: pt
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "data desconhecida";
    }
  }, []);

  useEffect(() => {
    // Initial fetch - only once when component mounts and company is selected
    if (selectedCompany?.id && 
        (!initialFetchDoneRef.current || selectedCompany.id !== lastSelectedCompanyIdRef.current)) {
      
      initialFetchDoneRef.current = true;
      lastSelectedCompanyIdRef.current = selectedCompany.id;
      
      // Use setTimeout to avoid triggering fetch on every render
      if (fetchTimeoutRef.current === null) {
        fetchTimeoutRef.current = window.setTimeout(() => {
          try {
            console.log(`NotificationsWidget: Initial fetch for company ${selectedCompany.id}`);
            fetchNotices(selectedCompany.id, false).catch(err => {
              console.error("Error fetching notices:", err);
            });
          } catch (err) {
            console.error("Exception in fetchNotices:", err);
          }
          fetchTimeoutRef.current = null;
        }, 1000);
      }
    }
    
    return () => {
      if (fetchTimeoutRef.current !== null) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [selectedCompany?.id, fetchNotices]);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    
    // Refresh notices when dialog closes
    if (!open && initialFetchDoneRef.current && selectedCompany?.id) {
      setTimeout(() => {
        if (selectedCompany?.id) {
          fetchNotices(selectedCompany.id, true).catch(err => {
            console.error("Error refreshing notices after dialog close:", err);
          });
        }
      }, 800);
    }
  };

  const handleAllNoticesDialogChange = (open: boolean) => {
    setNoticesDialogOpen(open);
  };

  const handleRefresh = async () => {
    if (!selectedCompany?.id || refreshing) return;
    
    setRefreshing(true);
    try {
      await fetchNotices(selectedCompany.id, true);
    } catch (err) {
      console.error("Error refreshing notices:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <Card className="border-0 shadow-none overflow-hidden bg-[#F1EDE4] dark:bg-[#222222] rounded-[30px]">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-medium text-black dark:text-white">Avisos</h3>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-7 w-7"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              title="Atualizar avisos"
              className="h-7 w-7 rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={prevNotice}
              disabled={isLoading || !currentNotice}
            >
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={nextNotice}
              disabled={isLoading || !currentNotice}
            >
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="px-12 flex-1">
          {refreshing || isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-pulse text-gray-400">Carregando avisos...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <div className="text-red-500 text-center">{error}</div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Tentar novamente
              </Button>
            </div>
          ) : !currentNotice ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <div className="text-gray-500 dark:text-gray-400">
                Nenhum aviso disponível
              </div>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDialogOpen(true)}
                >
                  Criar aviso
                </Button>
              )}
            </div>
          ) : (
            <div>
              <span className="inline-block px-6 py-1.5 rounded-full bg-amber-100 dark:bg-[#2C2C2C] text-yellow-700 dark:text-amber-100 text-xs font-semibold mb-4">
                {currentNotice.type.charAt(0).toUpperCase() + currentNotice.type.slice(1)}
              </span>
              <h4 className="text-lg font-bold mb-2 dark:text-white">{currentNotice.title}</h4>
              <p className="text-base text-gray-800 dark:text-gray-300 mb-5 line-clamp-3">
                {currentNotice.content}
              </p>
              <div className="flex items-center bg-amber-100/50 dark:bg-[#1F1F1F] p-3 rounded-lg space-y-1">
                <div className="flex items-center">
                  {currentNotice.author?.avatar ? (
                    <img 
                      src={currentNotice.author.avatar} 
                      alt="Autor do aviso" 
                      className="h-6 w-6 rounded-full mr-3 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2UyZThmMCIvPjxwYXRoIGQ9Ik04IDhoOHY4SDh6IiBmaWxsPSIjOTRhM2IzIi8+PC9zdmc+';
                      }}
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                      {currentNotice.author?.display_name?.substring(0, 1).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-black dark:text-white mr-3">
                    {currentNotice.author?.display_name || 'Usuário'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(currentNotice.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 py-6 text-center mb-6">
          <button 
            className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => setNoticesDialogOpen(true)}
          >
            Ver mais
          </button>
        </div>
      </CardContent>
      
      {/* Only render the dialog components when they need to be shown */}
      {dialogOpen && (
        <NewNoticeDialog 
          open={dialogOpen} 
          onOpenChange={handleDialogOpenChange}
        />
      )}
      
      {noticesDialogOpen && (
        <AllNoticesDialog 
          open={noticesDialogOpen} 
          onOpenChange={handleAllNoticesDialogChange}
        />
      )}
    </Card>
  );
});

NotificationsWidget.displayName = 'NotificationsWidget';
