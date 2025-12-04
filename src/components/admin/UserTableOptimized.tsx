
import React, { useMemo, useState, useEffect } from 'react';
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
import { Users as UsersIcon, MapPin, Calendar, Briefcase, Shield, Mail } from 'lucide-react';
import { AdminTable, AdminTableColumn } from './AdminTable';

interface UserTableOptimizedProps {
  users: UserProfile[];
  loading: boolean;
  onToggle: (userId: string, currentStatus: boolean | null, isSuperAdmin?: boolean) => void;
  onDeleteUser?: (userId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const UserTableOptimized: React.FC<UserTableOptimizedProps> = ({
  users,
  loading,
  onToggle,
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
      const date = new Date(dateString + 'T00:00:00');
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
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
    setTimeout(() => {
      setEditDialogOpen(false);
      setEditingUser(null);
    }, 100);
  };

  const handlePermissionChange = async (userId: string, permission: string) => {
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return;

    console.log('Changing permission for user:', userId, 'to:', permission);

    try {
      switch (permission) {
        case 'user':
          if (currentUser.super_admin) {
            await onToggle(userId, true, true);
          }
          if (currentUser.is_admin) {
            await onToggle(userId, true, false);
          }
          break;
        case 'admin':
          if (currentUser.super_admin) {
            await onToggle(userId, true, true);
          }
          if (!currentUser.is_admin) {
            await onToggle(userId, false, false);
          }
          break;
        case 'super_admin':
          if (!currentUser.super_admin) {
            await onToggle(userId, false, true);
          }
          break;
      }
      
    } catch (error) {
      console.error('Error changing user permissions:', error);
    }
  };

  const getUserPermissionValue = (user: UserProfile): string => {
    if (user.super_admin) return 'super_admin';
    if (user.is_admin) return 'admin';
    return 'user';
  };

  const canChangePermissions = (targetUser: UserProfile): boolean => {
    if (isSuperAdmin) return true;
    if (targetUser.super_admin) return false;
    return isAdmin || false;
  };

  const canShowActions = (targetUser: UserProfile): boolean => {
    if (isSuperAdmin) return true;
    if (targetUser.super_admin) return false;
    if (isAdmin) return true;
    return false;
  };

  // Render avatar with better styling - matching CompanyTable style
  const renderAvatar = (user: UserProfile) => {
    if (user.avatar) {
      return (
        <div className="h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
          <img 
            src={user.avatar} 
            alt={user.display_name || user.email || 'Usuário'}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-base font-bold text-primary">${getUserInitials(user)}</span>`;
                parent.className = "h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-primary/10";
              }
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
        <span className="text-base font-bold text-primary">
          {getUserInitials(user)}
        </span>
      </div>
    );
  };

  // Define columns with improved styling
  const columns: AdminTableColumn<UserProfile>[] = [
    {
      id: 'avatar',
      header: 'Foto',
      cell: (user) => renderAvatar(user),
      className: 'w-16',
    },
    {
      id: 'display_name',
      header: 'Usuário',
      cell: (user) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {user.display_name || 'Sem nome'}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{user.email || 'Sem email'}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'cidade',
      header: 'Localização',
      cell: (user) => (
        user.cidade ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{user.cidade}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
      responsive: { hideBelow: 'md' },
    },
    {
      id: 'aniversario',
      header: 'Aniversário',
      cell: (user) => (
        user.aniversario ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatBirthday(user.aniversario)}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
      responsive: { hideBelow: 'lg' },
    },
    {
      id: 'professional',
      header: 'Profissional',
      cell: (user) => (
        <div className="flex flex-col gap-1">
          {user.nivel_colaborador && (
            <Badge variant="neutral" className="text-xs w-fit">
              {user.nivel_colaborador}
            </Badge>
          )}
          {user.tipo_contrato && (
            <span className="text-xs text-muted-foreground">{user.tipo_contrato}</span>
          )}
          {!user.nivel_colaborador && !user.tipo_contrato && (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
      responsive: { hideBelow: 'lg' },
    },
    {
      id: 'data_inicio',
      header: 'Data Início',
      cell: (user) => (
        user.data_inicio ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(user.data_inicio)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
      responsive: { hideBelow: 'xl' },
    },
    {
      id: 'manual_cultura_aceito',
      header: 'Manual',
      cell: (user) => (
        <Badge 
          variant={user.manual_cultura_aceito ? "success" : "warning"}
          className="text-xs"
        >
          {user.manual_cultura_aceito ? "Aceito" : "Pendente"}
        </Badge>
      ),
      responsive: { hideBelow: 'xl' },
    },
    {
      id: 'permissions',
      header: 'Permissões',
      cell: (user) => (
        canChangePermissions(user) ? (
          <Select
            value={getUserPermissionValue(user)}
            onValueChange={(value) => handlePermissionChange(user.id, value)}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectTrigger className="w-36 h-8 whitespace-nowrap">
              <Shield className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <SelectValue className="whitespace-nowrap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>Usuário</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </div>
              </SelectItem>
              {isSuperAdmin && (
                <SelectItem value="super_admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Super Admin</span>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        ) : (
          <Badge 
            variant={user.super_admin ? "default" : user.is_admin ? "default" : "neutral"}
            className="flex items-center gap-1.5 w-fit whitespace-nowrap"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{user.super_admin ? 'Super Admin' : user.is_admin ? 'Admin' : 'Usuário'}</span>
          </Badge>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (user) => {
        if (!canShowActions(user)) {
          return <div className="w-8 h-8" />;
        }
        return (
          <UserActionsDropdown
            user={user}
            onEditProfile={handleEditProfile}
            onToggleAdmin={onToggle}
            onDeleteUser={onDeleteUser}
            canDelete={isSuperAdmin || (isAdmin && !user.super_admin)}
          />
        );
      },
      align: 'right',
      className: 'w-20',
    },
  ];

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
      
      <AdminTable
        data={filteredAndSortedUsers}
        columns={columns}
        loading={loading}
        getRowKey={(user) => user.id}
        emptyState={{
          icon: UsersIcon,
          title: 'Nenhum usuário encontrado',
          description: searchQuery || permissionFilter !== 'all' 
            ? 'Tente ajustar os filtros de busca'
            : 'Comece adicionando um novo usuário',
        }}
      />

      <EditUserProfileDialog
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={editingUser}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};