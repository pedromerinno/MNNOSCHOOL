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
  return <div className="flex justify-between items-center mb-4 gap-2 flex-wrap py-[20px]">
      <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
      <div className="flex items-center gap-2">
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