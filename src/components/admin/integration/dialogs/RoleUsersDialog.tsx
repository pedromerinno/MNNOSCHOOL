
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Search, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface RoleUsersDialogProps {
  roleId: string;
  companyId: string;
}

interface User {
  id: string;
  display_name: string;
  cargo_id: string | null;
}

const RoleUsersDialog: React.FC<RoleUsersDialogProps> = ({ roleId, companyId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Fetch company users
  const fetchCompanyUsers = async () => {
    setIsLoading(true);
    try {
      // First, get user IDs from the user_empresa table
      const { data: userEmpresas, error: userEmpresasError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);
        
      if (userEmpresasError) throw userEmpresasError;
      
      // Extract just the user_ids into an array
      const userIds = userEmpresas?.map(ue => ue.user_id) || [];
      
      if (userIds.length === 0) {
        setCompanyUsers([]);
        setAssignedUsers([]);
        setUnassignedUsers([]);
        setFilteredUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Then get the profiles that match these user IDs
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, cargo_id')
        .in('id', userIds);
        
      if (error) throw error;
      
      setCompanyUsers(data || []);
      
      // Separate users with and without this role
      const assigned = data?.filter(user => user.cargo_id === roleId) || [];
      const unassigned = data?.filter(user => user.cargo_id !== roleId) || [];
      
      setAssignedUsers(assigned);
      setUnassignedUsers(unassigned);
      setFilteredUsers(unassigned);
      
    } catch (error: any) {
      console.error("Error fetching company users:", error);
      toast.error(`Erro ao buscar usuários: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCompanyUsers();
  }, [roleId, companyId]);
  
  // Filter unassigned users when search changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = unassignedUsers.filter(user => 
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(unassignedUsers);
    }
  }, [searchQuery, unassignedUsers]);
  
  // Add user to role
  const assignUserToRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cargo_id: roleId })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update lists locally
      const user = unassignedUsers.find(u => u.id === userId);
      if (user) {
        const updatedUser = { ...user, cargo_id: roleId };
        setAssignedUsers([...assignedUsers, updatedUser]);
        setUnassignedUsers(unassignedUsers.filter(u => u.id !== userId));
        setFilteredUsers(filteredUsers.filter(u => u.id !== userId));
      }
      
      toast.success("Usuário adicionado ao cargo com sucesso");
      
    } catch (error: any) {
      console.error("Error assigning user to role:", error);
      toast.error(`Erro ao adicionar usuário ao cargo: ${error.message}`);
    }
  };
  
  // Remove user from role
  const removeUserFromRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cargo_id: null })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update lists locally
      const user = assignedUsers.find(u => u.id === userId);
      if (user) {
        const updatedUser = { ...user, cargo_id: null };
        setUnassignedUsers([...unassignedUsers, updatedUser]);
        setAssignedUsers(assignedUsers.filter(u => u.id !== userId));
        
        // Update filtered users only if user meets search criteria
        if (!searchQuery || updatedUser.display_name.toLowerCase().includes(searchQuery.toLowerCase())) {
          setFilteredUsers([...filteredUsers, updatedUser]);
        }
      }
      
      toast.success("Usuário removido do cargo com sucesso");
      
    } catch (error: any) {
      console.error("Error removing user from role:", error);
      toast.error(`Erro ao remover usuário do cargo: ${error.message}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
        <p className="mt-2 text-gray-500">Carregando usuários...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users with this role */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Usuários com esse cargo</h3>
          
          {assignedUsers.length === 0 ? (
            <div className="p-4 text-center bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm text-gray-500">
                Nenhum usuário possui este cargo
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <ul className="divide-y">
                  {assignedUsers.map(user => (
                    <li key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>{user.display_name}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeUserFromRole(user.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Remover</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Available users */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Usuários disponíveis</h3>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm text-gray-500">
                {searchQuery 
                  ? "Nenhum usuário encontrado com essa busca" 
                  : "Nenhum usuário disponível"
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <ul className="divide-y">
                  {filteredUsers.map(user => (
                    <li key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span>{user.display_name}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => assignUserToRole(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Adicionar</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleUsersDialog;
