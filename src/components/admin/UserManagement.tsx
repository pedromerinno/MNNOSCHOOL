import React, { useState } from 'react';
import { UserTable } from './UserTable';
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

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false); // Controle do modal de convite
  const [showInviteInfo, setShowInviteInfo] = useState(false);
  const { selectedCompany } = useCompanies();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUsers();
      setPermissionError(false);
    } catch (error: any) {
      console.error('Error refreshing users:', error);
      if (error?.message?.includes('permission') || error?.status === 403) {
        setPermissionError(true);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // EXEMPLO DE PLACEHOLDER: aqui abrimos um toast/alerta, mas idealmente seria um Dialog de convite real
  const handleInviteUser = () => {
    setShowInviteInfo(true);
  };

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
        <UserTable 
          users={users} 
          loading={loading} 
          onToggle={toggleAdminStatus} 
        />
      )}

      <Dialog open={showInviteInfo} onOpenChange={setShowInviteInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informações para Convite</DialogTitle>
            <DialogDescription>
              Compartilhe este ID da empresa com o novo usuário durante o cadastro:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={selectedCompany?.id || ''} 
                readOnly 
                className="font-mono"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCompany?.id || '');
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
              O novo usuário deve usar este ID ao se cadastrar para ser vinculado à empresa corretamente.
            </p>
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
