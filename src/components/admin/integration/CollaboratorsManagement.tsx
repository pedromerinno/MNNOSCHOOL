
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users, Mail, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { UserProfile } from "@/hooks/useUsers";
import { useCompanyUserManagement } from "@/hooks/company/useCompanyUserManagement";

interface CollaboratorsManagementProps {
  company: Company;
}

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({ company }) => {
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { assignUserToCompany, removeUserFromCompany, getCompanyUsers, loading: actionLoading } = useCompanyUserManagement();

  // Fetch collaborators when the component mounts or when company changes
  useEffect(() => {
    if (company) {
      fetchCollaborators();
    }
  }, [company.id]);

  const fetchCollaborators = async () => {
    setIsLoading(true);
    try {
      const users = await getCompanyUsers(company.id);
      setCollaborators(users);
    } catch (error: any) {
      console.error('Error fetching collaborators:', error);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Search in profiles by display_name or email
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      
      // Filter out users that are already collaborators
      const filteredResults = data.filter(
        user => !collaborators.some(collab => collab.id === user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCollaborator = async (user: UserProfile) => {
    try {
      const success = await assignUserToCompany(user.id, company.id);
      
      if (success) {
        toast.success('Colaborador adicionado com sucesso');
        setIsDialogOpen(false);
        fetchCollaborators();
      } else {
        throw new Error('Falha ao adicionar colaborador');
      }
    } catch (error: any) {
      console.error('Error adding collaborator:', error);
      toast.error(`Erro ao adicionar colaborador: ${error.message}`);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este colaborador?')) return;
    
    try {
      const success = await removeUserFromCompany(userId, company.id);
      
      if (success) {
        toast.success('Colaborador removido com sucesso');
        fetchCollaborators();
      } else {
        throw new Error('Falha ao remover colaborador');
      }
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      toast.error(`Erro ao remover colaborador: ${error.message}`);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Colaboradores</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários que têm acesso a esta empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Busque um usuário pelo nome ou email para adicioná-lo a esta empresa.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center space-x-2 my-4">
              <div className="flex-1">
                <Input 
                  placeholder="Buscar por nome ou email" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || ''} alt={user.display_name || ''} />
                          <AvatarFallback>{getUserInitials(user.display_name || '')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleAddCollaborator(user)}
                        disabled={actionLoading}
                        size="sm"
                      >
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchTerm && !isSearching ? (
                <p className="text-center py-4 text-gray-500">
                  Nenhum usuário encontrado. Tente uma busca diferente.
                </p>
              ) : !searchTerm ? (
                <p className="text-center py-4 text-gray-500">
                  Digite um nome ou email para buscar usuários.
                </p>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : collaborators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Não há colaboradores associados a esta empresa.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              Adicionar primeiro colaborador
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
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || ''} alt={user.display_name || ''} />
                          <AvatarFallback>{getUserInitials(user.display_name || '')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          {user.is_admin && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {!user.is_admin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600"
                          onClick={() => handleRemoveCollaborator(user.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
