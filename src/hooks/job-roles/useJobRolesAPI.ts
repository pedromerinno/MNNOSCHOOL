
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";

// Cache object to store job roles by company
const jobRolesCache: Record<string, { data: JobRole[], timestamp: number }> = {};
const CACHE_TTL = 60000; // 1 minute cache lifetime

// Track ongoing requests to prevent duplicates
const ongoingRequests: Record<string, Promise<JobRole[]>> = {};

export const useJobRolesAPI = () => {
  const fetchJobRoles = async (companyId: string, forceRefresh = false): Promise<JobRole[]> => {
    try {
      console.log('[JobRolesAPI] Starting to fetch job roles for company:', companyId);
      
      if (!companyId) {
        console.warn('[JobRolesAPI] No company ID provided');
        return [];
      }

      // Check if there's an ongoing request for this company
      if (ongoingRequests[companyId]) {
        console.log('[JobRolesAPI] Using ongoing request for company:', companyId);
        return await ongoingRequests[companyId];
      }

      // Check cache first if we're not forcing a refresh
      const now = Date.now();
      const cachedData = jobRolesCache[companyId];
      
      if (!forceRefresh && cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
        console.log("[JobRolesAPI] Using cached job roles for company:", companyId);
        return cachedData.data;
      }
      
      console.log("[JobRolesAPI] Fetching fresh job roles from database for company:", companyId);
      
      // Create and store the request promise
      const requestPromise = (async () => {
        const { data, error } = await supabase
          .from('job_roles')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');
          
        if (error) {
          console.error("[JobRolesAPI] Database error fetching job roles:", error);
          throw new Error(`Erro de banco de dados: ${error.message}`);
        }
        
        const jobRoles = data || [];
        console.log(`[JobRolesAPI] Successfully fetched ${jobRoles.length} job roles for company ${companyId}`);
        
        // Update cache
        jobRolesCache[companyId] = {
          data: jobRoles,
          timestamp: now
        };
        
        return jobRoles;
      })();

      // Store the ongoing request
      ongoingRequests[companyId] = requestPromise;
      
      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up the ongoing request
        delete ongoingRequests[companyId];
      }
      
    } catch (error: any) {
      console.error("[JobRolesAPI] Error in fetchJobRoles:", error);
      
      // Clear potentially corrupted cache
      if (jobRolesCache[companyId]) {
        delete jobRolesCache[companyId];
      }
      
      // Clean up ongoing request
      delete ongoingRequests[companyId];
      
      const errorMessage = error.message || 'Erro desconhecido ao carregar cargos';
      toast.error(`Erro ao carregar cargos: ${errorMessage}`);
      
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  };

  const saveRole = async (role: Partial<JobRole>, companyId: string, isNew: boolean) => {
    try {
      console.log("[JobRolesAPI] Saving role with data:", role);
      
      if (!role.title?.trim()) {
        const error = "Título do cargo é obrigatório";
        toast.error(error);
        throw new Error(error);
      }
      
      if (!companyId) {
        const error = "ID da empresa é obrigatório";
        toast.error(error);
        throw new Error(error);
      }
      
      if (isNew) {
        console.log("[JobRolesAPI] Creating new role for company:", companyId);
        const { data, error } = await supabase
          .from('job_roles')
          .insert({
            company_id: companyId,
            title: role.title.trim(),
            description: role.description?.trim() || null,
            responsibilities: role.responsibilities?.trim() || null,
            requirements: role.requirements?.trim() || null,
            expectations: role.expectations?.trim() || null,
            order_index: role.order_index || 0
          })
          .select();
          
        if (error) {
          console.error("[JobRolesAPI] Error creating role:", error);
          throw new Error(`Erro ao criar cargo: ${error.message}`);
        }
        
        // Invalidate cache and ongoing requests
        delete jobRolesCache[companyId];
        delete ongoingRequests[companyId];
        
        console.log("[JobRolesAPI] New role created successfully:", data?.[0]);
        toast.success("Cargo criado com sucesso!");
        return data?.[0] || null;
      } 
      
      if (role.id) {
        console.log("[JobRolesAPI] Updating existing role:", role.id);
        
        const updateData = {
          title: role.title.trim(),
          description: role.description?.trim() || null,
          responsibilities: role.responsibilities?.trim() || null,
          requirements: role.requirements?.trim() || null,
          expectations: role.expectations?.trim() || null
        };

        console.log("[JobRolesAPI] Sending update data:", updateData);
        
        const { data, error } = await supabase
          .from('job_roles')
          .update(updateData)
          .eq('id', role.id)
          .select();
          
        if (error) {
          console.error("[JobRolesAPI] Error updating role:", error);
          throw new Error(`Erro ao atualizar cargo: ${error.message}`);
        }
        
        // Invalidate cache and ongoing requests
        delete jobRolesCache[companyId];
        delete ongoingRequests[companyId];
        
        console.log("[JobRolesAPI] Role updated successfully:", data?.[0]);
        toast.success("Cargo atualizado com sucesso!");
        return data?.[0] || null;
      }
      
      throw new Error("ID do cargo é obrigatório para atualização");
    } catch (error: any) {
      console.error("[JobRolesAPI] Error saving job role:", error);
      
      if (!error.message.includes('Erro ao')) {
        toast.error(`Erro ao salvar cargo: ${error.message}`);
      }
      
      throw error;
    }
  };

  const deleteRole = async (roleId: string, companyId: string) => {
    try {
      console.log("[JobRolesAPI] Checking if role can be deleted:", roleId);
      
      if (!roleId || !companyId) {
        throw new Error("ID do cargo e da empresa são obrigatórios");
      }
      
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('cargo_id', roleId);
        
      if (error) {
        throw new Error(`Erro ao verificar usuários vinculados: ${error.message}`);
      }
      
      if (count && count > 0) {
        const message = `Não é possível excluir: existem ${count} usuários com este cargo.`;
        toast.error(message);
        return false;
      }
      
      console.log("[JobRolesAPI] Deleting role:", roleId);
      const { error: deleteError } = await supabase
        .from('job_roles')
        .delete()
        .eq('id', roleId);
        
      if (deleteError) {
        throw new Error(`Erro ao excluir cargo: ${deleteError.message}`);
      }
      
      // Invalidate cache and ongoing requests
      delete jobRolesCache[companyId];
      delete ongoingRequests[companyId];
      toast.success("Cargo excluído com sucesso!");
      
      return true;
    } catch (error: any) {
      console.error("[JobRolesAPI] Error deleting job role:", error);
      
      if (!error.message.includes('Não é possível excluir') && !error.message.includes('Erro ao')) {
        toast.error(`Erro ao excluir cargo: ${error.message}`);
      }
      
      return false;
    }
  };

  const updateRoleOrder = async (roleId: string, newOrderIndex: number, companyId: string) => {
    try {
      console.log("[JobRolesAPI] Updating role order:", roleId, "new index:", newOrderIndex);
      
      if (!roleId || !companyId || newOrderIndex < 0) {
        throw new Error("Parâmetros inválidos para reordenação");
      }
      
      const { error } = await supabase
        .from('job_roles')
        .update({ order_index: newOrderIndex })
        .eq('id', roleId);
        
      if (error) {
        throw new Error(`Erro ao reordenar cargo: ${error.message}`);
      }
      
      // Invalidate cache and ongoing requests
      delete jobRolesCache[companyId];
      delete ongoingRequests[companyId];
      
      return true;
    } catch (error: any) {
      console.error("[JobRolesAPI] Error updating role order:", error);
      
      if (!error.message.includes('Erro ao')) {
        toast.error(`Erro ao reordenar cargos: ${error.message}`);
      }
      
      return false;
    }
  };

  const clearCache = (companyId?: string) => {
    try {
      if (companyId) {
        delete jobRolesCache[companyId];
        delete ongoingRequests[companyId];
        console.log("[JobRolesAPI] Cache cleared for company:", companyId);
      } else {
        // Clear all cache and ongoing requests
        Object.keys(jobRolesCache).forEach(key => delete jobRolesCache[key]);
        Object.keys(ongoingRequests).forEach(key => delete ongoingRequests[key]);
        console.log("[JobRolesAPI] All cache cleared");
      }
    } catch (error) {
      console.error("[JobRolesAPI] Error clearing cache:", error);
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
