
import { useEffect } from 'react';
import { Company } from "@/types/company";
import { JobRole } from "@/types/job-roles";
import { useJobRolesState } from './useJobRolesState';
import { useJobRolesAPI } from './useJobRolesAPI';

export const useJobRoles = (company: Company) => {
  const state = useJobRolesState();
  const api = useJobRolesAPI();

  const {
    jobRoles,
    setJobRoles,
    isLoading,
    setIsLoading,
    editingRole,
    setEditingRole,
    newRole,
    setNewRole,
    setIsSubmitting,
    isSubmitting
  } = state;

  const fetchJobRoles = async () => {
    setIsLoading(true);
    const data = await api.fetchJobRoles(company.id);
    setJobRoles(data);
    setIsLoading(false);
  };

  const handleSaveRole = async (role: Partial<JobRole>, isNew: boolean) => {
    try {
      setIsSubmitting(true);
      const savedRole = await api.saveRole(role, company.id, isNew);
      if (savedRole) {
        // Reset form state and refresh list
        setEditingRole(null);
        setNewRole(null);
        await fetchJobRoles();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cargo?")) return;
    
    const success = await api.deleteRole(roleId);
    if (success) {
      await fetchJobRoles();
    }
  };

  const handleMoveRole = async (roleId: string, direction: 'up' | 'down') => {
    const roleIndex = jobRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return;
    
    const newRoles = [...jobRoles];
    const targetIndex = direction === 'up' ? roleIndex - 1 : roleIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newRoles.length) return;
    
    // Update order indexes
    const tempIndex = newRoles[roleIndex].order_index;
    newRoles[roleIndex].order_index = newRoles[targetIndex].order_index;
    newRoles[targetIndex].order_index = tempIndex;
    
    // Update positions in array
    [newRoles[roleIndex], newRoles[targetIndex]] = [newRoles[targetIndex], newRoles[roleIndex]];
    
    setJobRoles(newRoles);
    
    // Update in database
    await Promise.all([
      api.updateRoleOrder(newRoles[roleIndex].id, newRoles[roleIndex].order_index),
      api.updateRoleOrder(newRoles[targetIndex].id, newRoles[targetIndex].order_index)
    ]);
  };

  useEffect(() => {
    if (company) {
      fetchJobRoles();
    }
  }, [company]);

  return {
    ...state,
    handleSaveRole,
    handleDeleteRole,
    handleMoveRole,
    fetchJobRoles
  };
};
