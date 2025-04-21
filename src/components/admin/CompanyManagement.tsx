
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const CompanyManagement: React.FC = () => {
  const { 
    companies, 
    userCompanies,
    isLoading, 
    fetchCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany,
    forceGetUserCompanies 
  } = useCompanies();
  
  const { user, userProfile } = useAuth();
  const isSuperAdmin = userProfile?.super_admin === true;
  const isAdminUser = userProfile?.is_admin === true;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
  const [adminCompanies, setAdminCompanies] = useState<Company[]>([]);
  const [loadingAdminCompanies, setLoadingAdminCompanies] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      console.log('CompanyManagement: Iniciando carregamento das empresas');
      setLoadingAdminCompanies(true);
      
      try {
        // Para super admin, carregar todas as empresas
        if (isSuperAdmin) {
          console.log('CompanyManagement: Loading all companies for super admin');
          await fetchCompanies();
          setAdminCompanies(companies);
        } 
        // Para admin normal, carregar empresas associadas ao usuário
        else if (isAdminUser && user?.id) {
          console.log('CompanyManagement: Loading companies for admin user');
          // Usar RPC function para evitar problemas de RLS
          const { data, error } = await supabase
            .rpc('get_user_companies_for_admin', { current_user_id: user.id });
            
          if (error) {
            console.error('Error fetching admin companies:', error);
            toast.error("Erro ao carregar empresas: " + error.message);
          } else {
            console.log('CompanyManagement: Loaded', data?.length || 0, 'companies for admin');
            setAdminCompanies(data || []);
          }
          
          // Atualizar também userCompanies para manter consistência
          if (user?.id) {
            await forceGetUserCompanies(user.id);
          }
        } else {
          console.log('CompanyManagement: No sufficient permissions, showing available companies');
          setAdminCompanies(userCompanies);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error("Erro ao carregar empresas");
      } finally {
        setLoadingAdminCompanies(false);
      }
    };
    
    loadCompanies();
  }, [fetchCompanies, isSuperAdmin, isAdminUser, user?.id, companies, userCompanies, forceGetUserCompanies]);

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
      // Atualizar a lista após exclusão
      const updatedList = adminCompanies.filter(company => company.id !== companyId);
      setAdminCompanies(updatedList);
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
        // Atualizar a lista após edição
        setAdminCompanies(prevCompanies => 
          prevCompanies.map(c => c.id === selectedCompany.id ? { ...c, ...data } : c)
        );
      } else {
        const newCompany = await createCompany(data);
        // Adicionar nova empresa à lista
        if (newCompany) {
          setAdminCompanies(prev => [...prev, newCompany]);
        }
      }
      setIsFormOpen(false);
      
      // Dispatch event to trigger refresh in other components
      window.dispatchEvent(new Event('company-relation-changed'));
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state UI
  if (loadingAdminCompanies && adminCompanies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Carregando empresas...</h2>
        </div>
        <div className="rounded-md border p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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
        companies={adminCompanies} 
        loading={loadingAdminCompanies} 
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
