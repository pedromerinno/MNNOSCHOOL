
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { makeUserAdmin } from '@/utils/adminUtils';
import { Skeleton } from "@/components/ui/skeleton";

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const { toast } = useToast();
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Make pedro@merinno.com an admin when the component mounts
  useEffect(() => {
    const setInitialAdmin = async () => {
      if (initialSetupDone) return;
      
      try {
        console.log("Attempting to set initial admin...");
        const targetEmail = 'pedro@merinno.com';
        
        // Try to find if user already exists and is admin
        const existingAdmin = users.find(user => 
          user.email === targetEmail && user.is_admin
        );
        
        if (existingAdmin) {
          console.log("Initial admin is already set up");
          setInitialSetupDone(true);
          return;
        }
        
        // Try to make the user an admin
        await makeUserAdmin(targetEmail);
        toast({
          title: 'Sucesso',
          description: `${targetEmail} agora é um administrador.`,
        });
        setInitialSetupDone(true);
        fetchUsers(); // Refresh the list
      } catch (error: any) {
        console.error('Error in initial admin setup:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Falha ao configurar administrador inicial',
          variant: 'destructive',
        });
      }
    };
    
    // Only run setup if users are loaded and setup hasn't been done yet
    if (users.length > 0 && !initialSetupDone) {
      setInitialAdmin();
    }
  }, [users, initialSetupDone, toast, fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={loading || isRefreshing}
          className="relative"
        >
          {(loading || isRefreshing) ? "Atualizando..." : "Atualizar"}
          {isRefreshing && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
            </span>
          )}
        </Button>
      </div>
      
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
    </div>
  );
};
