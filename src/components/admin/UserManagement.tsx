
import React, { useState, useEffect } from 'react';
import { UserTableOptimized } from './UserTableOptimized';
import { useUsers } from '@/hooks/useUsers';
import { AdminSetup } from './user/AdminSetup';
import { PermissionError } from './user/PermissionError';
import { SimpleCreateUserDialog } from './user/SimpleCreateUserDialog';
import { UserManagementHeader } from './user/UserManagementHeader';
import { UserManagementSkeleton } from './user/UserManagementSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InviteCompanySelector } from './user/InviteCompanySelector';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus, deleteUser } = useUsers();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [showInviteInfo, setShowInviteInfo] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedInviteCompany, setSelectedInviteCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Use companies hook for invite functionality
  const { userCompanies } = useCompanies({ 
    skipLoadingInOnboarding: false 
  });

  console.log('[UserManagement] Current state:', {
    usersCount: users.length,
    loading,
    isRefreshing,
    companiesCount: userCompanies?.length || 0
  });

  const handleRefresh = async () => {
    console.log('[UserManagement] Manual refresh requested');
    setIsRefreshing(true);
    try {
      await fetchUsers();
      setPermissionError(false);
      toast({
        title: "Sucesso",
        description: "Lista de usuários atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('[UserManagement] Error refreshing users:', error);
      if (error?.message?.includes('permission') || error?.status === 403) {
        setPermissionError(true);
      }
      toast({
        title: "Erro",
        description: "Erro ao atualizar lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // Se não há usuários e não está carregando, mostrar estado vazio específico
  if (!loading && users.length === 0 && !permissionError) {
    return (
      <div className="space-y-4">
        <UserManagementHeader 
          onRefreshClick={handleRefresh}
          loading={loading}
          isRefreshing={isRefreshing}
          onInviteUser={handleInviteUser}
          onCreateUser={handleCreateUser}
        />
        
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhum usuário encontrado. Clique em "Atualizar" para tentar novamente.
          </p>
          <Button 
            onClick={handleRefresh} 
            className="mt-4"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserManagementHeader 
        onRefreshClick={handleRefresh}
        loading={loading}
        isRefreshing={isRefreshing}
        onInviteUser={handleInviteUser}
        onCreateUser={handleCreateUser}
      />
      
      <AdminSetup
        users={users}
        initialSetupDone={initialSetupDone}
        setInitialSetupDone={setInitialSetupDone}
        setPermissionError={setPermissionError}
        fetchUsers={fetchUsers}
      />
      
      {permissionError && <PermissionError />}
      
      {loading && users.length === 0 ? (
        <UserManagementSkeleton />
      ) : (
        <UserTableOptimized 
          users={users} 
          loading={isRefreshing} 
          onToggle={toggleAdminStatus}
          onRefresh={handleRefresh}
          onDeleteUser={handleDeleteUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      <Dialog open={showInviteInfo} onOpenChange={setShowInviteInfo}>
        <DialogContent>
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
