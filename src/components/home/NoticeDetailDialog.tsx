
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar } from "@/components/ui/avatar";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import NewNoticeDialog from "@/components/admin/dialogs/NewNoticeDialog";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";

interface NoticeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: {
    id: string;
    title: string;
    content: string;
    type: string;
    created_at: string;
    companies?: string[];
    author?: {
      display_name?: string;
      avatar?: string;
    };
  } | null;
}

export const NoticeDetailDialog = ({ open, onOpenChange, notice }: NoticeDetailDialogProps) => {
  const { userProfile } = useAuth();
  const { deleteNotice } = useCompanyNotices();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const canManage = userProfile?.is_admin || userProfile?.super_admin;

  if (!notice) return null;

  const getInitial = (name: string | null | undefined) =>
    name ? name.charAt(0).toUpperCase() : "?";

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!notice?.id) return;
    
    try {
      await deleteNotice(notice.id);
      onOpenChange(false);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting notice:", error);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      // Trigger refresh when edit dialog closes
      window.dispatchEvent(new CustomEvent('notices-updated'));
    }
  };

  return (
    <>
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
              {canManage && (
                <div className="ml-auto flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEdit}
                    title="Editar aviso"
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDelete}
                    title="Apagar aviso"
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
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

      {/* Diálogo de edição */}
      {editDialogOpen && (
        <NewNoticeDialog
          open={editDialogOpen}
          onOpenChange={handleEditDialogClose}
          initialData={notice}
          editingNoticeId={notice.id}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Apagar aviso?</DialogTitle>
          </DialogHeader>
          <div>Tem certeza que deseja apagar este aviso? Essa ação não pode ser desfeita.</div>
          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Apagar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
