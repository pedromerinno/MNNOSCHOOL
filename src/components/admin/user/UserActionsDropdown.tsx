
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
    is_admin: boolean;
    super_admin: boolean;
  };
  onEditClick: () => void;
  onDeleteClick: () => void;
  onToggleAdmin: () => void;
  onManageCompanies: () => void;
  onRefresh?: () => void;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onEditClick,
  onDeleteClick,
  onToggleAdmin,
  onManageCompanies,
  onRefresh
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onManageCompanies}>
          <Building className="mr-2 h-4 w-4" />
          Gerenciar Empresas
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <div className="p-1">
          <CleanupUserCompaniesButton 
            userId={user.id}
            onCleanupComplete={onRefresh}
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onToggleAdmin}>
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

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={onDeleteClick}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
