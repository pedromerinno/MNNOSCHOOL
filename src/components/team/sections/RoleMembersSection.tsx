
import React from 'react';
import { UserProfile } from "@/hooks/useUsers";
import { JobRole } from "@/types/job-roles";
import { TeamMemberCard } from '../TeamMemberCard';
import { Briefcase } from 'lucide-react';

interface RoleMembersSectionProps {
  role: JobRole;
  members: UserProfile[];
  companyColor: string;
}

export const RoleMembersSection: React.FC<RoleMembersSectionProps> = ({
  role,
  members,
  companyColor
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${companyColor}20` }}
        >
          <Briefcase 
            className="h-5 w-5"
            style={{ color: companyColor }}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {role.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {members.length} {members.length === 1 ? 'colaborador' : 'colaboradores'}
          </p>
          {role.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
              {role.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            companyColor={companyColor}
            roleName={role.title}
          />
        ))}
      </div>
    </div>
  );
};
