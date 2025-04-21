
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useState } from "react";
import NewNoticeDialog from "../admin/dialogs/NewNoticeDialog";
import { AllNoticesDialog } from "./AllNoticesDialog";

export const NotificationsWidget = () => {
  const { userProfile } = useAuth();
  const { 
    currentNotice, 
    isLoading, 
    error, 
    nextNotice, 
    prevNotice 
  } = useCompanyNotices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noticesDialogOpen, setNoticesDialogOpen] = useState(false);
  
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: pt
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "data desconhecida";
    }
  };

  return (
    <Card className="border-0 shadow-none overflow-hidden bg-[#F1EDE4] dark:bg-[#342B1A] rounded-[30px]">
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
          <div className="flex space-x-4">
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
        
        <div className="px-12 pb-8 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-pulse text-gray-400">Carregando avisos...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-red-500">Erro ao carregar avisos</div>
            </div>
          ) : !currentNotice ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-500 dark:text-gray-400">
                Nenhum aviso disponível
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <span className="inline-block px-6 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-yellow-700 dark:text-amber-100 text-xs font-semibold mb-4">
                {currentNotice.type.charAt(0).toUpperCase() + currentNotice.type.slice(1)}
              </span>
              <h4 className="text-lg font-bold mb-2 dark:text-white">{currentNotice.title}</h4>
              <p className="text-base text-gray-800 dark:text-gray-300 mb-5">{currentNotice.content}</p>
              <div className="flex items-center bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg space-y-1">
                <div className="flex items-center">
                  {currentNotice.author?.avatar ? (
                    <img 
                      src={currentNotice.author.avatar} 
                      alt="Autor do aviso" 
                      className="h-6 w-6 rounded-full mr-3 object-cover"
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
            ver todos
          </button>
        </div>
      </CardContent>
      
      <NewNoticeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AllNoticesDialog open={noticesDialogOpen} onOpenChange={setNoticesDialogOpen} />
    </Card>
  );
};
