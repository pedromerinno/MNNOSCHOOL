
import React from 'react';
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { JobRole } from "@/types/job-roles";
import { ProfileCard } from '@/components/ui/profile-card';
import { Users } from 'lucide-react';

interface RegularMembersSectionProps {
  members: TeamMember[];
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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {getSectionTitle()}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {getSectionDescription()}
          </p>
        </div>
        <div 
          className="px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${companyColor}15`,
            color: companyColor
          }}
        >
          {members.length}
        </div>
      </div>
      
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {members.map((member) => (
            <ProfileCard
              key={member.id}
              member={member}
              companyColor={companyColor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Nenhum membro encontrado para este filtro.
          </p>
        </div>
      )}
    </div>
  );
};
