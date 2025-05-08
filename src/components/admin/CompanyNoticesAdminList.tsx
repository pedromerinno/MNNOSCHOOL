import React, { useState, useEffect } from "react";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal, Calendar, User } from "lucide-react";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { Notice } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCompanies } from "@/hooks/useCompanies";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
export const CompanyNoticesAdminList: React.FC = () => {
  const {
    notices,
    deleteNotice,
    isLoading,
    fetchNotices
  } = useCompanyNotices();
  const {
    userCompanies
  } = useCompanies();
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

  // Helper function to get company logo from company id
  const getCompanyLogo = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    return company?.logo || null;
  };

  // Helper function to get company color from company id
  const getCompanyColor = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    return company?.cor_principal || "#1EAEDB";
  };

  // Format date to display in PT-BR format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR
      });
    } catch (e) {
      return dateString;
    }
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Avisos</h2>
        <Button onClick={() => setEditDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          Novo Aviso
        </Button>
      </div>
      
      {isLoading ? <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div> : notices.length === 0 ? <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum aviso encontrado.</p>
            <Button onClick={() => setEditDialogOpen(true)}>Criar Primeiro Aviso</Button>
          </CardContent>
        </Card> : <div className="grid gap-4">
          {notices.map(notice => <Card key={notice.id} className="overflow-hidden border border-gray-200 dark:border-gray-800">
              <CardContent className="p-4 py-[32px] px-[32px]">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="px-2 py-1 capitalize text-xs">
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
                      <DropdownMenuItem onClick={() => handleDelete(notice.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Apagar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="text-lg font-semibold mb-1">{notice.title}</h3>
                <p className="text-muted-foreground mb-3 line-clamp-2">{notice.content}</p>
                
                <div className="flex flex-col gap-3 mt-3 text-sm text-muted-foreground my-0">
                  {/* Date and author info */}
                  <div className="flex items-center gap-3 flex-wrap py-[5px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-sm">{formatDate(notice.created_at)}</span>
                    </div>
                    {notice.author && <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span className="text-sm">{notice.author.display_name || "Usuário"}</span>
                      </div>}
                  </div>
                  
                  {/* Companies list */}
                  {notice.companies && notice.companies.length > 0 && <div className="mt-2">
                      
                      <div className="flex flex-wrap gap-1.5 py-0">
                        {notice.companies.map((companyId: string) => {
                  const companyColor = getCompanyColor(companyId);
                  const companyLogo = getCompanyLogo(companyId);
                  return <Badge key={companyId} variant="secondary" className="text-xs flex items-center px-2 py-1" style={{
                    backgroundColor: `${companyColor}15`,
                    // Light background (10% opacity)
                    color: companyColor,
                    borderColor: `${companyColor}30` // Slightly darker border (30% opacity)
                  }}>
                              {companyLogo ? <img src={companyLogo} alt={getCompanyName(companyId)} className="w-3.5 h-3.5 rounded-full mr-1.5 object-contain" onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }} /> : <span className="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] mr-1.5">
                                  {getCompanyName(companyId).charAt(0).toUpperCase()}
                                </span>}
                              {getCompanyName(companyId)}
                            </Badge>;
                })}
                      </div>
                    </div>}
                </div>
              </CardContent>
            </Card>)}
        </div>}

      {/* Dialog de edição */}
      <NewNoticeDialog open={editDialogOpen} onOpenChange={handleDialogClose} initialData={editingNotice} editingNoticeId={editingNotice?.id || null} />
    </div>;
};