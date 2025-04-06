
import React, { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Company } from '@/types/company';
import { UserProfile } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, X, RefreshCw } from 'lucide-react';
import { useCompanyUserManagement } from '@/hooks/company/useCompanyUserManagement';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

interface UserCompanyManagerProps {
  company: Company;
  onClose: () => void;
}

export const UserCompanyManager: React.FC<UserCompanyManagerProps> = ({ company, onClose }) => {
  const { users, fetchUsers } = useUsers();
  const { assignUserToCompany, removeUserFromCompany, getCompanyUsers } = useCompanyUserManagement();
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();
  const [companyUsers, setCompanyUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCompanyUsers();
  }, []);

  const fetchCompanyUsers = async () => {
    setLoading(true);
    try {
      console.log(`Fetching users for company: ${company.id}`);
      
      // Use the getCompanyUsers function which now returns data in UserProfile format
      const usersInCompany = await getCompanyUsers(company.id);
      console.log('Company users fetched:', usersInCompany);
      setCompanyUsers(usersInCompany);
      
    } catch (error: any) {
      console.error('Error fetching company users:', error);
      toast("Erro ao buscar usuários", {
        description: error.message || "Ocorreu um erro ao buscar os usuários da empresa",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    await fetchCompanyUsers();
    
    // Force refresh of companies data to update UI
    if (user?.id) {
      await forceGetUserCompanies(user.id);
    }
    
    setRefreshing(false);
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;
    
    try {
      const success = await assignUserToCompany(selectedUserId, company.id);
      if (success) {
        // Refresh the list
        await fetchCompanyUsers();
        // Reset selection
        setSelectedUserId('');
        
        // Force refresh of companies data to update UI immediately
        if (user?.id) {
          await forceGetUserCompanies(user.id);
        }
      }
    } catch (error: any) {
      console.error('Error adding user to company:', error);
      toast("Erro ao adicionar usuário", {
        description: error.message || "Ocorreu um erro ao adicionar o usuário à empresa",
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const success = await removeUserFromCompany(userId, company.id);
      if (success) {
        // Refresh the list
        await fetchCompanyUsers();
        
        // Add a small delay to ensure the database transaction completes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force refresh of companies data to update UI immediately
        if (user?.id) {
          console.log("Forcing refresh of user companies after removing user");
          await forceGetUserCompanies(user.id);
        }
        
        // Dispatch a custom event to notify components to refresh their company data
        window.dispatchEvent(new CustomEvent('company-relation-changed'));
      }
    } catch (error: any) {
      console.error('Error removing user from company:', error);
      toast("Erro ao remover usuário", {
        description: error.message || "Ocorreu um erro ao remover o usuário da empresa",
      });
    }
  };

  // Filter out users who are already in the company
  const availableUsers = users.filter(
    user => !companyUsers.some(companyUser => companyUser.id === user.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </SelectItem>
              ))}
              {availableUsers.length === 0 && (
                <SelectItem value="none" disabled>
                  Todos os usuários já estão associados
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleAddUser} 
          disabled={!selectedUserId || loading}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Usuários da Empresa</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Nenhum usuário associado a esta empresa
                    </TableCell>
                  </TableRow>
                ) : (
                  companyUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.display_name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};
