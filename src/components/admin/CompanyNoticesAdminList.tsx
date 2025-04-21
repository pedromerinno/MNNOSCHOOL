
import React, { useState } from "react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";

export const CompanyNoticesAdminList: React.FC = () => {
  const { notices, deleteNotice, isLoading } = useCompanyNotices();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);

  const handleEdit = (notice: any) => {
    setEditingNotice({
      ...notice,
      companies: [notice.company_id], // Informações mínimas para edição
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (noticeId: string) => {
    if (window.confirm("Deseja realmente apagar este aviso?")) {
      await deleteNotice(noticeId);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold">Administração de Avisos</h2>
        <p className="text-sm text-muted-foreground mb-2">Gerencie todos os avisos cadastrados da sua empresa</p>
      </div>
      {isLoading ? (
        <div>Carregando avisos...</div>
      ) : notices.length === 0 ? (
        <div>Nenhum aviso encontrado.</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border p-4 flex flex-col gap-2 relative"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-4">
                  {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                </Badge>
                <span className="text-gray-500 text-xs">
                  {notice.company_id}
                </span>
              </div>
              <div className="font-semibold">{notice.title}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {notice.content}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(notice)}
                  className="gap-1"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(notice.id)}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Apagar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de edição */}
      <NewNoticeDialog
        open={editDialogOpen}
        onOpenChange={(o) => {
          setEditDialogOpen(o);
          if (!o) setEditingNotice(null);
        }}
        initialData={editingNotice}
        editingNoticeId={editingNotice?.id || null}
      />
    </div>
  );
};
