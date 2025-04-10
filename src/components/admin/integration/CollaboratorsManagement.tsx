
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, UserPlus, UsersIcon, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { useUsers, UserProfile } from "@/hooks/useUsers";
import { useCompanyUserManagement } from "@/hooks/company/useCompanyUserManagement";

interface CollaboratorsManagementProps {
  company: Company;
}

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({ company }) => {
  const { users, loading: loadingUsers, fetchUsers } = useUsers();
  const { 
    loading: managementLoading, 
    assignUserToCompany, 
    removeUserFromCompany,
    getCompanyUsers 
  } = useCompanyUserManagement();
  
  const [companyUsers, setCompanyUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch company users when the component mounts or the company changes
  useEffect(() => {
    if (company) {
      fetchCompanyUsers();
    }
  }, [company.id]);
  
  // Make sure we have all users loaded
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchCompanyUsers = async () => {
    setLoading(true);
    try {
      const users = await getCompanyUsers(company.id);
      setCompanyUsers(users);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast.error('Erro ao carregar usuários da empresa');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter users that are not already assigned to the company
  const availableUsers = users.filter(user => 
    !companyUsers.some(companyUser => companyUser.id === user.id)
  );
  
  const filteredAvailableUsers = searchTerm.trim() === '' 
    ? availableUsers 
    : availableUsers.filter(user => {
        const searchValue = searchTerm.toLowerCase();
        return (
          (user.display_name && user.display_name.toLowerCase().includes(searchValue)) ||
          (user.email && user.email.toLowerCase().includes(searchValue))
        );
      });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prevSelected => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter(id => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };
  
  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Selecione pelo menos um usuário');
      return;
    }
    
    setLoading(true);
    
    try {
      // Add each selected user to the company
      const results = await Promise.all(
        selectedUsers.map(userId => assignUserToCompany(userId, company.id))
      );
      
      const successCount = results.filter(result => result).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} usuário(s) adicionado(s) com sucesso`);
        fetchCompanyUsers();
        setSelectedUsers([]);
        setIsDialogOpen(false);
      } else {
        toast.error('Não foi possível adicionar os usuários selecionados');
      }
    } catch (error) {
      console.error('Error adding users to company:', error);
      toast.error('Erro ao adicionar usuários à empresa');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário da empresa?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await removeUserFromCompany(userId, company.id);
      
      if (success) {
        toast.success('Usuário removido com sucesso');
        fetchCompanyUsers();
      } else {
        toast.error('Não foi possível remover o usuário');
      }
    } catch (error) {
      console.error('Error removing user from company:', error);
      toast.error('Erro ao remover usuário da empresa');
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Colaboradores</h3>
          <p className="text-sm text-muted-foreground">
            Controle quais usuários têm acesso a esta empresa
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Colaboradores
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Colaboradores</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email"
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {loadingUsers ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredAvailableUsers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {searchTerm.trim() !== '' 
                      ? 'Nenhum usuário encontrado' 
                      : 'Não há usuários disponíveis para adicionar'}
                  </div>
                ) : (
                  <Table>
                    <TableBody>
                      {filteredAvailableUsers.map(user => (
                        <TableRow 
                          key={user.id}
                          className={`cursor-pointer ${selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <TableCell className="py-2">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(user.display_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.display_name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-10">
                            <div className={`w-5 h-5 border rounded-sm flex items-center justify-center ${
                              selectedUsers.includes(user.id) 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'border-gray-300'
                            }`}>
                              {selectedUsers.includes(user.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddUsers}
                disabled={selectedUsers.length === 0 || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    Adicionar {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : companyUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Não há colaboradores associados a esta empresa ainda.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              variant="outline" 
              className="mt-4"
            >
              Adicionar primeiros colaboradores
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead className="w-16">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(user.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.display_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                          Colaborador
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Remover colaborador"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
