
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
  
  // Refs for tracking initial fetch and company changes
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

  // Initial fetch when component mounts or company changes
  useEffect(() => {
    if (selectedCompany?.id && (!initialFetchDoneRef.current || selectedCompany.id !== lastSelectedCompanyIdRef.current)) {
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
    
    // Cleanup timeout on unmount
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
    <Card className="overflow-hidden bg-[#F8F7F2] dark:bg-[#1E1E1E] border-0 shadow-sm rounded-3xl h-full">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 flex justify-between items-center border-b border-amber-100/30 dark:border-amber-900/20">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-medium">Avisos</h3>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-7 w-7 hover:bg-amber-100/50 dark:hover:bg-amber-900/30" 
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleRefresh} 
              disabled={refreshing || isLoading} 
              title="Atualizar avisos"
              className="h-8 w-8 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <div className="flex">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-900/30" 
                onClick={prevNotice} 
                disabled={isLoading || !currentNotice}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-900/30" 
                onClick={nextNotice} 
                disabled={isLoading || !currentNotice}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-6">
          {refreshing || isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-amber-700/50 dark:text-amber-300/50">
                Carregando avisos...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <div className="text-red-500 text-center">{error}</div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Tentar novamente
              </Button>
            </div>
          ) : !currentNotice ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <div className="text-gray-500 dark:text-gray-400">
                Nenhum aviso disponível
              </div>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDialogOpen(true)}
                  className="mt-2"
                >
                  Criar aviso
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notice Type Badge */}
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium">
                {currentNotice.type.charAt(0).toUpperCase() + currentNotice.type.slice(1)}
              </span>
              
              {/* Notice Title */}
              <h4 className="text-lg font-semibold">{currentNotice.title}</h4>
              
              {/* Notice Content */}
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {currentNotice.content}
              </p>
              
              {/* Author and Date */}
              <div className="flex items-center mt-4 pt-4 border-t border-amber-100/30 dark:border-amber-900/20">
                {currentNotice.author?.avatar ? (
                  <img 
                    src={currentNotice.author.avatar} 
                    alt={currentNotice.author.display_name || "Autor"} 
                    className="h-6 w-6 rounded-full mr-2 object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2UyZThmMCIvPjxwYXRoIGQ9Ik04IDhoOHY4SDh6IiBmaWxsPSIjOTRhM2IzIi8+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full mr-2 bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center text-amber-800 dark:text-amber-200">
                    {currentNotice.author?.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-sm font-medium mr-2">
                  {currentNotice.author?.display_name || 'Usuário'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(currentNotice.created_at)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Section */}
        <div className="border-t border-amber-100/30 dark:border-amber-900/20 p-4 text-center">
          <button 
            onClick={() => setNoticesDialogOpen(true)}
            className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
          >
            Ver todos os avisos
          </button>
        </div>
      </CardContent>
      
      {/* Only render the dialog components when they need to be shown */}
      {dialogOpen && <NewNoticeDialog open={dialogOpen} onOpenChange={handleDialogOpenChange} />}
      
      {noticesDialogOpen && <AllNoticesDialog open={noticesDialogOpen} onOpenChange={handleAllNoticesDialogChange} />}
    </Card>
  );
});

NotificationsWidget.displayName = 'NotificationsWidget';
