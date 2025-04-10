
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
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {searchTerm 
            ? "Nenhum colaborador corresponde à sua busca" 
            : company ? "Adicione colaboradores à empresa" : "Selecione uma empresa para visualizar colaboradores"}
        </p>
        {!searchTerm && company && (
          <Button onClick={onAddClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Colaboradores
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
