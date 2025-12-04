
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, Mail } from 'lucide-react';
import { AdminPageTitle } from '../AdminPageTitle';
import { Badge } from "@/components/ui/badge";

interface UserManagementHeaderProps {
  loading: boolean;
  onInviteUser?: () => void;
  onCreateUser?: () => void;
  stats?: {
    total: number;
    superAdmins: number;
    admins: number;
    regularUsers: number;
  };
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  loading,
  onInviteUser,
  onCreateUser,
  stats
}) => {
  return (
    <AdminPageTitle
      title="Gerenciamento de Usuários"
      description="Gerencie usuários, permissões e acessos da empresa"
      size="xl"
      badge={stats && (
        <Badge variant="secondary" className="ml-2">
          {stats.total} {stats.total === 1 ? 'usuário' : 'usuários'}
        </Badge>
      )}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {onCreateUser && (
            <Button 
              onClick={onCreateUser} 
              variant="default" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Criar Usuário
            </Button>
          )}
          {onInviteUser && (
            <Button 
              onClick={onInviteUser} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Convidar
            </Button>
          )}
        </div>
      }
    />
  );
};
