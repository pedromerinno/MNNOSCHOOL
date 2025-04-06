
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserTable } from './UserTable';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const UserManagement = () => {
  const { users, loading, fetchUsers, toggleAdminStatus } = useUsers();
  const { toast } = useToast();

  // Make pedro@merinno.com an admin when the component mounts
  useEffect(() => {
    const makeUserAdmin = async () => {
      try {
        // Get the targetEmail user data
        const targetEmail = 'pedro@merinno.com';
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) throw error;
        
        // Ensure the data object and users array exist
        if (!data || !Array.isArray(data.users)) {
          throw new Error('Invalid response format from listUsers');
        }
        
        const targetUser = data.users.find(u => u.email === targetEmail);
        
        if (!targetUser) {
          throw new Error(`User with email ${targetEmail} not found`);
        }
        
        // Make the user an admin if they're not already
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUser.id);
        
        if (updateError) throw updateError;
        
        toast({
          title: 'Sucesso',
          description: `${targetEmail} agora é um administrador.`
        });
        
        // Refresh the user list
        fetchUsers();
      } catch (error: any) {
        console.error('Error making user admin:', error);
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      }
    };
    
    makeUserAdmin();
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
