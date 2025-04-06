
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const MakeAdminButton = () => {
  const { userProfile, makeAdmin } = useAuth();
  const { toast } = useToast();
  
  const handleMakeAdmin = async () => {
    try {
      await makeAdmin();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível transformar você em administrador: ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  if (userProfile.isAdmin) {
    return (
      <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md">
        <p className="text-green-800 dark:text-green-200">
          Você já é um administrador.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
      <h3 className="text-lg font-medium mb-2">Acesso administrativo</h3>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Clique no botão abaixo para se tornar um administrador e ter acesso ao painel administrativo.
      </p>
      <Button onClick={handleMakeAdmin}>
        Tornar-se administrador
      </Button>
    </div>
  );
};
