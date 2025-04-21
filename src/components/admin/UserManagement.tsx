
import React, { useState } from 'react';
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { AdminSetup } from './user/AdminSetup';
import { PermissionError } from './user/PermissionError';
import { AddAdminDialog } from './user/AddAdminDialog';
import { UserManagementHeader } from './user/UserManagementHeader';
import { UserManagementSkeleton } from './user/UserManagementSkeleton';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const { selectedCompany } = useCompanies();
  const { user } = useAuth();
  
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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

  const handleInviteUser = () => {
    setShowInviteDialog(true);
  };

  const copyCompanyId = () => {
    if (selectedCompany?.id) {
      navigator.clipboard.writeText(selectedCompany.id);
      toast.success("ID da empresa copiado!");
    }
  };

  // Filter users to show only current user when no companies exist
  const displayUsers = selectedCompany ? users : (user ? [user] : []);

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
        users={displayUsers}
        initialSetupDone={initialSetupDone}
        setInitialSetupDone={setInitialSetupDone}
        setPermissionError={setPermissionError}
        fetchUsers={fetchUsers}
      />
      
      {permissionError && <PermissionError />}
      
      {loading && displayUsers.length === 0 ? (
        <UserManagementSkeleton />
      ) : (
        <UserTable 
          users={displayUsers} 
          loading={loading} 
          onToggle={toggleAdminStatus} 
        />
      )}

      <AddAdminDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        fetchUsers={fetchUsers}
      />

      <AlertDialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ID da Empresa</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Compartilhe este ID com o usuário que deseja convidar:</p>
              <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <code className="flex-1">{selectedCompany?.id}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCompanyId}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction onClick={copyCompanyId}>
              Copiar ID
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
