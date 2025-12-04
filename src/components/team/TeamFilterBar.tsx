
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from 'lucide-react';
import { JobRole } from "@/types/job-roles";
import { Button } from "@/components/ui/button";

interface TeamFilterBarProps {
  availableRoles: JobRole[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
  companyColor: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  viewToggle?: React.ReactNode;
}

export const TeamFilterBar: React.FC<TeamFilterBarProps> = ({
  availableRoles,
  selectedRole,
  onRoleChange,
  companyColor,
  searchQuery = "",
  onSearchChange,
  viewToggle
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Busca e Filtro lado a lado */}
        <div className="flex flex-1 items-center gap-3 w-full">
          {onSearchChange && (
            <div className="relative flex-1">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
              />
              <Input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10"
                style={{
                  borderColor: `${companyColor}30`
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => onSearchChange("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger className="w-[180px] sm:w-[200px]">
              <SelectValue placeholder="Todos os cargos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="unassigned">Sem cargo definido</SelectItem>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {viewToggle && (
          <div className="w-full sm:w-auto">
            {viewToggle}
          </div>
        )}
      </div>
    </div>
  );
};
