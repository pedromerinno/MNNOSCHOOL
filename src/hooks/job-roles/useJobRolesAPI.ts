
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";

export const useJobRolesAPI = () => {
  const fetchJobRoles = async (companyId: string) => {
    try {
      console.log("Fetching job roles for company:", companyId);
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index');
        
      if (error) throw error;
      console.log("Fetched job roles:", data);
      return data || [];
    } catch (error: any) {
      console.error("Error fetching job roles:", error);
      toast.error(`Erro ao carregar cargos: ${error.message}`);
      return [];
    }
  };

  const saveRole = async (role: Partial<JobRole>, companyId: string, isNew: boolean) => {
    try {
      console.log("Saving role with data:", role);
      if (!role.title) {
        toast.error("Título do cargo é obrigatório");
        return null;
      }
      
      if (isNew) {
        console.log("Creating new role for company:", companyId);
        const { data, error } = await supabase
          .from('job_roles')
          .insert({
            company_id: companyId,
            title: role.title,
            description: role.description || null,
            responsibilities: role.responsibilities || null,
            requirements: role.requirements || null,
            expectations: role.expectations || null,
            order_index: role.order_index || 0
          })
          .select();
          
        if (error) {
          console.error("Error creating role:", error);
          throw error;
        }
        
        console.log("New role created:", data?.[0]);
        return data?.[0] || null;
      } 
      
      if (role.id) {
        console.log("Updating existing role:", role.id);
        const { data, error } = await supabase
          .from('job_roles')
          .update({
            title: role.title,
            description: role.description || null,
            responsibilities: role.responsibilities || null,
            requirements: role.requirements || null,
            expectations: role.expectations || null
          })
          .eq('id', role.id)
          .select();
          
        if (error) {
          console.error("Error updating role:", error);
          throw error;
        }
        
        console.log("Role updated:", data?.[0]);
        return data?.[0] || null;
      }
      
      return null;
    } catch (error: any) {
      console.error("Error saving job role:", error);
      toast.error(`Erro ao salvar cargo: ${error.message}`);
      return null;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      console.log("Checking if role can be deleted:", roleId);
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('cargo_id', roleId);
        
      if (error) throw error;
      
      if (count && count > 0) {
        toast.error(`Não é possível excluir: existem ${count} usuários com este cargo.`);
        return false;
      }
      
      console.log("Deleting role:", roleId);
      const { error: deleteError } = await supabase
        .from('job_roles')
        .delete()
        .eq('id', roleId);
        
      if (deleteError) throw deleteError;
      
      return true;
    } catch (error: any) {
      console.error("Error deleting job role:", error);
      toast.error(`Erro ao excluir cargo: ${error.message}`);
      return false;
    }
  };

  const updateRoleOrder = async (roleId: string, newOrderIndex: number) => {
    try {
      console.log("Updating role order:", roleId, "new index:", newOrderIndex);
      const { error } = await supabase
        .from('job_roles')
        .update({ order_index: newOrderIndex })
        .eq('id', roleId);
        
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error updating role order:", error);
      toast.error(`Erro ao reordenar cargos: ${error.message}`);
      return false;
    }
  };

  return {
    fetchJobRoles,
    saveRole,
    deleteRole,
    updateRoleOrder,
  };
};
