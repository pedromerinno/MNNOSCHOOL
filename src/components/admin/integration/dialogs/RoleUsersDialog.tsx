
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AssignedUsersList } from '../job-roles/components/AssignedUsersList';
import { UnassignedUsersList } from '../job-roles/components/UnassignedUsersList';

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

  const fetchCompanyUsers = async () => {
    setIsLoading(true);
    try {
      const { data: userEmpresas, error: userEmpresasError } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', companyId);
        
      if (userEmpresasError) throw userEmpresasError;
      
      const userIds = userEmpresas?.map(ue => ue.user_id) || [];
      
      if (userIds.length === 0) {
        setCompanyUsers([]);
        setAssignedUsers([]);
        setUnassignedUsers([]);
        setFilteredUsers([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, cargo_id')
        .in('id', userIds);
        
      if (error) throw error;
      
      setCompanyUsers(data || []);
      
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

  const assignUserToRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cargo_id: roleId })
        .eq('id', userId);
        
      if (error) throw error;
      
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

  const removeUserFromRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cargo_id: null })
        .eq('id', userId);
        
      if (error) throw error;
      
      const user = assignedUsers.find(u => u.id === userId);
      if (user) {
        const updatedUser = { ...user, cargo_id: null };
        setUnassignedUsers([...unassignedUsers, updatedUser]);
        setAssignedUsers(assignedUsers.filter(u => u.id !== userId));
        
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
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Usuários com esse cargo</h3>
          <AssignedUsersList 
            users={assignedUsers}
            onRemoveUser={removeUserFromRole}
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Usuários disponíveis</h3>
          <UnassignedUsersList
            users={filteredUsers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAssignUser={assignUserToRole}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleUsersDialog;
