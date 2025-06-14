
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
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleManageCompanies}>
          <Building className="mr-2 h-4 w-4" />
          Gerenciar Empresas
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <div className="p-1">
          <CleanupUserCompaniesButton 
            userId={user.id}
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleToggleAdmin}>
          {user.is_admin ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4" />
              Remover Admin
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Tornar Admin
            </>
          )}
        </DropdownMenuItem>

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
