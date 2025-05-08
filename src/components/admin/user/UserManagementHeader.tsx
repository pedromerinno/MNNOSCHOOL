import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus, Plus } from 'lucide-react';
interface UserManagementHeaderProps {
  onAddAdminClick: () => void;
  onRefreshClick: () => void;
  loading: boolean;
  isRefreshing: boolean;
  onInviteUser?: () => void;
}
export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onAddAdminClick,
  onRefreshClick,
  loading,
  isRefreshing,
  onInviteUser
}) => {
  return <div className="space-y-6">
      <div>
        <h3 className="mb-2 px-0 py-[10px] font-bold text-xl">Gerenciamento de Usuários</h3>
        <p className="mb-4 text-gray-400 text-sm">
          Gerencie os usuários do sistema e suas permissões
        </p>
      </div>
      
      <div className="flex justify-end items-center gap-2">
        <Button onClick={onAddAdminClick} variant="default" size="sm" className="flex items-center gap-2 rounded-xl px-[15px] py-[20px]">
          <UserPlus className="h-4 w-4" />
          Adicionar Admin
        </Button>
        <Button onClick={onInviteUser} variant="outline" size="sm" className="flex items-center gap-2 rounded-xl px-[15px] py-[20px]">
          <Plus className="h-4 w-4" />
          Convidar Usuário
        </Button>
        <Button onClick={onRefreshClick} disabled={loading || isRefreshing} variant="outline" size="sm" className="flex items-center gap-2 rounded-xl px-[15px] py-[20px]">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {loading || isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>
    </div>;
};