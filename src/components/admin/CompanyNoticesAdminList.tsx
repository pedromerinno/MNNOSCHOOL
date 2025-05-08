
import React, { useState, useEffect } from "react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { Notice } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanies } from "@/hooks/useCompanies";

export const CompanyNoticesAdminList: React.FC = () => {
  const {
    notices,
    deleteNotice,
    isLoading,
    fetchNotices
  } = useCompanyNotices();
  const { userCompanies } = useCompanies();
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

  // Helper function to get company name from company id
  const getCompanyName = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    return company?.nome || companyId;
  };

  return <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <Button 
            onClick={() => setEditDialogOpen(true)} 
            className="bg-primary hover:bg-primary/90"
          >
            Novo Aviso
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : notices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">Nenhum aviso encontrado.</p>
            <Button onClick={() => setEditDialogOpen(true)}>Criar Primeiro Aviso</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notices.map(notice => (
            <Card key={notice.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="px-3 py-1 capitalize">
                      {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(notice)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(notice.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Apagar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{notice.title}</h3>
                  <p className="text-muted-foreground mb-4">{notice.content}</p>
                  
                  {/* Companies list */}
                  {notice.companies && notice.companies.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">Empresas:</p>
                      <div className="flex flex-wrap gap-2">
                        {notice.companies.map((companyId: string) => (
                          <Badge key={companyId} variant="secondary" className="text-xs">
                            {getCompanyName(companyId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de edição */}
      <NewNoticeDialog 
        open={editDialogOpen} 
        onOpenChange={handleDialogClose} 
        initialData={editingNotice} 
        editingNoticeId={editingNotice?.id || null} 
      />
    </div>;
};
