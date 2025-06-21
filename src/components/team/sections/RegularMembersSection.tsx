
import React from 'react';
import { UserProfile } from "@/types/user";
import { JobRole } from "@/types/job-roles";
import { TeamMemberCard } from '../TeamMemberCard';
import { Users } from 'lucide-react';

interface RegularMembersSectionProps {
  members: UserProfile[];
  companyColor: string;
  selectedRoleFilter: string;
  availableRoles: JobRole[];
}

export const RegularMembersSection: React.FC<RegularMembersSectionProps> = ({
  members,
  companyColor,
  selectedRoleFilter,
  availableRoles
}) => {
  const getSectionTitle = () => {
    if (selectedRoleFilter === 'all') {
      return 'Equipe';
    }
    if (selectedRoleFilter === 'unassigned') {
      return 'Sem Cargo Definido';
    }
    const selectedRole = availableRoles.find(role => role.id === selectedRoleFilter);
    return selectedRole ? selectedRole.title : 'Equipe';
  };

  const getSectionDescription = () => {
    const count = members.length;
    if (selectedRoleFilter === 'unassigned') {
      return `${count} ${count === 1 ? 'colaborador' : 'colaboradores'}`;
    }
    return `${count} ${count === 1 ? 'membro' : 'membros'}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Users className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getSectionTitle()}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getSectionDescription()}
          </p>
        </div>
      </div>
      
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              companyColor={companyColor}
              roleName={member.roleName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum membro encontrado para este filtro.
          </p>
        </div>
      )}
    </div>
  );
};
