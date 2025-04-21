
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Avatar } from "@/components/ui/avatar";
import { X } from "lucide-react";

interface AllNoticesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllNoticesDialog({ open, onOpenChange }: AllNoticesDialogProps) {
  const { notices, isLoading, error } = useCompanyNotices();

  const getInitial = (name: string | null | undefined) => 
    name ? name.charAt(0).toUpperCase() : "?";

  const formatCreatedAt = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: pt
      });
    } catch {
      return "data desconhecida";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl px-0 py-0">
        <DialogHeader className="px-6 pt-6 pb-1 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Todos os Avisos</DialogTitle>
          <button 
            aria-label="Fechar"
            className="rounded-full p-2 hover:bg-muted transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">Carregando avisos...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : notices.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              Nenhum aviso disponível
            </div>
          ) : (
            <div className="space-y-6">
              {notices.map(notice => (
                <div key={notice.id} className="p-4 bg-amber-50/80 dark:bg-amber-900/10 rounded-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-amber-200 text-yellow-800 font-semibold rounded-full px-3 py-1 text-xs">
                      {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-semibold mb-1 text-black dark:text-white">{notice.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{notice.content}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                    {notice.author?.avatar ? (
                      <Avatar className="h-7 w-7 mr-2">
                        <img className="rounded-full object-cover h-7 w-7" src={notice.author.avatar} alt="Autor do aviso"/>
                      </Avatar>
                    ) : (
                      <div className="h-7 w-7 mr-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {getInitial(notice.author?.display_name)}
                      </div>
                    )}
                    <span className="font-medium">{notice.author?.display_name || "Usuário"}</span>
                    <span className="mx-1">•</span>
                    <span>{formatCreatedAt(notice.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
