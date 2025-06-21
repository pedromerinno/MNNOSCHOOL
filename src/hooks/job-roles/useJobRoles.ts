
import { useState, useEffect, useCallback, useRef } from 'react';
import { JobRole } from "@/types/job-roles";
import { Company } from "@/types/company";
import { useJobRolesAPI } from './useJobRolesAPI';
import { useJobRolesState } from './useJobRolesState';
import { toast } from "sonner";

export const useJobRoles = (company: Company | null) => {
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
    if (!company?.id) {
      console.log('[useJobRoles] No company provided, resetting state');
      setJobRoles([]);
      setIsLoading(false);
      initialLoadDone.current = false;
      return;
    }
    
    if (loadingRef.current) {
      console.log('[useJobRoles] Already loading, skipping');
      return;
    }
    
    const loadRoles = async () => {
      try {
        if (!initialLoadDone.current) {
          console.log('[useJobRoles] Starting initial load for company:', company.id);
          setIsLoading(true);
          loadingRef.current = true;
        }
        
        const data = await fetchJobRoles(company.id);
        console.log('[useJobRoles] Roles loaded successfully:', data?.length || 0);
        setJobRoles(data);
        initialLoadDone.current = true;
      } catch (error) {
        console.error("[useJobRoles] Error loading roles:", error);
        setJobRoles([]);
        toast.error("Erro ao carregar cargos da empresa");
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };
    
    loadRoles();
  }, [company?.id, fetchJobRoles, setJobRoles, setIsLoading]);

  const refreshJobRoles = useCallback(async (forceRefresh = true) => {
    if (!company?.id || loadingRef.current) {
      console.log('[useJobRoles] Cannot refresh - no company or already loading');
      return;
    }
    
    setIsLoading(true);
    loadingRef.current = true;
    
    try {
      console.log("[useJobRoles] Refreshing job roles for company:", company.id);
      const data = await fetchJobRoles(company.id, forceRefresh);
      console.log("[useJobRoles] Refreshed job roles data:", data?.length || 0);
      setJobRoles(data);
    } catch (error) {
      console.error("[useJobRoles] Error refreshing job roles:", error);
      toast.error("Erro ao atualizar lista de cargos");
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
      console.log(`[useJobRoles] Attempting to ${isNew ? 'create' : 'update'} role:`, role);
      const savedRole = await saveRole(role, company.id, isNew);
      
      if (savedRole) {
        if (isNew) {
          console.log("[useJobRoles] Role created successfully");
          setNewRole(null);
        } else {
          console.log("[useJobRoles] Role updated successfully");
          setEditingRole(null);
        }
        
        // Always refresh the roles list after a successful save
        await refreshJobRoles(true);
        
        // Dispatch event for other components to refresh
        window.dispatchEvent(new Event('job-roles-updated'));
      }
    } catch (error: any) {
      console.error("[useJobRoles] Error in handleSaveRole:", error);
      // Error is already handled in the API layer
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, saveRole, setEditingRole, setIsLoading, setNewRole, refreshJobRoles]);

  const handleDeleteRole = useCallback(async (roleId: string) => {
    if (!company?.id) {
      toast.error("Nenhuma empresa selecionada");
      return;
    }
    
    if (window.confirm("Tem certeza que deseja excluir este cargo?")) {
      setIsLoading(true);
      try {
        const success = await deleteRole(roleId, company.id);
        
        if (success) {
          setJobRoles(prev => prev.filter(role => role.id !== roleId));
          
          // Dispatch event for other components to refresh
          window.dispatchEvent(new Event('job-roles-updated'));
        }
      } catch (error) {
        console.error("[useJobRoles] Error in handleDeleteRole:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [company?.id, deleteRole, setIsLoading, setJobRoles]);

  const handleMoveRole = useCallback(async (roleId: string, direction: 'up' | 'down') => {
    if (!company?.id) {
      console.log('[useJobRoles] No company selected for move operation');
      return;
    }
    
    const currentIndex = jobRoles.findIndex(role => role.id === roleId);
    if (currentIndex === -1) {
      console.log('[useJobRoles] Role not found for move operation');
      return;
    }
    
    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < jobRoles.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      console.log('[useJobRoles] Cannot move role further in that direction');
      return;
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
        
        // Dispatch event for other components to refresh
        window.dispatchEvent(new Event('job-roles-updated'));
      }
    } catch (error) {
      console.error("[useJobRoles] Error in handleMoveRole:", error);
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, jobRoles, setIsLoading, setJobRoles, updateRoleOrder]);

  useEffect(() => {
    // Clear cache when component unmounts
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
