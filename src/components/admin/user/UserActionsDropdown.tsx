
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Shield, ShieldCheck, Trash } from "lucide-react";
import { UserProfile } from "@/hooks/useUsers";

interface UserActionsDropdownProps {
  user: UserProfile;
  onEditProfile: (user: UserProfile) => void;
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
  const handleDeleteUser = () => {
    if (onDeleteUser && canDelete) {
      const confirmDelete = window.confirm(`Tem certeza que deseja excluir o usuário ${user.display_name || user.email}?`);
      if (confirmDelete) {
        onDeleteUser(user.id);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditProfile(user)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar Perfil
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onToggleAdmin(user.id, user.is_admin, false)}
        >
          <Shield className="mr-2 h-4 w-4" />
          {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onToggleAdmin(user.id, user.super_admin, true)}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          {user.super_admin ? 'Remover Super Admin' : 'Tornar Super Admin'}
        </DropdownMenuItem>
        
        {canDelete && onDeleteUser && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteUser}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir Usuário
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
