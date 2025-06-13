
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import NewNoticeDialog from "./dialogs/NewNoticeDialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CompanyNoticesAdminList: React.FC = () => {
  const { selectedCompany } = useCompanies();
  const { notices, isLoading, fetchNotices } = useCompanyNotices();
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
        <Button onClick={() => setIsNewNoticeDialogOpen(true)}>
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
            <Button onClick={() => setIsNewNoticeDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Aviso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(notice.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={(notice as any).visibilidade ? "default" : "secondary"}>
                      {(notice as any).visibilidade ? "Visível" : "Oculto"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(notice.id, (notice as any).visibilidade)}
                    >
                      {(notice as any).visibilidade ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Mostrar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{notice.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewNoticeDialog
        open={isNewNoticeDialogOpen}
        onOpenChange={setIsNewNoticeDialogOpen}
        onSuccess={() => {
          fetchNotices();
          setIsNewNoticeDialogOpen(false);
        }}
      />
    </div>
  );
};
