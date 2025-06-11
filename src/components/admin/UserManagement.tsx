
import React, { useState } from 'react';
import { UserTableOptimized } from './UserTableOptimized';
import { useUsers } from '@/hooks/useUsers';
import { AdminSetup } from './user/AdminSetup';
import { PermissionError } from './user/PermissionError';
import { AddAdminDialog } from './user/AddAdminDialog';
import { UserManagementHeader } from './user/UserManagementHeader';
import { UserManagementSkeleton } from './user/UserManagementSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompanies } from '@/hooks/useCompanies';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CompanySelector } from '@/components/admin/integration/CompanySelector';

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showInviteInfo, setShowInviteInfo] = useState(false);
  
  // Use companies with skipLoadingInOnboarding to prevent conflicts
  const { userCompanies, isLoading: companiesLoading } = useCompanies({ 
    skipLoadingInOnboarding: false 
  });
  
  const [selectedInviteCompany, setSelectedInviteCompany] = useState(null);
  const { toast } = useToast();

  console.log('[UserManagement] Current state:', {
    usersCount: users.length,
    loading,
    isRefreshing,
    companiesCount: userCompanies?.length || 0,
    companiesLoading
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

  const handleCompanyChange = (companyId) => {
    const company = userCompanies?.find(c => c.id === companyId);
    setSelectedInviteCompany(company || null);
  };

  // Se não há usuários e não está carregando, mostrar estado vazio específico
  if (!loading && users.length === 0 && !permissionError) {
    return (
      <div className="space-y-4">
        <UserManagementHeader 
          onAddAdminClick={() => setIsDialogOpen(true)}
          onRefreshClick={handleRefresh}
          loading={loading}
          isRefreshing={isRefreshing}
          onInviteUser={handleInviteUser}
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
        onAddAdminClick={() => setIsDialogOpen(true)}
        onRefreshClick={handleRefresh}
        loading={loading}
        isRefreshing={isRefreshing}
        onInviteUser={handleInviteUser}
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
        />
      )}

      <Dialog open={showInviteInfo} onOpenChange={setShowInviteInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informações para Convite</DialogTitle>
            <DialogDescription>
              Selecione a empresa e compartilhe o ID com o novo usuário durante o cadastro:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <CompanySelector 
              companies={userCompanies || []} 
              selectedCompany={selectedInviteCompany}
              onCompanyChange={handleCompanyChange}
              disabled={companiesLoading}
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
                        description: "ID copiado para a área de transferência!",
                      });
                    }}
                    variant="outline"
                  >
                    Copiar
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  O novo usuário deve usar este ID ao se cadastrar para ser vinculado à empresa {selectedInviteCompany.nome} corretamente.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {companiesLoading ? "Carregando empresas..." : "Selecione uma empresa para ver o ID"}
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

      <AddAdminDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        fetchUsers={fetchUsers}
      />
    </div>
  );
};
