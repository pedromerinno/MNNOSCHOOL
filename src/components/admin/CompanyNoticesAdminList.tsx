import React, { useState, useEffect } from "react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { Notice } from "@/hooks/useNotifications";
export const CompanyNoticesAdminList: React.FC = () => {
  const {
    notices,
    deleteNotice,
    isLoading,
    fetchNotices
  } = useCompanyNotices();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);

  // Re-fetch notices when component mounts
  useEffect(() => {
    fetchNotices();
  }, []);
  const handleEdit = (notice: any) => {
    setEditingNotice({
      ...notice,
      companies: notice.companies || [notice.company_id] // Usar companies se disponível, senão usar company_id
    });
    setEditDialogOpen(true);
  };
  const handleDelete = async (noticeId: string) => {
    if (window.confirm("Deseja realmente apagar este aviso?")) {
      await deleteNotice(noticeId);
    }
  };

  // Handler para quando o diálogo é fechado
  const handleDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      // Re-fetch notices when dialog closes
      fetchNotices();
    }
  };
  return <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold py-[10px]">Administração de Avisos</h2>
        <p className="text-sm text-muted-foreground mb-2 py-[10px]">Gerencie todos os avisos cadastrados da sua empresa</p>
      </div>
      {isLoading ? <div>Carregando avisos...</div> : notices.length === 0 ? <div>Nenhum aviso encontrado.</div> : <div className="space-y-4">
          {notices.map(notice => <div key={notice.id} className="rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border p-4 flex flex-col gap-2 relative py-[30px] px-[40px]">
              <div className="flex items-center gap-2 py-0 my-[10px]">
                <Badge variant="outline" className="px-4">
                  {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                </Badge>
                {/* Mostrar todas as empresas associadas ao aviso */}
                <div className="flex gap-1 flex-wrap">
                  {notice.companies && notice.companies.map((companyId: string) => <span key={companyId} className="text-gray-500 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {companyId}
                    </span>)}
                </div>
              </div>
              <div className="font-semibold my-[10px]">{notice.title}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {notice.content}
              </div>
              <div className="flex items-center gap-3 mt-1 py-0 my-[20px]">
                <Button size="sm" variant="outline" onClick={() => handleEdit(notice)} className="gap-1">
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(notice.id)} className="gap-1">
                  <Trash2 className="h-4 w-4" /> Apagar
                </Button>
              </div>
            </div>)}
        </div>}

      {/* Dialog de edição */}
      <NewNoticeDialog open={editDialogOpen} onOpenChange={handleDialogClose} initialData={editingNotice} editingNoticeId={editingNotice?.id || null} />
    </div>;
};