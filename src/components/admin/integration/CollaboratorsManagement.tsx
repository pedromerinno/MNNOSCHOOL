
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Search, 
  X, 
  UserX,
  BadgeCheck,
  BadgeX,
  Briefcase,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { useUsers } from "@/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserRoleAssignment } from './UserRoleAssignment';
import { JobRole } from '@/types/job-roles';

interface CollaboratorsManagementProps {
  company: Company;
}

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({ company }) => {
  const { users: allUsers, loading: loadingUsers, fetchUsers } = useUsers();
  const [isLoading, setIsLoading] = useState(true);
  const [companyUsers, setCompanyUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUsersDialog, setShowAddUsersDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  // Function to fetch company users
  const fetchCompanyUsers = async () => {
    if (!company || !company.id) {
      console.log("No company selected or company has no ID");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Fetching collaborators for company:", company.nome, company.id);
      
      const { data, error } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', company.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} collaborators`);
        setCompanyUsers(data.map(item => item.user_id));
        
        // Fetch user roles
        await fetchUserRoles(data.map(item => item.user_id));
      } else {
        console.log("No collaborators found for this company");
        setCompanyUsers([]);
        setUserRoles({});
      }
      
    } catch (error: any) {
      console.error("Error fetching company users:", error);
      toast.error(`Error loading collaborators: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch user roles
  const fetchUserRoles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    try {
      // First, fetch cargo_id info from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, cargo_id')
        .in('id', userIds);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return;
      
      // Filter users with assigned roles
      const usersWithRoles = data.filter(u => u.cargo_id);
      
      if (usersWithRoles.length === 0) {
        console.log("No users with assigned roles");
        return;
      }
      
      // Extract role IDs for search
      const cargoIds = usersWithRoles
        .map(u => u.cargo_id)
        .filter(Boolean) as string[];
      
      if (cargoIds.length === 0) return;
      
      console.log(`Fetching ${cargoIds.length} roles`);
      
      // Fetch role details
      const { data: rolesData, error: rolesError } = await supabase
        .from('job_roles')
        .select('id, title')
        .in('id', cargoIds);
        
      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) return;
      
      console.log(`Found ${rolesData.length} roles`);
      
      // Create role name map
      const roleNameMap: Record<string, string> = {};
      rolesData.forEach((role: JobRole) => {
        roleNameMap[role.id] = role.title;
      });
      
      // Map users to their role names
      const roleMap: Record<string, string> = {};
      usersWithRoles.forEach(user => {
        if (user.cargo_id && roleNameMap[user.cargo_id]) {
          roleMap[user.id] = roleNameMap[user.cargo_id];
        }
      });
      
      setUserRoles(roleMap);
      
    } catch (error: any) {
      console.error("Error fetching user roles:", error);
      toast.error(`Error loading user roles: ${error.message}`);
    }
  };
  
  // Load data when company changes
  useEffect(() => {
    if (company && company.id) {
      console.log("Company changed, loading collaborators:", company.nome);
      fetchCompanyUsers();
    }
  }, [company, reloadTrigger]);
  
  // Ensure users are loaded
  useEffect(() => {
    if (allUsers.length === 0 && !loadingUsers) {
      console.log("Loading users");
      fetchUsers();
    }
  }, [allUsers, loadingUsers, fetchUsers]);
  
  // Listen for company selection events and reload data
  useEffect(() => {
    const handleCompanyChange = (event: Event) => {
      console.log("CollaboratorsManagement: Company change event detected");
      fetchCompanyUsers();
    };
    
    window.addEventListener('settings-company-changed', handleCompanyChange);
    window.addEventListener('company-relation-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('settings-company-changed', handleCompanyChange);
      window.removeEventListener('company-relation-changed', handleCompanyChange);
    };
  }, [company]);
  
  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = (user.display_name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return displayName.includes(searchLower) || email.includes(searchLower);
  });
  
  // Separate users who are already in the company
  const availableUsers = filteredUsers.filter(user => !companyUsers.includes(user.id));
  const filteredCompanyUsers = filteredUsers.filter(user => companyUsers.includes(user.id));
  
  // Add user to company
  const addUserToCompany = async (userId: string) => {
    if (!company || !company.id) {
      toast.error("No company selected");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: userId,
          empresa_id: company.id
        });
        
      if (error) throw error;
      
      // Update company users list
      setCompanyUsers(prev => [...prev, userId]);
      toast.success("User added successfully");
      
    } catch (error: any) {
      console.error("Error adding user to company:", error);
      toast.error(`Error adding user: ${error.message}`);
    }
  };
  
  // Remove user from company
  const removeUserFromCompany = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the company?")) return;
    
    if (!company || !company.id) {
      toast.error("No company selected");
      return;
    }
    
    try {
      // First, remove user's role if they have one from this company
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cargo_id: null })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Then remove relation with company
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('empresa_id', company.id);
        
      if (error) throw error;
      
      // Update company users list
      setCompanyUsers(prev => prev.filter(id => id !== userId));
      setUserRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      
      toast.success("User removed successfully");
      
    } catch (error: any) {
      console.error("Error removing user from company:", error);
      toast.error(`Error removing user: ${error.message}`);
    }
  };
  
  // Open dialog to manage user's role
  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };
  
  // Handle role update success
  const handleRoleUpdateSuccess = () => {
    setReloadTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Colaboradores</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os colaboradores da empresa e seus cargos
          </p>
        </div>
        
        <Button onClick={() => setShowAddUsersDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Colaboradores
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isLoading || loadingUsers ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-500">Carregando colaboradores...</p>
          </CardContent>
        </Card>
      ) : filteredCompanyUsers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? "Nenhum colaborador corresponde à sua busca" 
                : company ? "Adicione colaboradores à empresa" : "Selecione uma empresa para visualizar colaboradores"}
            </p>
            {!searchTerm && company && (
              <Button onClick={() => setShowAddUsersDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Colaboradores
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanyUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.display_name || "Sem nome"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {userRoles[user.id] ? (
                        <>
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span>{userRoles[user.id]}</span>
                        </>
                      ) : (
                        <>
                          <BadgeX className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400">Sem cargo</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleDialog(user)}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Gerenciar Cargo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUserFromCompany(user.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Dialog to add users */}
      <Dialog open={showAddUsersDialog} onOpenChange={setShowAddUsersDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Colaboradores</DialogTitle>
            <DialogDescription>
              Selecione usuários para adicionar à empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {loadingUsers ? (
            <div className="h-72 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchTerm 
                  ? "Nenhum usuário corresponde à sua busca" 
                  : "Não há mais usuários disponíveis para adicionar"}
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.display_name || "Sem nome"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addUserToCompany(user.id);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowAddUsersDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog to manage user role */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Cargo</DialogTitle>
            <DialogDescription>
              Atribua um cargo ao colaborador
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && company && (
            <UserRoleAssignment 
              user={selectedUser}
              companyId={company.id}
              onSuccess={handleRoleUpdateSuccess}
            />
          )}
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
