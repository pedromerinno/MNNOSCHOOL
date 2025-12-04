
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export const NoCompanySelected: React.FC = () => {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Nenhuma empresa selecionada</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Selecione uma empresa no menu superior para gerenciar suas configurações de integração.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
