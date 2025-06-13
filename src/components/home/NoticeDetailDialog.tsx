
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar } from "@/components/ui/avatar";

interface NoticeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: {
    id: string;
    title: string;
    content: string;
    type: string;
    created_at: string;
    author?: {
      display_name?: string;
      avatar?: string;
    };
  } | null;
}

export const NoticeDetailDialog = ({ open, onOpenChange, notice }: NoticeDetailDialogProps) => {
  if (!notice) return null;

  const getInitial = (name: string | null | undefined) =>
    name ? name.charAt(0).toUpperCase() : "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs px-3 py-1 capitalize">
              {notice.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(notice.created_at), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
          <DialogTitle className="text-xl font-semibold text-left">
            {notice.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
          
          {notice.author && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              {notice.author.avatar ? (
                <Avatar className="h-8 w-8">
                  <img
                    className="rounded-full object-cover h-8 w-8"
                    src={notice.author.avatar}
                    alt="Autor do aviso"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">
                  {getInitial(notice.author.display_name)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notice.author.display_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Publicado em {format(new Date(notice.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
