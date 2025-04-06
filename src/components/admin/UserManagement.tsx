
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { makeUserAdmin } from '@/utils/adminUtils';

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const { toast } = useToast();

  // Make pedro@merinno.com an admin when the component mounts
  useEffect(() => {
    const setInitialAdmin = async () => {
      try {
        const targetEmail = 'pedro@merinno.com';
        const success = await makeUserAdmin(targetEmail);
        
        if (success) {
          // Refresh the user list
          fetchUsers();
        }
      } catch (error: any) {
        console.error('Error in initial admin setup:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Failed to set up initial admin',
          variant: 'destructive',
        });
      }
    };
    
    setInitialAdmin();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>
      
      <UserTable 
        users={users} 
        loading={loading} 
        onToggleAdmin={toggleAdminStatus} 
      />
    </div>
  );
};
