
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, UserCog } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean | null;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First fetch auth users to get emails
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }
      
      // Ensure users array exists in the response
      if (!authData || !authData.users) {
        throw new Error('Failed to fetch users');
      }
      
      // Now fetch profiles to get admin status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, is_admin');
        
      if (profilesError) {
        throw profilesError;
      }
      
      // Merge the data - make sure we're accessing properties correctly
      const mergedUsers = authData.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        return {
          id: user.id,
          email: user.email || '',
          display_name: profile?.display_name || (user.email ? user.email.split('@')[0] : ''),
          is_admin: profile?.is_admin || false
        };
      });
      
      setUsers(mergedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao buscar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus } 
          : user
      ));
      
      toast({
        title: 'Sucesso',
        description: `Usuário ${currentStatus ? 'removido da' : 'adicionado à'} lista de administradores.`,
      });
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Make pedro@merinno.com an admin when the component mounts
  useEffect(() => {
    const makeUserAdmin = async () => {
      try {
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('id, is_admin')
          .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
          .single();
          
        if (userError) throw userError;
        
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.display_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Usuário
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      {user.is_admin ? "Remover Admin" : "Tornar Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
