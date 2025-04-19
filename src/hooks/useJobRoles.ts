
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";
import { Company } from "@/types/company";

export const useJobRoles = (company: Company) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [newRole, setNewRole] = useState<Partial<JobRole> | null>(null);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoleUsersDialog, setShowRoleUsersDialog] = useState(false);

  const fetchJobRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', company.id)
        .order('order_index');
        
      if (error) throw error;
      setJobRoles(data || []);
    } catch (error: any) {
      console.error("Error fetching job roles:", error);
      toast.error(`Erro ao carregar cargos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRole = async (role: Partial<JobRole>, isNew: boolean) => {
    try {
      setIsSubmitting(true);
      
      if (!role.title) {
        toast.error("Título do cargo é obrigatório");
        return;
      }
      
      if (isNew) {
        const { data, error } = await supabase
          .from('job_roles')
          .insert({
            company_id: company.id,
            title: role.title,
            description: role.description || null,
            responsibilities: role.responsibilities || null,
            requirements: role.requirements || null,
            expectations: role.expectations || null,
            order_index: jobRoles.length
          })
          .select();
          
        if (error) throw error;
        
        toast.success("Cargo adicionado com sucesso");
      } else if (role.id) {
        const { error } = await supabase
          .from('job_roles')
          .update({
            title: role.title,
            description: role.description || null,
            responsibilities: role.responsibilities || null,
            requirements: role.requirements || null,
            expectations: role.expectations || null
          })
          .eq('id', role.id);
          
        if (error) throw error;
        
        toast.success("Cargo atualizado com sucesso");
      }
      
      // Resetar estados e buscar dados atualizados
      setEditingRole(null);
      setNewRole(null);
      setIsFormOpen(false);
      fetchJobRoles();
      
    } catch (error: any) {
      console.error("Error saving job role:", error);
      toast.error(`Erro ao salvar cargo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('cargo_id', roleId);
        
      if (error) throw error;
      
      if (count && count > 0) {
        toast.error(`Não é possível excluir: existem ${count} usuários com este cargo.`);
        return;
      }
      
      if (!confirm("Tem certeza que deseja excluir este cargo?")) return;
      
      const { error: deleteError } = await supabase
        .from('job_roles')
        .delete()
        .eq('id', roleId);
        
      if (deleteError) throw deleteError;
      
      toast.success("Cargo excluído com sucesso");
      fetchJobRoles();
      
    } catch (error: any) {
      console.error("Error deleting job role:", error);
      toast.error(`Erro ao excluir cargo: ${error.message}`);
    }
  };

  const handleMoveRole = async (roleId: string, direction: 'up' | 'down') => {
    const roleIndex = jobRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return;
    
    const newRoles = [...jobRoles];
    const targetIndex = direction === 'up' ? roleIndex - 1 : roleIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newRoles.length) return;
    
    const temp = newRoles[roleIndex].order_index;
    newRoles[roleIndex].order_index = newRoles[targetIndex].order_index;
    newRoles[targetIndex].order_index = temp;
    
    [newRoles[roleIndex], newRoles[targetIndex]] = [newRoles[targetIndex], newRoles[roleIndex]];
    
    setJobRoles(newRoles);
    
    try {
      await supabase
        .from('job_roles')
        .update({ order_index: newRoles[roleIndex].order_index })
        .eq('id', newRoles[roleIndex].id);
        
      await supabase
        .from('job_roles')
        .update({ order_index: newRoles[targetIndex].order_index })
        .eq('id', newRoles[targetIndex].id);
        
    } catch (error: any) {
      console.error("Error reordering job roles:", error);
      toast.error(`Erro ao reordenar cargos: ${error.message}`);
      fetchJobRoles();
    }
  };

  useEffect(() => {
    if (company) {
      fetchJobRoles();
    }
  }, [company]);

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
    isSubmitting,
    showRoleUsersDialog,
    setShowRoleUsersDialog,
    handleSaveRole,
    handleDeleteRole,
    handleMoveRole,
    fetchJobRoles
  };
};
