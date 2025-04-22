
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";

// Cache object to store job roles by company
const jobRolesCache: Record<string, { data: JobRole[], timestamp: number }> = {};
const CACHE_TTL = 60000; // 1 minute cache lifetime

export const useJobRolesAPI = () => {
  const fetchJobRoles = async (companyId: string, forceRefresh = false) => {
    try {
      // Check cache first if we're not forcing a refresh
      const now = Date.now();
      const cachedData = jobRolesCache[companyId];
      
      if (!forceRefresh && cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
        console.log("Using cached job roles for company:", companyId);
        return cachedData.data;
      }
      
      console.log("Fetching job roles for company:", companyId);
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index');
        
      if (error) throw error;
      console.log("Fetched job roles:", data);
      
      // Update cache
      jobRolesCache[companyId] = {
        data: data || [],
        timestamp: now
      };
      
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
        
        // Invalidate cache
        delete jobRolesCache[companyId];
        
        console.log("New role created:", data?.[0]);
        return data?.[0] || null;
      } 
      
      if (role.id) {
        console.log("Updating existing role:", role.id);
        const updateData = {
          title: role.title,
          description: role.description,
          responsibilities: role.responsibilities,
          requirements: role.requirements,
          expectations: role.expectations,
          // Não atualizamos o order_index aqui para não perder a ordem
        };

        // Log the exact data being sent for update
        console.log("Sending update data:", updateData);
        
        const { data, error } = await supabase
          .from('job_roles')
          .update(updateData)
          .eq('id', role.id)
          .select();
          
        if (error) {
          console.error("Error updating role:", error);
          throw error;
        }
        
        // Invalidate cache
        delete jobRolesCache[companyId];
        
        console.log("Role updated, response:", data);
        return data?.[0] || null;
      }
      
      return null;
    } catch (error: any) {
      console.error("Error saving job role:", error);
      toast.error(`Erro ao salvar cargo: ${error.message}`);
      return null;
    }
  };

  const deleteRole = async (roleId: string, companyId: string) => {
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
      
      // Invalidate cache
      delete jobRolesCache[companyId];
      
      return true;
    } catch (error: any) {
      console.error("Error deleting job role:", error);
      toast.error(`Erro ao excluir cargo: ${error.message}`);
      return false;
    }
  };

  const updateRoleOrder = async (roleId: string, newOrderIndex: number, companyId: string) => {
    try {
      console.log("Updating role order:", roleId, "new index:", newOrderIndex);
      const { error } = await supabase
        .from('job_roles')
        .update({ order_index: newOrderIndex })
        .eq('id', roleId);
        
      if (error) throw error;
      
      // Invalidate cache
      delete jobRolesCache[companyId];
      
      return true;
    } catch (error: any) {
      console.error("Error updating role order:", error);
      toast.error(`Erro ao reordenar cargos: ${error.message}`);
      return false;
    }
  };

  const clearCache = (companyId?: string) => {
    if (companyId) {
      delete jobRolesCache[companyId];
    } else {
      // Clear all cache
      Object.keys(jobRolesCache).forEach(key => delete jobRolesCache[key]);
    }
  };

  return {
    fetchJobRoles,
    saveRole,
    deleteRole,
    updateRoleOrder,
    clearCache
  };
};
