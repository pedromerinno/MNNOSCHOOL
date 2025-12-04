
import React from 'react';
import { MoreHorizontal, Edit, Trash2, Shield, ShieldOff, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CleanupUserCompaniesButton } from './CleanupUserCompaniesButton';

interface UserActionsDropdownProps {
  user: {
    id: string;
    display_name: string | null;
    is_admin: boolean | null;
    super_admin?: boolean | null;
  };
  onEditProfile: (user: any) => void;
  onToggleAdmin: (userId: string, currentStatus: boolean | null, isSuperAdmin?: boolean) => void;
  onDeleteUser?: (userId: string) => void;
  canDelete?: boolean;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onEditProfile,
  onToggleAdmin,
  onDeleteUser,
  canDelete = false
}) => {
  const handleEditClick = () => {
    onEditProfile(user);
  };

  const handleDeleteClick = () => {
    if (onDeleteUser) {
      onDeleteUser(user.id);
    }
  };

  const handleToggleAdmin = () => {
    onToggleAdmin(user.id, user.is_admin, false);
  };

  const handleManageCompanies = () => {
    // TODO: Implement company management functionality
    console.log('Manage companies for user:', user.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800">
        <DropdownMenuItem 
          onClick={handleEditClick}
          className="cursor-pointer flex items-center gap-2 focus:bg-gray-100 dark:focus:bg-gray-700"
        >
          <Edit className="h-4 w-4" />
          <span>Editar Usuário</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleManageCompanies}
          className="cursor-pointer flex items-center gap-2 focus:bg-gray-100 dark:focus:bg-gray-700"
        >
          <Building className="h-4 w-4" />
          <span>Gerenciar Empresas</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <div className="p-1">
          <CleanupUserCompaniesButton 
            userId={user.id}
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleToggleAdmin}
          className="cursor-pointer flex items-center gap-2 focus:bg-gray-100 dark:focus:bg-gray-700"
        >
          {user.is_admin ? (
            <>
              <ShieldOff className="h-4 w-4" />
              <span>Remover Admin</span>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              <span>Tornar Admin</span>
            </>
          )}
        </DropdownMenuItem>

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              className="cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Usuário</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
