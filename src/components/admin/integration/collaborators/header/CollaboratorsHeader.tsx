
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CollaboratorsHeaderProps {
  onAddClick: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  error: string | null;
  company?: {
    id: string;
  };
}

export const CollaboratorsHeader: React.FC<CollaboratorsHeaderProps> = ({
  onAddClick,
  onRefresh,
  refreshing,
  error,
  company
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-2 px-0 py-[10px] font-bold text-2xl">Colaboradores</h3>
          <p className="mb-0 text-gray-400 text-sm">
            Gerencie os colaboradores da empresa e seus cargos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing || !company?.id} title="Atualizar" className="py-[30px] px-[30px]">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button onClick={onAddClick} disabled={!company?.id} className="rounded-xl font-normal py-[30px] px-[20px]">
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Colaboradores
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
