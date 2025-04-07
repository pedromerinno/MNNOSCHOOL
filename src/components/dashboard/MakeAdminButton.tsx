
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const MakeAdminButton = () => {
  const { userProfile, makeAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleMakeAdmin = async () => {
    setLoading(true);
    try {
      await makeAdmin();
      toast({
        title: 'Sucesso',
        description: 'Você agora é um administrador.',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível transformar você em administrador: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (userProfile.isAdmin) {
    return (
      <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md flex items-center">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
        <p className="text-green-800 dark:text-green-200">
          Você já é um administrador. Acesse o painel administrativo para gerenciar usuários e recursos.
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
      <Button onClick={handleMakeAdmin} disabled={loading} className="flex items-center">
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Shield className="h-4 w-4 mr-2" />
        )}
        {loading ? "Processando..." : "Tornar-se administrador"}
      </Button>
    </div>
  );
};
