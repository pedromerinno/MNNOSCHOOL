
import { useState, useEffect, useCallback } from 'react';
import { JobRole } from "@/types/job-roles";
import { Company } from "@/types/company";
import { useJobRolesAPI } from './useJobRolesAPI';
import { useJobRolesState } from './useJobRolesState';
import { toast } from "sonner";

export const useJobRoles = (company: Company) => {
  const {
    jobRoles,
    isLoading,
    setJobRoles,
    setIsLoading,
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
  } = useJobRolesState();

  const { fetchJobRoles, saveRole, deleteRole, updateRoleOrder } = useJobRolesAPI();

  // Load job roles when company changes
  useEffect(() => {
    if (company?.id) {
      setIsLoading(true);
      fetchJobRoles(company.id)
        .then(data => {
          setJobRoles(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [company?.id, fetchJobRoles, setJobRoles, setIsLoading]);

  // Save a job role (new or existing)
  const handleSaveRole = useCallback(async (role: Partial<JobRole>, isNew: boolean) => {
    if (!company?.id) {
      toast.error("Nenhuma empresa selecionada");
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Attempting to ${isNew ? 'create' : 'update'} role:`, role);
      const savedRole = await saveRole(role, company.id, isNew);
      
      if (savedRole) {
        if (isNew) {
          setJobRoles(prev => [...prev, savedRole]);
          setNewRole(null);
          toast.success("Cargo criado com sucesso");
        } else {
          setJobRoles(prev => 
            prev.map(item => item.id === savedRole.id ? savedRole : item)
          );
          setEditingRole(null);
          toast.success("Cargo atualizado com sucesso");
        }
        
        // Trigger refresh event for components that depend on job roles
        window.dispatchEvent(new Event('job-roles-updated'));
      } else {
        console.error("Failed to save role - no data returned");
        toast.error(`Erro ao ${isNew ? 'criar' : 'atualizar'} cargo`);
      }
    } catch (error) {
      console.error("Error in handleSaveRole:", error);
      toast.error(`Erro ao ${isNew ? 'criar' : 'atualizar'} cargo`);
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, saveRole, setEditingRole, setIsLoading, setJobRoles, setNewRole]);

  // Delete a job role
  const handleDeleteRole = useCallback(async (roleId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cargo?")) {
      setIsLoading(true);
      try {
        const success = await deleteRole(roleId);
        
        if (success) {
          setJobRoles(prev => prev.filter(role => role.id !== roleId));
          toast.success("Cargo excluído com sucesso");
          
          // Trigger refresh event
          window.dispatchEvent(new Event('job-roles-updated'));
        }
      } catch (error) {
        console.error("Error in handleDeleteRole:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [deleteRole, setIsLoading, setJobRoles]);

  // Reorder job roles
  const handleMoveRole = useCallback(async (roleId: string, direction: 'up' | 'down') => {
    const currentIndex = jobRoles.findIndex(role => role.id === roleId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < jobRoles.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    // Swap order indexes
    const currentRole = jobRoles[currentIndex];
    const targetRole = jobRoles[newIndex];
    
    setIsLoading(true);
    
    try {
      // Update the current role's order
      const success1 = await updateRoleOrder(currentRole.id, targetRole.order_index);
      
      // Update the target role's order
      const success2 = await updateRoleOrder(targetRole.id, currentRole.order_index);
      
      if (success1 && success2) {
        // Update local state to reflect the change
        const newRoles = [...jobRoles];
        [newRoles[currentIndex], newRoles[newIndex]] = [newRoles[newIndex], newRoles[currentIndex]];
        
        // Update the order_index properties
        [newRoles[currentIndex].order_index, newRoles[newIndex].order_index] = 
          [newRoles[newIndex].order_index, newRoles[currentIndex].order_index];
        
        setJobRoles(newRoles);
        
        // Trigger refresh event
        window.dispatchEvent(new Event('job-roles-updated'));
      }
    } catch (error) {
      console.error("Error in handleMoveRole:", error);
    } finally {
      setIsLoading(false);
    }
  }, [jobRoles, setIsLoading, setJobRoles, updateRoleOrder]);

  return {
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
  };
};
