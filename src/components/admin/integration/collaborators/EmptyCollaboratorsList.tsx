
import React from 'react';
import { EmptyState } from "@/components/ui/empty-state";
import { UserPlus, Search, Info, Users } from "lucide-react";
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
      <div className="flex justify-center">
        <EmptyState
          title="Nenhum colaborador encontrado"
          description={`Nenhum colaborador encontrado para "${searchTerm}".\nTente outro termo de busca ou adicione novos colaboradores.`}
          icons={[Search]}
        />
      </div>
    );
  }
  
  // If no company is selected, show a message
  if (!company || !company.id) {
    return (
      <div className="flex justify-center">
        <EmptyState
          title="Selecione uma empresa"
          description="Selecione uma empresa para gerenciar colaboradores"
          icons={[Info]}
        />
      </div>
    );
  }
  
  // Default empty state for a company with no collaborators
  return (
    <div className="flex justify-center">
      <EmptyState
        title="Nenhum colaborador"
        description="Esta empresa não possui colaboradores"
        icons={[UserPlus, Users]}
        action={{
          label: "Adicionar Colaboradores",
          onClick: onAddClick
        }}
      />
    </div>
  );
};
