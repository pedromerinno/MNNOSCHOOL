
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from 'lucide-react';
import { JobRole } from "@/types/job-roles";

interface TeamFilterBarProps {
  availableRoles: JobRole[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
  companyColor: string;
}

export const TeamFilterBar: React.FC<TeamFilterBarProps> = ({
  availableRoles,
  selectedRole,
  onRoleChange,
  companyColor
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div 
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${companyColor}20` }}
      >
        <Filter 
          className="h-4 w-4"
          style={{ color: companyColor }}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrar por cargo:
        </span>
        
        <Select value={selectedRole} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[200px]">
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
    </div>
  );
};
