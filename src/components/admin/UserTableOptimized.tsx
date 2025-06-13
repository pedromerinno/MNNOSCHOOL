import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/hooks/useUsers";
import { UserActionsDropdown } from './user/UserActionsDropdown';
import { EditUserProfileDialog } from './user/EditUserProfileDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserTableOptimizedProps {
  users: UserProfile[];
  loading: boolean;
  onToggle: (userId: string, currentStatus: boolean | null, isSuperAdmin?: boolean) => void;
  onRefresh?: () => void;
}

export const UserTableOptimized: React.FC<UserTableOptimizedProps> = ({
  users,
  loading,
  onToggle,
  onRefresh
}) => {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd/MM', { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.super_admin && !b.super_admin) return -1;
      if (!a.super_admin && b.super_admin) return 1;
      if (a.is_admin && !b.is_admin) return -1;
      if (!a.is_admin && b.is_admin) return 1;
      return (a.display_name || a.email || '').localeCompare(b.display_name || b.email || '');
    });
  }, [users]);

  const handleEditProfile = (user: UserProfile) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Forçar refresh imediato dos dados
    if (onRefresh) {
      onRefresh();
    }
    
    // Fechar o dialog após o refresh
    setTimeout(() => {
      setEditDialogOpen(false);
      setEditingUser(null);
    }, 100);
  };

  const handlePermissionChange = async (userId: string, permission: string) => {
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return;

    console.log('Changing permission for user:', userId, 'to:', permission);
    console.log('Current user permissions:', { 
      is_admin: currentUser.is_admin, 
      super_admin: currentUser.super_admin 
    });

    try {
      switch (permission) {
        case 'user':
          // Remove both admin and super admin
          if (currentUser.super_admin) {
            console.log('Removing super admin permission');
            await onToggle(userId, true, true); // Remove super admin
          }
          if (currentUser.is_admin) {
            console.log('Removing admin permission');
            await onToggle(userId, true, false); // Remove admin
          }
          break;
        case 'admin':
          // Set as admin, remove super admin if needed
          if (currentUser.super_admin) {
            console.log('Removing super admin permission first');
            await onToggle(userId, true, true); // Remove super admin first
          }
          if (!currentUser.is_admin) {
            console.log('Adding admin permission');
            await onToggle(userId, false, false); // Add admin
          }
          break;
        case 'super_admin':
          // Set as super admin
          if (!currentUser.super_admin) {
            console.log('Adding super admin permission');
            await onToggle(userId, false, true); // Add super admin
          }
          break;
      }
      
      // Refresh the data after permission change
      setTimeout(() => {
        if (onRefresh) {
          onRefresh();
        }
      }, 500);
      
    } catch (error) {
      console.error('Error changing user permissions:', error);
    }
  };

  const getUserPermissionValue = (user: UserProfile): string => {
    if (user.super_admin) return 'super_admin';
    if (user.is_admin) return 'admin';
    return 'user';
  };

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2">Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Manual</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || 'Sem nome'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email || 'Sem email'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.cidade || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatBirthday(user.aniversario)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.nivel_colaborador || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.tipo_contrato || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(user.data_inicio)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.manual_cultura_aceito ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {user.manual_cultura_aceito ? "Aceito" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={getUserPermissionValue(user)}
                        onValueChange={(value) => handlePermissionChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <UserActionsDropdown
                        user={user}
                        onEditProfile={handleEditProfile}
                        onToggleAdmin={onToggle}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditUserProfileDialog
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={editingUser}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};
