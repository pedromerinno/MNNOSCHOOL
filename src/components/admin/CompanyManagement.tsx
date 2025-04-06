
import React, { useEffect, useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompanyTable } from './CompanyTable';
import { CompanyForm } from './CompanyForm';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';
import { UserCompanyManager } from './UserCompanyManager';

export const CompanyManagement: React.FC = () => {
  const { 
    companies, 
    isLoading, 
    fetchCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany 
  } = useCompanies();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreateCompany = () => {
    setSelectedCompany(undefined);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      await deleteCompany(companyId);
    }
  };

  const handleManageUsers = (company: Company) => {
    setSelectedCompany(company);
    setIsUserManagerOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Empresas</h2>
        <Button onClick={handleCreateCompany}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>
      
      <CompanyTable 
        companies={companies} 
        loading={isLoading} 
        onEdit={handleEditCompany}
        onDelete={handleDeleteCompany}
        onManageUsers={handleManageUsers}
      />

      {/* Company Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Editar Empresa' : 'Criar Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany 
                ? 'Atualize os detalhes da empresa abaixo.' 
                : 'Preencha o formulário para criar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <CompanyForm 
            initialData={selectedCompany}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
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
          {selectedCompany && (
            <UserCompanyManager 
              company={selectedCompany}
              onClose={() => setIsUserManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
