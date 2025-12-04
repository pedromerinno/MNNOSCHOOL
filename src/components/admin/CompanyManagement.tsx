
import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";
import { CompanyTable } from './CompanyTable';
import { CompanyForm } from './CompanyForm';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';
import { UserCompanyManager } from './UserCompanyManager';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserCompanyAdmin } from '@/hooks/company/useUserCompanyAdmin';
import { AdminSearchBar } from './AdminSearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageTitle } from './AdminPageTitle';
import { Loader2 } from 'lucide-react';

export const CompanyManagement: React.FC = () => {
  const {
    companies,
    userCompanies,
    isLoading,
    fetchCompanies,
    getUserCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    selectedCompany
  } = useCompanies();
  const {
    user,
    userProfile
  } = useAuth();
  const { isAdmin: isCompanyAdmin } = useUserCompanyAdmin();
  const isSuperAdmin = userProfile?.super_admin === true;
  // is_admin foi removido de profiles - agora está em user_empresa
  // Usar isCompanyAdmin que verifica user_empresa.is_admin para a empresa selecionada
  const isAdmin = isSuperAdmin || isCompanyAdmin;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    companiesThisMonth: 0,
    loading: true
  });

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

  // Determinar quais empresas mostrar baseado no perfil do usuário
  const allDisplayCompanies = useMemo(() => {
    return isSuperAdmin 
      ? (Array.isArray(companies) ? companies : []) 
      : (Array.isArray(userCompanies) ? userCompanies : []);
  }, [isSuperAdmin, companies, userCompanies]);

  // Buscar métricas
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!hasInitialized || isLoading) return;
      
      try {
        setMetrics(prev => ({ ...prev, loading: true }));
        const companyIds = allDisplayCompanies.map(c => c.id);
        
        if (companyIds.length === 0) {
          setMetrics({
            totalUsers: 0,
            companiesThisMonth: 0,
            loading: false
          });
          return;
        }

        // Buscar total de usuários
        const { count: totalUsers, error: usersError } = await supabase
          .from('user_empresa')
          .select('*', { count: 'exact', head: true })
          .in('empresa_id', companyIds);

        if (usersError) throw usersError;

        // Buscar empresas criadas este mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const companiesThisMonth = allDisplayCompanies.filter(company => {
          const createdDate = new Date(company.created_at);
          return createdDate >= startOfMonth;
        }).length;

        setMetrics({
          totalUsers: totalUsers || 0,
          companiesThisMonth,
          loading: false
        });
      } catch (error) {
        console.error('[CompanyManagement] Error fetching metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, [allDisplayCompanies, hasInitialized, isLoading]);

  const handleCreateCompany = () => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para criar empresas");
      return;
    }
    setEditingCompany(undefined);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para editar empresas");
      return;
    }
    setEditingCompany(company);
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
    setEditingCompany(company);
    setIsUserManagerOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('[CompanyManagement] handleFormSubmit called with data:', data);
    console.log('[CompanyManagement] editingCompany:', editingCompany);
    console.log('[CompanyManagement] userProfile:', userProfile);
    
    if (!userProfile?.is_admin && !userProfile?.super_admin) {
      toast.error("Você não tem permissão para realizar esta ação");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCompany) {
        console.log('[CompanyManagement] Calling updateCompany with id:', editingCompany.id);
        await updateCompany(editingCompany.id, data);
        console.log('[CompanyManagement] updateCompany completed successfully');
      } else {
        console.log('[CompanyManagement] Calling createCompany');
        // Include the current user as the creator of the company
        const companyData = {
          ...data,
          created_by: userProfile.id
        };
        await createCompany(companyData);
        console.log('[CompanyManagement] createCompany completed successfully');
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('[CompanyManagement] Error submitting form:', error);
      toast.error('Erro ao salvar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar empresas por busca
  const displayCompanies = useMemo(() => {
    if (!searchQuery) return allDisplayCompanies;
    const query = searchQuery.toLowerCase();
    return allDisplayCompanies.filter(company =>
      company.nome?.toLowerCase().includes(query) ||
      company.frase_institucional?.toLowerCase().includes(query)
    );
  }, [allDisplayCompanies, searchQuery]);

  console.log('[CompanyManagement] Display companies:', {
    displayCompaniesCount: displayCompanies.length,
    isSuperAdmin,
    companiesArray: Array.isArray(companies),
    userCompaniesArray: Array.isArray(userCompanies)
  });

  const totalCompanies = displayCompanies.length;
  const filteredCount = searchQuery ? displayCompanies.length : null;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Empresas"
        description="Gerencie todas as empresas e seus usuários"
        size="xl"
        actions={
          <Button onClick={handleCreateCompany} className="rounded-2xl">
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        }
      />

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total de Empresas</p>
              {isLoading || metrics.loading ? (
                <div className="flex items-center mt-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-2xl font-bold">{totalCompanies}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
              {metrics.loading ? (
                <div className="flex items-center mt-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Empresas Criadas Este Mês</p>
              {metrics.loading ? (
                <div className="flex items-center mt-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-2xl font-bold">{metrics.companiesThisMonth}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de busca e filtros */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <AdminSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por nome ou frase institucional..."
              />
            </div>
            {filteredCount !== null && searchQuery && (
              <div className="text-sm text-muted-foreground">
                {filteredCount} {filteredCount === 1 ? 'empresa encontrada' : 'empresas encontradas'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de empresas */}
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
              {editingCompany ? 'Editar Empresa' : 'Criar Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Atualize os detalhes da empresa abaixo.' : 'Preencha o formulário para criar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <CompanyForm 
              initialData={editingCompany} 
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
              Gerenciar Usuários de {editingCompany?.nome}
            </DialogTitle>
            <DialogDescription>
              Adicione ou remova usuários desta empresa.
            </DialogDescription>
          </DialogHeader>
          {editingCompany && (
            <UserCompanyManager 
              company={editingCompany} 
              onClose={() => setIsUserManagerOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
