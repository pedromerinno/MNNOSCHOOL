
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, UserPlus } from 'lucide-react';
import { AdminSetup } from './user/AdminSetup';
import { PermissionError } from './user/PermissionError';
import { AddAdminDialog } from './user/AddAdminDialog';

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Admin
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={loading || isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {(loading || isRefreshing) ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>
      
      <AdminSetup
        users={users}
        initialSetupDone={initialSetupDone}
        setInitialSetupDone={setInitialSetupDone}
        setPermissionError={setPermissionError}
        fetchUsers={fetchUsers}
      />
      
      {permissionError && <PermissionError />}
      
      {loading && users.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <UserTable 
          users={users} 
          loading={loading} 
          onToggleAdmin={toggleAdminStatus} 
        />
      )}

      <AddAdminDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        fetchUsers={fetchUsers}
      />
    </div>
  );
};
