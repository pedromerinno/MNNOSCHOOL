
import React, { useMemo, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/hooks/useUsers";
import { UserActionsDropdown } from './user/UserActionsDropdown';
import { EditUserProfileDialog } from './user/EditUserProfileDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/utils/stringUtils';
import { AdminSearchBar } from './AdminSearchBar';
import { Users as UsersIcon } from 'lucide-react';

interface UserTableOptimizedProps {
  users: UserProfile[];
  loading: boolean;
  onToggle: (userId: string, currentStatus: boolean | null, isSuperAdmin?: boolean) => void;
  onRefresh?: () => void;
  onDeleteUser?: (userId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const UserTableOptimized: React.FC<UserTableOptimizedProps> = ({
  users,
  loading,
  onToggle,
  onRefresh,
  onDeleteUser,
  searchQuery = '',
  onSearchChange
}) => {
  const { userProfile } = useAuth();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionFilter, setPermissionFilter] = useState<string>('all');

  // Debug: Log users data to check if avatars are present
  useEffect(() => {
    console.log('[UserTableOptimized] Users data:', users.map(user => ({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar: user.avatar,
      hasAvatar: !!user.avatar
    })));
  }, [users]);

  // Verificar se o usuário atual é super admin
  const isSuperAdmin = userProfile?.super_admin;
  const isAdmin = userProfile?.is_admin;

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
      // Criar a data assumindo que é uma data local (sem conversão de timezone)
      const date = new Date(dateString + 'T00:00:00');
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
      // Criar a data assumindo que é uma data local (sem conversão de timezone)
      const date = new Date(dateString + 'T00:00:00');
      return format(date, 'dd/MM', { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.display_name?.toLowerCase().includes(query)) ||
        (user.email?.toLowerCase().includes(query)) ||
        (user.cidade?.toLowerCase().includes(query)) ||
        (user.nivel_colaborador?.toLowerCase().includes(query))
      );
    }

    // Filter by permission
    if (permissionFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (permissionFilter === 'super_admin') return user.super_admin;
        if (permissionFilter === 'admin') return user.is_admin && !user.super_admin;
        if (permissionFilter === 'user') return !user.is_admin && !user.super_admin;
        return true;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      if (a.super_admin && !b.super_admin) return -1;
      if (!a.super_admin && b.super_admin) return 1;
      if (a.is_admin && !b.is_admin) return -1;
      if (!a.is_admin && b.is_admin) return 1;
      return (a.display_name || a.email || '').localeCompare(b.display_name || b.email || '');
    });
  }, [users, searchQuery, permissionFilter]);

  const getUserInitials = (user: UserProfile): string => {
    if (user.display_name) {
      return getInitials(user.display_name, 2);
    }
    if (user.email) {
      return getInitials(user.email, 1);
    }
    return 'U';
  };

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

  // Verificar se o usuário atual pode alterar as permissões de outro usuário
  const canChangePermissions = (targetUser: UserProfile): boolean => {
    // Super admins podem alterar qualquer um
    if (isSuperAdmin) return true;
    
    // Admins não podem alterar super admins
    if (targetUser.super_admin) return false;
    
    // Admins podem alterar usuários regulares
    return isAdmin || false;
  };

  // Verificar se pode mostrar o botão de ações
  const canShowActions = (targetUser: UserProfile): boolean => {
    // Super admins podem ver ações para qualquer usuário
    if (isSuperAdmin) return true;
    
    // Admins não podem ver ações para super admins
    if (targetUser.super_admin) return false;
    
    // Admins podem ver ações para usuários regulares e outros admins
    if (isAdmin) return true;
    
    // Usuários regulares não podem ver ações
    return false;
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
          <div className="flex flex-col items-center justify-center py-8">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium mb-1">Nenhum usuário encontrado</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || permissionFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando um novo usuário'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {onSearchChange && (
              <div className="flex-1">
                <AdminSearchBar
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Buscar por nome, email, cidade..."
                />
              </div>
            )}
            <Select value={permissionFilter} onValueChange={setPermissionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas permissões</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredAndSortedUsers.length === 0 && (searchQuery || permissionFilter !== 'all') && (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
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
                {filteredAndSortedUsers.map((user) => {
                  // Log for debugging avatar rendering
                  console.log('[UserTableOptimized] Rendering user:', {
                    id: user.id,
                    email: user.email,
                    avatar: user.avatar,
                    hasAvatar: !!user.avatar
                  });
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          {user.avatar && (
                            <AvatarImage 
                              src={user.avatar} 
                              alt={user.display_name || user.email || 'Usuário'}
                              onLoad={() => console.log('[UserTableOptimized] Avatar loaded successfully for:', user.email)}
                              onError={(e) => {
                                console.error('[UserTableOptimized] Avatar failed to load for:', user.email, 'URL:', user.avatar);
                                console.error('[UserTableOptimized] Error details:', e);
                              }}
                            />
                          )}
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
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
                        {canChangePermissions(user) ? (
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
                              {isSuperAdmin && (
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {user.super_admin ? 'Super Admin' : user.is_admin ? 'Admin' : 'Usuário'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {canShowActions(user) ? (
                          <UserActionsDropdown
                            user={user}
                            onEditProfile={handleEditProfile}
                            onToggleAdmin={onToggle}
                            onDeleteUser={onDeleteUser}
                            canDelete={isSuperAdmin || (isAdmin && !user.super_admin)}
                          />
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
