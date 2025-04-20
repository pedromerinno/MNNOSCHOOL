
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const PermissionError: React.FC = () => (
  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4 flex items-start dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
    <div>
      <p className="font-medium">Aviso de Permissão</p>
      <p className="text-sm">Você está visualizando os perfis de usuário, mas não tem acesso administrativo completo. Algumas informações, como emails reais, não estão disponíveis.</p>
    </div>
  </div>
);
