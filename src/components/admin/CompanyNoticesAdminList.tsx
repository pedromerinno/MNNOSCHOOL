
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { EditNoticeDialog } from "./dialogs/EditNoticeDialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notice } from "@/hooks/useNotifications";

export const CompanyNoticesAdminList: React.FC = () => {
  const { selectedCompany } = useCompanies();
  const { notices, isLoading, fetchNotices, deleteNotice } = useCompanyNotices();
  const [isNewNoticeDialogOpen, setIsNewNoticeDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [localNotices, setLocalNotices] = useState<Notice[]>([]);

  // Sync local notices with fetched notices
  useEffect(() => {
    setLocalNotices(notices);
  }, [notices]);

  // Auto-refresh when component mounts
  useEffect(() => {
    if (selectedCompany) {
      fetchNotices();
    }
  }, [selectedCompany, fetchNotices]);

  const updateLocalNotice = (noticeId: string, updates: Partial<Notice>) => {
    setLocalNotices(prev => 
      prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, ...updates }
          : notice
      )
    );
  };

  const handleToggleVisibility = async (noticeId: string, currentVisibility: boolean) => {
    try {
      // Update local state immediately for instant feedback
      updateLocalNotice(noticeId, { visibilidade: !currentVisibility } as any);

      const { error } = await supabase
        .from('company_notices')
        .update({ visibilidade: !currentVisibility })
        .eq('id', noticeId);

      if (error) throw error;

      toast.success(`Aviso ${!currentVisibility ? 'publicado' : 'ocultado'} com sucesso`);
      
      // Refresh to ensure consistency
      await fetchNotices();
    } catch (error) {
      console.error('Error toggling notice visibility:', error);
      toast.error('Erro ao alterar visibilidade do aviso');
      
      // Revert local state on error
      updateLocalNotice(noticeId, { visibilidade: currentVisibility } as any);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aviso?')) {
      const success = await deleteNotice(noticeId);
      if (success) {
        toast.success('Aviso excluído com sucesso');
        await fetchNotices();
      }
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsEditDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsNewNoticeDialogOpen(open);
    if (!open && selectedCompany) {
      fetchNotices();
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedNotice(null);
      if (selectedCompany) {
        fetchNotices();
      }
    }
  };

  if (!selectedCompany) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">Nenhuma empresa selecionada</h3>
        <p className="text-gray-500">Selecione uma empresa para visualizar os avisos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Avisos da Empresa</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os avisos para {selectedCompany.nome}
          </p>
        </div>
        <Button 
          onClick={() => setIsNewNoticeDialogOpen(true)}
          className="bg-black hover:bg-gray-800 text-white rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Aviso
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando avisos...</span>
        </div>
      ) : localNotices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Nenhum aviso encontrado</h3>
            <p className="text-gray-500 mb-4">
              Crie o primeiro aviso para {selectedCompany.nome}
            </p>
            <Button 
              onClick={() => setIsNewNoticeDialogOpen(true)}
              className="bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Aviso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {localNotices.map((notice) => (
            <Card key={notice.id} className="relative border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs capitalize bg-gray-50 dark:bg-gray-800"
                      >
                        {notice.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-3 font-semibold">{notice.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(notice.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{notice.author?.display_name || 'Usuário'}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleVisibility(notice.id, (notice as any).visibilidade)}>
                        {(notice as any).visibilidade ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Mostrar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditNotice(notice)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Aviso
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Aviso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{notice.content}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {selectedCompany.logo && (
                      <img 
                        src={selectedCompany.logo} 
                        alt={selectedCompany.nome}
                        className="w-5 h-5 rounded object-cover"
                      />
                    )}
                    <Badge 
                      className="text-xs font-medium px-3 py-1"
                      style={{
                        backgroundColor: `${selectedCompany.cor_principal}20`,
                        color: selectedCompany.cor_principal,
                        borderColor: `${selectedCompany.cor_principal}30`
                      }}
                    >
                      {selectedCompany.nome}
                    </Badge>
                  </div>
                  <Badge 
                    variant={(notice as any).visibilidade ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {(notice as any).visibilidade ? "Visível" : "Oculto"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewNoticeDialog
        open={isNewNoticeDialogOpen}
        onOpenChange={handleDialogOpenChange}
      />

      <EditNoticeDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        notice={selectedNotice}
        companyId={selectedCompany.id}
      />
    </div>
  );
};
