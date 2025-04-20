
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export const NoCompanyState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Nenhuma empresa selecionada</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Selecione uma empresa para gerenciar seu conteúdo de integração.
        </p>
      </CardContent>
    </Card>
  );
};
