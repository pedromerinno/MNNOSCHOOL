
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Users } from 'lucide-react';

interface UserManagementHeaderProps {
  onRefreshClick: () => void;
  loading: boolean;
  isRefreshing: boolean;
  onInviteUser?: () => void;
  onCreateUser?: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onRefreshClick,
  loading,
  isRefreshing,
  onInviteUser,
  onCreateUser
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="mb-2 px-0 py-[10px] text-xl font-semibold">Gerenciamento de Usuários</h3>
          <p className="mb-0 text-gray-400 text-sm">
            Gerencie os usuários do sistema e suas permissões
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onCreateUser && (
            <Button 
              onClick={onCreateUser} 
              variant="default" 
              size="sm" 
              className="flex items-center gap-2 rounded-xl px-[15px] py-[20px]"
            >
              <Users className="h-4 w-4" />
              Criar Usuário
            </Button>
          )}
          {onInviteUser && (
            <Button 
              onClick={onInviteUser} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 rounded-xl px-[15px] py-[20px]"
            >
              <Plus className="h-4 w-4" />
              Convidar Usuário
            </Button>
          )}
          <Button 
            onClick={onRefreshClick} 
            disabled={loading || isRefreshing} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 rounded-xl px-[15px] py-[20px]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {loading || isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
