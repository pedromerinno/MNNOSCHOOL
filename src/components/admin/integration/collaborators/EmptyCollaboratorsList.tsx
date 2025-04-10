
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import { Company } from "@/types/company";

interface EmptyCollaboratorsListProps {
  searchTerm: string;
  company: Company | null;
  onAddClick: () => void;
}

export const EmptyCollaboratorsList: React.FC<EmptyCollaboratorsListProps> = ({
  searchTerm,
  company,
  onAddClick
}) => {
  // Determine the appropriate message to display
  const getMessage = () => {
    if (searchTerm) {
      return "Nenhum colaborador corresponde à sua busca";
    } else if (!company) {
      return "Selecione uma empresa para visualizar colaboradores";
    } else {
      return "Adicione colaboradores à empresa";
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {getMessage()}
        </p>
        {!searchTerm && company && (
          <Button onClick={onAddClick} className="inline-flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Colaboradores
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
