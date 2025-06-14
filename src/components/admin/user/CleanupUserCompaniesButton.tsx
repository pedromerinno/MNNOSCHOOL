
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useCleanupUserCompanies } from '@/hooks/admin/useCleanupUserCompanies';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CleanupUserCompaniesButtonProps {
  userId: string;
}

export const CleanupUserCompaniesButton: React.FC<CleanupUserCompaniesButtonProps> = ({
  userId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { cleanupUserCompanies } = useCleanupUserCompanies();

  const handleCleanup = async () => {
    setIsLoading(true);
    try {
      await cleanupUserCompanies(userId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-orange-600 hover:text-orange-700 w-full"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Limpar Vínculos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Limpar Vinculações Duplicadas
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá remover todas as vinculações de empresa deste usuário, 
            mantendo apenas a mais recente. Esta operação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCleanup}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Limpando...' : 'Confirmar Limpeza'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
