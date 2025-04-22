
import { useEffect } from 'react';
import { Company } from "@/types/company";
import { JobRole } from "@/types/job-roles";
import { useJobRolesState } from './useJobRolesState';
import { useJobRolesAPI } from './useJobRolesAPI';
import { toast } from "sonner";

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
    selectedRole,
    setSelectedRole,
    isFormOpen,
    setIsFormOpen,
    isSubmitting,
    setIsSubmitting,
    showRoleUsersDialog,
    setShowRoleUsersDialog
  } = state;

  const fetchJobRoles = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchJobRoles(company.id);
      setJobRoles(data);
    } catch (error) {
      console.error("Error fetching job roles:", error);
      toast.error("Erro ao carregar cargos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRole = async (role: Partial<JobRole>, isNew: boolean) => {
    try {
      setIsSubmitting(true);
      console.log("Saving role:", role, "isNew:", isNew);
      
      if (!role.title) {
        toast.error("Título do cargo é obrigatório");
        return false;
      }
      
      const savedRole = await api.saveRole(role, company.id, isNew);
      
      if (savedRole) {
        // Reset form state
        setEditingRole(null);
        setNewRole(null);
        setIsFormOpen(false);
        
        // Refresh job roles list
        await fetchJobRoles();
        
        toast.success(isNew ? "Cargo adicionado com sucesso" : "Cargo atualizado com sucesso");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error saving job role:", error);
      toast.error(`Erro ao salvar cargo: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cargo?")) {
      return false;
    }
    
    try {
      const success = await api.deleteRole(roleId);
      
      if (success) {
        await fetchJobRoles();
        toast.success("Cargo excluído com sucesso");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting job role:", error);
      toast.error(`Erro ao excluir cargo: ${error.message}`);
      return false;
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
    try {
      await Promise.all([
        api.updateRoleOrder(newRoles[roleIndex].id, newRoles[roleIndex].order_index),
        api.updateRoleOrder(newRoles[targetIndex].id, newRoles[targetIndex].order_index)
      ]);
    } catch (error: any) {
      console.error("Error reordering job roles:", error);
      toast.error(`Erro ao reordenar cargos: ${error.message}`);
      // Reload to get correct order
      fetchJobRoles();
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchJobRoles();
    }
  }, [company?.id]);

  return {
    ...state,
    handleSaveRole,
    handleDeleteRole,
    handleMoveRole,
    fetchJobRoles
  };
};
