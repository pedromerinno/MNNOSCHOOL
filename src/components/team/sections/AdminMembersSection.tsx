
import React from 'react';
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { ProfileCard } from '@/components/ui/profile-card';

interface AdminMembersSectionProps {
  members: TeamMember[];
  companyColor: string;
}

export const AdminMembersSection: React.FC<AdminMembersSectionProps> = ({
  members,
  companyColor
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Administradores
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {members.length} {members.length === 1 ? 'administrador' : 'administradores'}
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {members.map((member) => (
          <ProfileCard
            key={member.id}
            member={member}
            companyColor={companyColor}
          />
        ))}
      </div>
    </div>
  );
};
