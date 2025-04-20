
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
  company?: { id: string };
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Colaboradores</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os colaboradores da empresa e seus cargos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing || !company?.id}
            title="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={onAddClick}
            disabled={!company?.id}
          >
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
