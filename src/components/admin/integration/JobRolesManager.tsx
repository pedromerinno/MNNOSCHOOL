
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Briefcase, Check } from "lucide-react";
import { Company } from "@/types/company";
import { JobRole } from "@/types/job-roles";
import { useJobRoles } from "@/hooks/useJobRoles";
import { JobRolesList } from './job-roles/JobRolesList';
import { JobRoleForm } from './job-roles/JobRoleForm';
import RoleUsersDialog from './dialogs/RoleUsersDialog';

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
    handleMoveRole
  } = useJobRoles(company);

  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<{ id: string; display_name: string }[]>([]);

  const handleAddRole = () => {
    setNewRole({
      title: '',
      description: '',
      responsibilities: '',
      requirements: '',
      expectations: '',
      order_index: jobRoles.length,
      company_id: company.id
    });
  };

  const handleEditRole = (role: JobRole) => {
    setEditingRole(role);
  };

  const handleManageUsers = (role: JobRole) => {
    setSelectedRole(role);
    setShowRoleUsersDialog(true);
  };

  if (isLoading) {
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
          <Button onClick={handleAddRole}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cargo
          </Button>
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
            onManageUsers={handleManageUsers}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
          />
        </Card>
      )}

      {/* Role details dialog */}
      {selectedRole && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedRole.title}</DialogTitle>
              <DialogDescription>
                Detalhes do cargo e usuários associados
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {selectedRole.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Descrição</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRole.description}
                  </p>
                </div>
              )}

              {selectedRole.responsibilities && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Responsabilidades</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedRole.responsibilities}
                  </p>
                </div>
              )}

              {selectedRole.requirements && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Requisitos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedRole.requirements}
                  </p>
                </div>
              )}

              {selectedRole.expectations && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Expectativas</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedRole.expectations}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Usuários com este cargo</h4>
                {assignedUsers.length > 0 ? (
                  <ul className="space-y-1">
                    {assignedUsers.map(user => (
                      <li key={user.id} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{user.display_name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhum usuário está associado a este cargo
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Users management dialog */}
      {selectedRole && (
        <RoleUsersDialog 
          roleId={selectedRole.id}
          companyId={company.id}
        />
      )}
    </div>
  );
};
