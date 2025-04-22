import { useState, useEffect, useCallback, useRef } from 'react';
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

  const { fetchJobRoles, saveRole, deleteRole, updateRoleOrder, clearCache } = useJobRolesAPI();
  const initialLoadDone = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!company?.id) return;
    
    if (loadingRef.current) return;
    
    const loadRoles = async () => {
      if (!initialLoadDone.current) {
        setIsLoading(true);
        loadingRef.current = true;
      }
      
      try {
        const data = await fetchJobRoles(company.id);
        setJobRoles(data);
        initialLoadDone.current = true;
      } catch (error) {
        console.error("Error loading roles:", error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };
    
    loadRoles();
  }, [company?.id, fetchJobRoles, setJobRoles, setIsLoading]);

  const refreshJobRoles = useCallback(async (forceRefresh = true) => {
    if (!company?.id || loadingRef.current) return;
    
    setIsLoading(true);
    loadingRef.current = true;
    
    try {
      const data = await fetchJobRoles(company.id, forceRefresh);
      setJobRoles(data);
    } catch (error) {
      console.error("Error refreshing job roles:", error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [company?.id, fetchJobRoles, setJobRoles, setIsLoading]);

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
          console.log("Updating local state with updated role:", savedRole);
          setJobRoles(prev => 
            prev.map(item => item.id === savedRole.id ? savedRole : item)
          );
          setEditingRole(null);
          toast.success("Cargo atualizado com sucesso");
        }
        
        await refreshJobRoles(true);
        
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
  }, [company?.id, saveRole, setEditingRole, setIsLoading, setJobRoles, setNewRole, refreshJobRoles]);

  const handleDeleteRole = useCallback(async (roleId: string) => {
    if (!company?.id) return;
    
    if (window.confirm("Tem certeza que deseja excluir este cargo?")) {
      setIsLoading(true);
      try {
        const success = await deleteRole(roleId, company.id);
        
        if (success) {
          setJobRoles(prev => prev.filter(role => role.id !== roleId));
          toast.success("Cargo excluído com sucesso");
          
          window.dispatchEvent(new Event('job-roles-updated'));
        }
      } catch (error) {
        console.error("Error in handleDeleteRole:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [company?.id, deleteRole, setIsLoading, setJobRoles]);

  const handleMoveRole = useCallback(async (roleId: string, direction: 'up' | 'down') => {
    if (!company?.id) return;
    
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
    
    const currentRole = jobRoles[currentIndex];
    const targetRole = jobRoles[newIndex];
    
    setIsLoading(true);
    
    try {
      const success1 = await updateRoleOrder(currentRole.id, targetRole.order_index, company.id);
      const success2 = await updateRoleOrder(targetRole.id, currentRole.order_index, company.id);
      
      if (success1 && success2) {
        const newRoles = [...jobRoles];
        [newRoles[currentIndex], newRoles[newIndex]] = [newRoles[newIndex], newRoles[currentIndex]];
        
        [newRoles[currentIndex].order_index, newRoles[newIndex].order_index] = 
          [newRoles[newIndex].order_index, newRoles[currentIndex].order_index];
        
        setJobRoles(newRoles);
        
        window.dispatchEvent(new Event('job-roles-updated'));
      }
    } catch (error) {
      console.error("Error in handleMoveRole:", error);
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, jobRoles, setIsLoading, setJobRoles, updateRoleOrder]);

  useEffect(() => {
    return () => {
      if (company?.id) {
        clearCache(company.id);
      }
    };
  }, [company?.id, clearCache]);

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
    handleMoveRole,
    refreshJobRoles
  };
};
