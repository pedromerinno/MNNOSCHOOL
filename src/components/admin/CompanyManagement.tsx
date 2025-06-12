
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    getUserCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  } = useCompanies();
  const {
    user,
    userProfile
  } = useAuth();
  const isSuperAdmin = userProfile?.super_admin === true;
  const isAdmin = userProfile?.is_admin === true;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('[CompanyManagement] Current state:', {
    isSuperAdmin,
    isAdmin,
    userCompaniesCount: userCompanies.length,
    companiesCount: companies.length,
    isLoading,
    userId: user?.id
  });

  // Fetch companies on mount based on user role with improved logic
  useEffect(() => {
    const loadCompanies = async () => {
      if (!user?.id || !userProfile || hasInitialized) {
        console.log('[CompanyManagement] Not ready to load companies:', {
          hasUser: !!user?.id,
          hasProfile: !!userProfile,
          hasInitialized
        });
        return;
      }

      try {
        setHasInitialized(true);
        
        if (isSuperAdmin) {
          console.log('[CompanyManagement] Loading all companies for super admin');
          await fetchCompanies();
        } else if (isAdmin) {
          console.log('[CompanyManagement] Loading user companies for admin');
          await getUserCompanies(user.id);
        }
      } catch (error) {
        console.error('[CompanyManagement] Error fetching companies:', error);
        toast.error("Erro ao carregar empresas");
      }
    };

    // Only load if we have user profile information and haven't initialized yet
    if (userProfile && (isSuperAdmin || isAdmin) && !hasInitialized) {
      loadCompanies();
    }
  }, [fetchCompanies, getUserCompanies, isSuperAdmin, isAdmin, user?.id, userProfile, hasInitialized]);

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
    
    try {
      // Check if user has permission to delete this company
      if (!userProfile.super_admin) {
        // Regular admins can only delete companies they created
        const { data, error } = await supabase
          .from('empresas')
          .select('created_by')
          .eq('id', companyId)
          .single();
          
        if (error || data.created_by !== userProfile.id) {
          toast.error("Você não tem permissão para excluir esta empresa");
          return;
        }
      }
      
      if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
        await deleteCompany(companyId);
      }
    } catch (error) {
      console.error('Error checking company permissions:', error);
      toast.error("Erro ao verificar permissões");
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
        // Include the current user as the creator of the company
        const companyData = {
          ...data,
          created_by: userProfile.id
        };
        await createCompany(companyData);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determinar quais empresas mostrar baseado no perfil do usuário
  const displayCompanies = isSuperAdmin 
    ? (Array.isArray(companies) ? companies : []) 
    : (Array.isArray(userCompanies) ? userCompanies : []);

  console.log('[CompanyManagement] Display companies:', {
    displayCompaniesCount: displayCompanies.length,
    isSuperAdmin,
    companiesArray: Array.isArray(companies),
    userCompaniesArray: Array.isArray(userCompanies)
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center py-[5px]">
        <h2 className="text-xl font-semibold py-0">Gerenciamento de Empresas</h2>
        <Button onClick={handleCreateCompany} className="rounded-2xl">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>
      
      <CompanyTable 
        companies={displayCompanies} 
        loading={isLoading} 
        onEdit={handleEditCompany} 
        onDelete={handleDeleteCompany} 
        onManageUsers={handleManageUsers} 
      />

      {/* Company Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {selectedCompany ? 'Editar Empresa' : 'Criar Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany ? 'Atualize os detalhes da empresa abaixo.' : 'Preencha o formulário para criar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <CompanyForm 
              initialData={selectedCompany} 
              onSubmit={handleFormSubmit} 
              onCancel={() => setIsFormOpen(false)} 
              isSubmitting={isSubmitting} 
            />
          </div>
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
