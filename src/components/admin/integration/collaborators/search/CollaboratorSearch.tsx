
import React from 'react';
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CollaboratorSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  searchTerm,
  onSearchChange,
  isLoading,
  disabled
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Buscar colaboradores..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className="pl-10"
        disabled={isLoading || disabled}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
          onClick={() => onSearchChange("")}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
