
import { useState } from 'react';
import { JobRole } from "@/types/job-roles";

export const useJobRolesState = () => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [newRole, setNewRole] = useState<Partial<JobRole> | null>(null);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoleUsersDialog, setShowRoleUsersDialog] = useState(false);

  return {
    jobRoles,
    setJobRoles,
    isLoading,
    setIsLoading,
    editingRole,
    setEditingRole,
    newRole,
    setNewRole,
    selectedRole,
    setSelectedRole,
    isFormOpen,
    setIsFormOpen,
    isSubmitting,
    setIsSubmitting,
    showRoleUsersDialog,
    setShowRoleUsersDialog,
  };
};
