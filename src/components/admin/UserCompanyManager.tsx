
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
import { supabase } from "@/integrations/supabase/client";
import { useCompanyUserManagement } from '@/hooks/company/useCompanyUserManagement';
import { toast } from "sonner";

interface UserCompanyManagerProps {
  company: Company;
  onClose: () => void;
}

export const UserCompanyManager: React.FC<UserCompanyManagerProps> = ({ company, onClose }) => {
  const { users, fetchUsers } = useUsers();
  const { assignUserToCompany, removeUserFromCompany } = useCompanyUserManagement();
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
      
      // Fetch users who are associated with this company from user_empresa table
      const { data, error } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('company_id', company.id);
        
      if (error) {
        console.error('Error fetching company user relationships:', error);
        toast("Erro ao buscar usuários", {
          description: error.message,
        });
        throw error;
      }
      
      console.log('User-company relationships:', data);
      
      if (data && data.length > 0) {
        const userIds = data.map(relation => relation.user_id);
        console.log('User IDs in this company:', userIds);
        
        // Get the full user profiles for these IDs from the users array
        const usersInCompany = users.filter(user => userIds.includes(user.id));
        console.log('Filtered company users:', usersInCompany);
        setCompanyUsers(usersInCompany);
      } else {
        console.log('No users found for this company');
        setCompanyUsers([]);
      }
    } catch (error) {
      console.error('Error fetching company users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    await fetchCompanyUsers();
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
      }
    } catch (error) {
      console.error('Error adding user to company:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const success = await removeUserFromCompany(userId, company.id);
      if (success) {
        // Refresh the list
        await fetchCompanyUsers();
      }
    } catch (error) {
      console.error('Error removing user from company:', error);
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
