import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompanyTable } from './CompanyTable';
import { CompanyForm } from './CompanyForm';
import { useCompanies } from '@/hooks/company';
import { Company } from '@/types/company';
import { UserCompanyManager } from './UserCompanyManager';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
export const CompanyManagement: React.FC = () => {
  const {
    companies,
    userCompanies,
    isLoading,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  } = useCompanies();
  const {
    userProfile
  } = useAuth();
  const isSuperAdmin = userProfile?.super_admin === true;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);

  // Fetch companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      // Se for super admin ou não tiver acesso a empresas específicas, buscar todas
      if (isSuperAdmin) {
        try {
          console.log('CompanyManagement: Loading all companies for super admin');
          await fetchCompanies();
        } catch (error) {
          console.error('Error fetching companies:', error);
          toast.error("Erro ao carregar empresas");
        }
      }
    };
    loadCompanies();
  }, [fetchCompanies, isSuperAdmin]);
  const handleCreateCompany = () => {
    if (!userProfile?.is_admin && !userProfile?.super_admin) {
      toast.error("Você não tem permissão para criar empresas");
      return;
    }
    setSelectedCompany(undefined);
    setIsFormOpen(true);
  };
  const handleEditCompany = (company: Company) => {
    if (!userProfile?.is_admin && !userProfile?.super_admin) {
      toast.error("Você não tem permissão para editar empresas");
      return;
    }
    setSelectedCompany(company);
    setIsFormOpen(true);
  };
  const handleDeleteCompany = async (companyId: string) => {
    if (!userProfile?.is_admin && !userProfile?.super_admin) {
      toast.error("Você não tem permissão para excluir empresas");
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      await deleteCompany(companyId);
    }
  };
  const handleManageUsers = (company: Company) => {
    if (!userProfile?.is_admin && !userProfile?.super_admin) {
      toast.error("Você não tem permissão para gerenciar usuários da empresa");
      return;
    }
    setSelectedCompany(company);
    setIsUserManagerOpen(true);
  };
  const handleFormSubmit = async (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userProfile?.is_admin && !userProfile?.super_admin) {
      toast.error("Você não tem permissão para realizar esta ação");
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedCompany) {
        await updateCompany(selectedCompany.id, data);
      } else {
        await createCompany(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determinar quais empresas mostrar baseado no perfil do usuário
  const displayCompanies = isSuperAdmin ? Array.isArray(companies) ? companies : [] : Array.isArray(userCompanies) ? userCompanies : [];
  return <div className="space-y-4">
      <div className="flex justify-between items-center py-[5px]">
        <h2 className="text-xl font-semibold py-0">Gerenciamento de Empresas</h2>
        <Button onClick={handleCreateCompany} className="rounded-2xl">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>
      
      <CompanyTable companies={displayCompanies} loading={isLoading} onEdit={handleEditCompany} onDelete={handleDeleteCompany} onManageUsers={handleManageUsers} />

      {/* Company Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Editar Empresa' : 'Criar Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany ? 'Atualize os detalhes da empresa abaixo.' : 'Preencha o formulário para criar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <CompanyForm initialData={selectedCompany} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* User Company Manager Dialog */}
      <Dialog open={isUserManagerOpen} onOpenChange={setIsUserManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Usuários de {selectedCompany?.nome}
            </DialogTitle>
            <DialogDescription>
              Adicione ou remova usuários desta empresa.
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && <UserCompanyManager company={selectedCompany} onClose={() => setIsUserManagerOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>;
};