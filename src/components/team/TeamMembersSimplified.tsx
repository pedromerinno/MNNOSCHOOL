
import React, { useState, useEffect } from 'react';
import { UserProfile } from "@/hooks/useUsers";
import { AdminMembersSection } from './sections/AdminMembersSection';
import { RegularMembersSection } from './sections/RegularMembersSection';
import { TeamFilterBar } from './TeamFilterBar';
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";

interface TeamMembersSimplifiedProps {
  members: UserProfile[];
  companyId?: string;
  companyColor?: string;
}

export const TeamMembersSimplified: React.FC<TeamMembersSimplifiedProps> = ({
  members,
  companyId,
  companyColor = "#1EAEDB"
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [availableRoles, setAvailableRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available roles for the company
  useEffect(() => {
    const fetchRoles = async () => {
      if (!companyId) {
        setAvailableRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data: roles, error } = await supabase
          .from('job_roles')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching roles:', error);
          setAvailableRoles([]);
        } else {
          setAvailableRoles(roles || []);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setAvailableRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [companyId]);

  // Filter members based on selected role
  const filterMembersByRole = (membersList: UserProfile[]) => {
    if (selectedRoleFilter === 'all') {
      return membersList;
    }
    if (selectedRoleFilter === 'unassigned') {
      return membersList.filter(member => !member.cargo_id);
    }
    return membersList.filter(member => member.cargo_id === selectedRoleFilter);
  };

  // Separate admins and regular members
  const admins = members.filter(member => member.is_admin);
  const regularMembers = members.filter(member => !member.is_admin);
  
  // Apply role filter to regular members
  const filteredRegularMembers = filterMembersByRole(regularMembers);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <TeamFilterBar
        availableRoles={availableRoles}
        selectedRole={selectedRoleFilter}
        onRoleChange={setSelectedRoleFilter}
        companyColor={companyColor}
      />

      {/* Seção de Administradores */}
      {admins.length > 0 && (
        <AdminMembersSection 
          members={admins}
          companyColor={companyColor}
        />
      )}

      {/* Seção da Equipe */}
      <RegularMembersSection 
        members={filteredRegularMembers}
        companyColor={companyColor}
        selectedRoleFilter={selectedRoleFilter}
        availableRoles={availableRoles}
      />

      {/* Estado vazio */}
      {members.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum membro encontrado nesta empresa.
          </p>
        </div>
      )}
    </div>
  );
};
