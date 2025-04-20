
import React, { useState, useEffect } from 'react';
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { AdminSetup } from './user/AdminSetup';
import { PermissionError } from './user/PermissionError';
import { AddAdminDialog } from './user/AddAdminDialog';
import { UserManagementHeader } from './user/UserManagementHeader';
import { UserManagementSkeleton } from './user/UserManagementSkeleton';
import { useAuth } from "@/contexts/AuthContext";
import { isSuperAdmin } from '@/utils/adminUtils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export const UserManagement = () => {
  const { userProfile } = useAuth();
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Add an effect to log user role for debugging
  useEffect(() => {
    if (userProfile) {
      console.log("UserManagement - User role:", {
        is_admin: userProfile?.is_admin,
        super_admin: userProfile?.super_admin,
        isSuperAdmin: isSuperAdmin(userProfile)
      });
    }
  }, [userProfile]);

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
      {!isSuperAdmin(userProfile) && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Acesso limitado</AlertTitle>
          <AlertDescription>
            Como administrador regular, você só pode ver e gerenciar usuários das suas empresas.
          </AlertDescription>
        </Alert>
      )}

      <UserManagementHeader 
        onAddAdminClick={() => setIsDialogOpen(true)}
        onRefreshClick={handleRefresh}
        loading={loading}
        isRefreshing={isRefreshing}
        isSuperAdmin={isSuperAdmin(userProfile)}
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
          isSuperAdmin={isSuperAdmin(userProfile)}
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
