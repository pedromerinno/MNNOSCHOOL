
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, EyeOff, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CompanyNoticesAdminList: React.FC = () => {
  const { selectedCompany } = useCompanies();
  const { notices, isLoading, fetchNotices, deleteNotice } = useCompanyNotices();
  const [isNewNoticeDialogOpen, setIsNewNoticeDialogOpen] = useState(false);

  // Auto-refresh when component mounts
  useEffect(() => {
    if (selectedCompany) {
      fetchNotices();
    }
  }, [selectedCompany, fetchNotices]);

  const handleToggleVisibility = async (noticeId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('company_notices')
        .update({ visibilidade: !currentVisibility })
        .eq('id', noticeId);

      if (error) throw error;

      toast.success(`Aviso ${!currentVisibility ? 'publicado' : 'ocultado'} com sucesso`);
      fetchNotices();
    } catch (error) {
      console.error('Error toggling notice visibility:', error);
      toast.error('Erro ao alterar visibilidade do aviso');
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aviso?')) {
      const success = await deleteNotice(noticeId);
      if (success) {
        toast.success('Aviso excluído com sucesso');
      }
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsNewNoticeDialogOpen(open);
    // Refresh notices when dialog closes
    if (!open && selectedCompany) {
      fetchNotices();
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
      ) : notices.length === 0 ? (
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
          {notices.map((notice) => (
            <Card key={notice.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        {selectedCompany.nome}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-1">{notice.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      📅 {format(new Date(notice.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} 👤 {notice.author?.display_name || 'Usuário'}
                    </p>
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
                      <DropdownMenuItem>
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
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{notice.content}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge 
                    variant={(notice as any).visibilidade ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {(notice as any).visibilidade ? "Visível" : "Oculto"}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {notice.type}
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
    </div>
  );
};
