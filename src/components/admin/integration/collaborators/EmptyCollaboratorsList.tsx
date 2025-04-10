
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Info } from "lucide-react";
import { Company } from "@/types/company";

interface EmptyCollaboratorsListProps {
  searchTerm: string;
  company: Company;
  onAddClick: () => void;
}

export const EmptyCollaboratorsList: React.FC<EmptyCollaboratorsListProps> = ({
  searchTerm,
  company,
  onAddClick
}) => {
  // If we have a search term, show that no results were found
  if (searchTerm) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center">
          <Search className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-500">
            Nenhum colaborador encontrado para "{searchTerm}"
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Tente outro termo de busca ou adicione novos colaboradores
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // If no company is selected, show a message
  if (!company || !company.id) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center">
          <Info className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-500">
            Selecione uma empresa para gerenciar colaboradores
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Default empty state for a company with no collaborators
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 text-center">
        <UserPlus className="h-8 w-8 text-gray-400 mx-auto" />
        <p className="mt-2 text-gray-500">
          Esta empresa não possui colaboradores
        </p>
        <Button 
          onClick={onAddClick} 
          className="mt-4"
          variant="default"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Colaboradores
        </Button>
      </CardContent>
    </Card>
  );
};
