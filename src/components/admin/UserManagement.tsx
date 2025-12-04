import React, { useState, useEffect, useMemo } from 'react';
import { UserTableOptimized } from './UserTableOptimized';
import { useUsers } from '@/hooks/useUsers';
import { AdminSetup } from './user/AdminSetup';
import { PermissionError } from './user/PermissionError';
import { SimpleCreateUserDialog } from './user/SimpleCreateUserDialog';
import { UserManagementHeader } from './user/UserManagementHeader';
import { PagePreloader } from '@/components/ui/PagePreloader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InviteCompanySelector } from './user/InviteCompanySelector';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Shield, ShieldCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus, deleteUser } = useUsers();
  
  // Debug: Log estado atual
  useEffect(() => {
    console.log('[UserManagement] Current state:', {
      usersCount: users.length,
      loading,
      hasUsers: users.length > 0
    });
  }, [users.length, loading]);
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [showInviteInfo, setShowInviteInfo] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedInviteCompany, setSelectedInviteCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Use companies hook for invite functionality
  const { userCompanies, isLoading: companiesLoading, selectedCompany } = useCompanies({ 
    skipLoadingInOnboarding: false 
  });

  // Calcular estatísticas dos usuários
  const stats = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter(u => u.super_admin).length;
    const admins = users.filter(u => u.is_admin && !u.super_admin).length;
    const regularUsers = total - superAdmins - admins;
    
    return {
      total,
      superAdmins,
      admins,
      regularUsers
    };
  }, [users]);

  const handleInviteUser = () => {
    setSelectedInviteCompany(null);
    setShowInviteInfo(true);
  };

  const handleCreateUser = () => {
    setShowCreateUser(true);
  };

  const handleCreateUserSuccess = () => {
    fetchUsers();
  };

  const handleCompanyChange = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    setSelectedInviteCompany(company || null);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  // Listen for company relation changes to refresh user list
  useEffect(() => {
    const handleCompanyRelationChange = () => {
      console.log('[UserManagement] Company relation changed, refreshing users');
      fetchUsers();
    };

    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [fetchUsers]);

  // Se não há usuários e não está carregando (nem usuários nem empresas), mostrar estado vazio específico
  // Só mostrar empty state se realmente terminou de carregar tudo
  // Considera loading se: está carregando usuários, está carregando empresas, ou há empresas mas nenhuma selecionada (aguardando seleção)
  const isActuallyLoading = loading || companiesLoading || (!selectedCompany && userCompanies.length > 0);
  // Só mostrar empty state se: não está carregando, há empresa selecionada (garante que tentou buscar), não há usuários, e não há erro
  const shouldShowEmptyState = !isActuallyLoading && selectedCompany && users.length === 0 && !permissionError;
  
  console.log('[UserManagement] Empty state check:', {
    isActuallyLoading,
    hasSelectedCompany: !!selectedCompany,
    selectedCompanyId: selectedCompany?.id,
    selectedCompanyName: selectedCompany?.nome,
    usersCount: users.length,
    permissionError,
    shouldShowEmptyState,
    loading,
    companiesLoading,
    userCompaniesCount: userCompanies.length
  });
  
  if (shouldShowEmptyState) {
    // Verificar se há problema de permissão ou se realmente não há usuários
    const hasCompany = !!selectedCompany;
    const companyName = selectedCompany?.nome || 'empresa selecionada';
    
    return (
      <div className="space-y-6">
        <UserManagementHeader 
          loading={loading}
          onInviteUser={handleInviteUser}
          onCreateUser={handleCreateUser}
          stats={stats}
        />
        
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <EmptyState
            title="Nenhum usuário encontrado"
            description={
              hasCompany 
                ? `Não há usuários vinculados à empresa "${companyName}" ainda. Comece criando ou convidando um novo usuário.`
                : "Não há usuários cadastrados ainda. Comece criando ou convidando um novo usuário."
            }
            icons={[Users, UserPlus]}
            action={{
              label: "Criar Usuário",
              onClick: handleCreateUser
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              console.log('[UserManagement] Manual refresh triggered');
              fetchUsers();
            }}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Recarregar Usuários'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader 
        loading={loading}
        onInviteUser={handleInviteUser}
        onCreateUser={handleCreateUser}
        stats={stats}
      />
      
      {/* Estatísticas rápidas */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Super Admins</p>
                  <p className="text-2xl font-bold">{stats.superAdmins}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Usuários</p>
                  <p className="text-2xl font-bold">{stats.regularUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <AdminSetup
        users={users}
        initialSetupDone={initialSetupDone}
        setInitialSetupDone={setInitialSetupDone}
        setPermissionError={setPermissionError}
        fetchUsers={fetchUsers}
      />
      
      {permissionError && <PermissionError />}
      
      {isActuallyLoading && users.length === 0 ? (
        <PagePreloader />
      ) : (
        <UserTableOptimized 
          users={users} 
          loading={loading} 
          onToggle={toggleAdminStatus}
          onDeleteUser={handleDeleteUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Dialog de informações de convite */}
      <Dialog open={showInviteInfo} onOpenChange={setShowInviteInfo}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Informações para Convite Manual</DialogTitle>
            <DialogDescription>
              Use este método apenas se preferir enviar o código da empresa manualmente:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <InviteCompanySelector 
              selectedCompany={selectedInviteCompany}
              onCompanyChange={handleCompanyChange}
            />
            
            {selectedInviteCompany ? (
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    value={selectedInviteCompany?.id || ''} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedInviteCompany?.id || '');
                      toast({
                        title: "Sucesso",
                        description: "Código da empresa copiado!",
                      });
                    }}
                    variant="outline"
                  >
                    Copiar
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  O usuário deve usar este código ao se cadastrar para ser vinculado à empresa.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecione uma empresa para ver o código
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowInviteInfo(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SimpleCreateUserDialog
        isOpen={showCreateUser}
        onOpenChange={setShowCreateUser}
        onSuccess={handleCreateUserSuccess}
      />
    </div>
  );
};
