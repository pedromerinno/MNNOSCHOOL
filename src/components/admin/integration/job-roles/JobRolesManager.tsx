
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Briefcase } from "lucide-react";
import { Company } from "@/types/company";
import { JobRole } from "@/types/job-roles";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { JobRolesList } from './JobRolesList';
import { JobRoleForm } from './JobRoleForm';
import { RoleDetailsDialog } from './dialogs/RoleDetailsDialog';
import RoleUsersDialog from '../dialogs/RoleUsersDialog';

interface JobRolesManagerProps {
  company: Company;
}

export const JobRolesManager: React.FC<JobRolesManagerProps> = ({ company }) => {
  const {
    jobRoles,
    isLoading,
    editingRole,
    setEditingRole,
    newRole,
    setNewRole,
    selectedRole,
    setSelectedRole,
    isFormOpen,
    setIsFormOpen,
    showRoleUsersDialog,
    setShowRoleUsersDialog,
    handleSaveRole,
    handleDeleteRole,
    handleMoveRole,
    refreshJobRoles
  } = useJobRoles(company);

  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<{ id: string; display_name: string }[]>([]);

  const handleAddRole = useCallback(() => {
    setNewRole({
      title: '',
      description: '',
      responsibilities: '',
      requirements: '',
      expectations: '',
      order_index: jobRoles.length,
      company_id: company.id
    });
  }, [jobRoles.length, company.id, setNewRole]);

  if (isLoading && jobRoles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando cargos...</p>
        </CardContent>
      </Card>
    );
  }

  if (jobRoles.length === 0 && !newRole) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum cargo adicionado</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Adicione informações sobre os cargos disponíveis na empresa
          </p>
          <Button onClick={handleAddRole}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Cargo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Lista de Cargos</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os cargos disponíveis na empresa
          </p>
        </div>
        
        {!newRole && !editingRole && (
          <div className="flex gap-2">
            <Button onClick={handleAddRole}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cargo
            </Button>
          </div>
        )}
      </div>

      {newRole && (
        <JobRoleForm
          role={newRole}
          isNew={true}
          onSave={() => handleSaveRole(newRole, true)}
          onCancel={() => setNewRole(null)}
        />
      )}

      {editingRole && (
        <JobRoleForm
          role={editingRole}
          isNew={false}
          onSave={() => handleSaveRole(editingRole, false)}
          onCancel={() => setEditingRole(null)}
        />
      )}

      {jobRoles.length > 0 && !newRole && !editingRole && (
        <Card>
          <JobRolesList
            jobRoles={jobRoles}
            onMoveRole={handleMoveRole}
            onShowDetails={(role) => {
              setSelectedRole(role);
              setShowDetailsDialog(true);
            }}
            onManageUsers={(role) => {
              setSelectedRole(role);
              setShowRoleUsersDialog(true);
            }}
            onEditRole={setEditingRole}
            onDeleteRole={handleDeleteRole}
          />
        </Card>
      )}

      <RoleDetailsDialog
        role={selectedRole}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        assignedUsers={assignedUsers}
      />

      {selectedRole && (
        <RoleUsersDialog
          roleId={selectedRole.id}
          companyId={company.id}
        />
      )}
    </div>
  );
};
