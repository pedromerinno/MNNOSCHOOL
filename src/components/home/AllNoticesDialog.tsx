
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Avatar } from "@/components/ui/avatar";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import NewNoticeDialog from "@/components/admin/dialogs/NewNoticeDialog";
import { Button } from "@/components/ui/button";

interface AllNoticesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllNoticesDialog({ open, onOpenChange }: AllNoticesDialogProps) {
  const { notices, isLoading, error, deleteNotice, fetchNotices } = useCompanyNotices();
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [editNotice, setEditNotice] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [noticeIdToDelete, setNoticeIdToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canManage = userProfile?.is_admin || userProfile?.super_admin;

  // Atualizar avisos quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      fetchNotices(selectedCompany?.id, true);
    }
  }, [open, selectedCompany?.id]);

  const getInitial = (name: string | null | undefined) =>
    name ? name.charAt(0).toUpperCase() : "?";

  const formatCreatedAt = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: pt,
      });
    } catch {
      return "data desconhecida";
    }
  };

  const handleEdit = (notice: any) => {
    // Transformar o aviso para incluir o array de companies para o diálogo de edição
    const noticeToEdit = {
      ...notice,
      companies: notice.companies || []
    };
    
    console.log("Preparando para editar aviso:", noticeToEdit);
    setEditNotice(noticeToEdit);
    setEditDialogOpen(true);
  };

  const handleDelete = (noticeId: string) => {
    setNoticeIdToDelete(noticeId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (noticeIdToDelete) {
      await deleteNotice(noticeIdToDelete);
      // Atualizar a lista após a exclusão
      fetchNotices(selectedCompany?.id, true);
      // Notificar o componente pai para atualizar o widget de notificações
      onOpenChange(false);
      onOpenChange(true);
    }
    setDeleteConfirmOpen(false);
    setNoticeIdToDelete(null);
  };

  // Handler para quando o diálogo de edição é fechado
  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditNotice(null);
      // Re-fetch notices when dialog closes
      fetchNotices(selectedCompany?.id, true);
    }
  };

  const handleRefresh = async () => {
    if (!selectedCompany?.id) return;
    
    setRefreshing(true);
    try {
      await fetchNotices(selectedCompany.id, true);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg sm:max-w-2xl px-0 py-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex justify-between items-center flex-row">
            <DialogTitle className="text-xl font-semibold">
              Todos os Avisos
            </DialogTitle>
            <Button 
              size="icon"
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              title="Atualizar avisos"
              className="h-8 w-8 rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </DialogHeader>
          <ScrollArea className="h-[60vh] px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                Carregando avisos...
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center">
                <p>{error}</p>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  className="mt-2"
                  disabled={refreshing}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2">
                <p className="text-gray-500 dark:text-gray-400">Nenhum aviso disponível</p>
                {canManage && (
                  <Button 
                    onClick={() => setEditDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Criar novo aviso
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 bg-amber-50/80 dark:bg-amber-900/10 rounded-xl relative"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <Badge className="bg-amber-200 text-yellow-800 font-semibold rounded-full px-5 py-2 text-xs leading-tight">
                        {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                      </Badge>
                      {canManage && (
                        <div className="ml-auto flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(notice)}
                            title="Editar aviso"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(notice.id)}
                            title="Apagar aviso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-black dark:text-white">
                      {notice.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-3 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg">
                      {notice.author?.avatar ? (
                        <Avatar className="h-5 w-5">
                          <img
                            className="rounded-full object-cover h-5 w-5"
                            src={notice.author.avatar}
                            alt="Autor do aviso"
                          />
                        </Avatar>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-xs font-semibold">
                          {getInitial(notice.author?.display_name)}
                        </div>
                      )}
                      <span className="font-semibold text-xs text-black dark:text-white">
                        {notice.author?.display_name || "Usuário"}
                      </span>
                      <span className="mx-1 text-xs text-gray-500 dark:text-gray-400">
                        •
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCreatedAt(notice.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Modal */}
      <NewNoticeDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        initialData={editNotice}
        editingNoticeId={editNotice?.id || null}
      />

      {/* Delete confirm dialog */}
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
}
