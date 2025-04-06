
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { makeUserAdmin, setAdminStatusById } from '@/utils/adminUtils';
import { supabase } from "@/integrations/supabase/client";

// Interface for working with Supabase auth users
interface AuthUser {
  id: string;
  email?: string | null;
}

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const { toast } = useToast();

  // Make pedro@merinno.com an admin when the component mounts
  useEffect(() => {
    const setInitialAdmin = async () => {
      try {
        console.log("Attempting to set Pedro as admin...");
        const targetEmail = 'pedro@merinno.com';
        
        // First, try to find the user directly in the users data
        const existingUser = users.find(user => user.email === targetEmail);
        
        if (existingUser) {
          // If user is found in the current data, set admin directly
          console.log("Found Pedro in users list, setting admin directly");
          await setAdminStatusById(existingUser.id, true);
          toast({
            title: 'Sucesso',
            description: `${targetEmail} agora é um administrador.`,
          });
          fetchUsers(); // Refresh the list
          return;
        }
        
        // If user wasn't found in current data, try the makeUserAdmin function
        console.log("Pedro not found in current users list, using makeUserAdmin function");
        const success = await makeUserAdmin(targetEmail);
        
        if (success) {
          toast({
            title: 'Sucesso',
            description: `${targetEmail} agora é um administrador.`,
          });
          fetchUsers(); // Refresh the list
        }
      } catch (error: any) {
        console.error('Error in initial admin setup:', error);
        
        // Try a direct approach as a last resort
        try {
          console.log("Trying direct query to find and update Pedro's admin status");
          const { data: authData } = await supabase.auth.admin.listUsers();
          
          if (authData && Array.isArray(authData.users)) {
            const targetUser = (authData.users as AuthUser[]).find(u => u.email === 'pedro@merinno.com');
            
            if (targetUser) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', targetUser.id);
              
              if (!updateError) {
                toast({
                  title: 'Sucesso',
                  description: 'Pedro agora é um administrador (método alternativo).',
                });
                fetchUsers();
                return;
              }
            }
          }
          
          // If we got here, all attempts failed
          toast({
            title: 'Erro',
            description: error.message || 'Falha ao configurar administrador inicial',
            variant: 'destructive',
          });
        } catch (fallbackError) {
          console.error('Error in fallback admin setup:', fallbackError);
          toast({
            title: 'Erro',
            description: 'Falha ao configurar administrador usando todos os métodos disponíveis',
            variant: 'destructive',
          });
        }
      }
    };
    
    setInitialAdmin();
  }, [users.length]); // Re-run when users list changes

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
