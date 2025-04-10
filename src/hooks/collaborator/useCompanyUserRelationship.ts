
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";

export const useCompanyUserRelationship = (
  setCompanyUsers: (value: React.SetStateAction<string[]>) => void,
  setUserRoles: (value: React.SetStateAction<Record<string, string>>) => void,
  setReloadTrigger: (value: React.SetStateAction<number>) => void
) => {
  // Add user to company
  const addUserToCompany = async (userId: string, company: Company | null) => {
    if (!company || !company.id) {
      toast.error("No company selected");
      return;
    }
    
    try {
      // Check if relation already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', userId)
        .eq('empresa_id', company.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRelation) {
        toast.info("User is already part of this company");
        return;
      }
      
      const { error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: userId,
          empresa_id: company.id
        });
        
      if (error) throw error;
      
      // Update company users list
      setCompanyUsers(prev => [...prev, userId]);
      toast.success("User added successfully");
      
      // Trigger company relation change to refresh data
      window.dispatchEvent(new Event('company-relation-changed'));
      
      // Force a reload to refresh the data
      setReloadTrigger(prev => prev + 1);
      
    } catch (error: any) {
      console.error("Error adding user to company:", error);
      toast.error(`Error adding user: ${error.message}`);
    }
  };
  
  // Remove user from company
  const removeUserFromCompany = async (userId: string, company: Company | null) => {
    if (!confirm("Are you sure you want to remove this user from the company?")) return;
    
    if (!company || !company.id) {
      toast.error("No company selected");
      return;
    }
    
    try {
      // First, remove user's role if they have one from this company
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cargo_id: null })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Then remove relation with company
      const { error } = await supabase
        .from('user_empresa')
        .delete()
        .eq('user_id', userId)
        .eq('empresa_id', company.id);
        
      if (error) throw error;
      
      // Update company users list
      setCompanyUsers(prev => prev.filter(id => id !== userId));
      setUserRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      
      toast.success("User removed successfully");
      
      // Trigger company relation change event
      window.dispatchEvent(new Event('company-relation-changed'));
      
      // Force a reload to refresh the data
      setReloadTrigger(prev => prev + 1);
      
    } catch (error: any) {
      console.error("Error removing user from company:", error);
      toast.error(`Error removing user: ${error.message}`);
    }
  };

  return {
    addUserToCompany,
    removeUserFromCompany
  };
};
