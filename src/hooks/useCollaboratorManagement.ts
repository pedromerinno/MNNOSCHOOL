
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";
import { useUsers } from "@/hooks/useUsers";

export const useCollaboratorManagement = (company: Company | null) => {
  const { users: allUsers, loading: loadingUsers, fetchUsers } = useUsers();
  const [isLoading, setIsLoading] = useState(true);
  const [companyUsers, setCompanyUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  // Function to fetch company users
  const fetchCompanyUsers = async () => {
    if (!company || !company.id) {
      console.log("No company selected or company has no ID");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Fetching collaborators for company:", company.nome, company.id);
      
      const { data, error } = await supabase
        .from('user_empresa')
        .select('user_id')
        .eq('empresa_id', company.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} collaborators`);
        setCompanyUsers(data.map(item => item.user_id));
        
        // Fetch user roles
        await fetchUserRoles(data.map(item => item.user_id));
      } else {
        console.log("No collaborators found for this company");
        setCompanyUsers([]);
        setUserRoles({});
      }
      
    } catch (error: any) {
      console.error("Error fetching company users:", error);
      toast.error(`Error loading collaborators: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch user roles
  const fetchUserRoles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    try {
      // First, fetch cargo_id info from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, cargo_id')
        .in('id', userIds);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return;
      
      // Filter users with assigned roles
      const usersWithRoles = data.filter(u => u.cargo_id);
      
      if (usersWithRoles.length === 0) {
        console.log("No users with assigned roles");
        return;
      }
      
      // Extract role IDs for search
      const cargoIds = usersWithRoles
        .map(u => u.cargo_id)
        .filter(Boolean) as string[];
      
      if (cargoIds.length === 0) return;
      
      console.log(`Fetching ${cargoIds.length} roles`);
      
      // Fetch role details
      const { data: rolesData, error: rolesError } = await supabase
        .from('job_roles')
        .select('id, title')
        .in('id', cargoIds);
        
      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) return;
      
      console.log(`Found ${rolesData.length} roles`);
      
      // Create role name map
      const roleNameMap: Record<string, string> = {};
      rolesData.forEach((role: any) => {
        roleNameMap[role.id] = role.title;
      });
      
      // Map users to their role names
      const roleMap: Record<string, string> = {};
      usersWithRoles.forEach(user => {
        if (user.cargo_id && roleNameMap[user.cargo_id]) {
          roleMap[user.id] = roleNameMap[user.cargo_id];
        }
      });
      
      setUserRoles(roleMap);
      
    } catch (error: any) {
      console.error("Error fetching user roles:", error);
      toast.error(`Error loading user roles: ${error.message}`);
    }
  };

  // Add user to company
  const addUserToCompany = async (userId: string) => {
    if (!company || !company.id) {
      toast.error("No company selected");
      return;
    }
    
    try {
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
      
    } catch (error: any) {
      console.error("Error adding user to company:", error);
      toast.error(`Error adding user: ${error.message}`);
    }
  };
  
  // Remove user from company
  const removeUserFromCompany = async (userId: string) => {
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
      
    } catch (error: any) {
      console.error("Error removing user from company:", error);
      toast.error(`Error removing user: ${error.message}`);
    }
  };

  // Load data when component mounts and when company changes
  useEffect(() => {
    if (company && company.id) {
      console.log("Company provided, loading collaborators:", company.nome);
      fetchCompanyUsers();
    }
  }, [company, reloadTrigger]);
  
  // Ensure users are loaded
  useEffect(() => {
    if (allUsers.length === 0 && !loadingUsers) {
      console.log("Loading users in CollaboratorsManagement");
      fetchUsers();
    }
  }, [allUsers, loadingUsers, fetchUsers]);
  
  // Listen for company selection events and reload data
  useEffect(() => {
    const handleCompanyChange = (event: Event) => {
      console.log("CollaboratorsManagement: Company change event detected");
      // Force a refresh of company users data
      setReloadTrigger(prev => prev + 1);
    };
    
    const handleSettingsCompanyChanged = (event: CustomEvent<{company: Company}>) => {
      console.log("Settings company changed event detected:", event.detail.company.nome);
      // Just trigger a reload of the data
      setReloadTrigger(prev => prev + 1);
    };
    
    window.addEventListener('settings-company-changed', handleSettingsCompanyChanged as EventListener);
    window.addEventListener('company-relation-changed', handleCompanyChange);
    
    return () => {
      window.removeEventListener('settings-company-changed', handleSettingsCompanyChanged as EventListener);
      window.removeEventListener('company-relation-changed', handleCompanyChange);
    };
  }, []);
  
  // Filter users based on search
  const filteredUsers = allUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = (user.display_name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return displayName.includes(searchLower) || email.includes(searchLower);
  });
  
  // Separate users who are already in the company
  const availableUsers = filteredUsers.filter(user => !companyUsers.includes(user.id));
  const filteredCompanyUsers = filteredUsers.filter(user => companyUsers.includes(user.id));

  return {
    isLoading,
    loadingUsers,
    allUsers,
    companyUsers,
    filteredCompanyUsers,
    availableUsers,
    userRoles,
    searchTerm,
    setSearchTerm,
    addUserToCompany,
    removeUserFromCompany,
    setReloadTrigger
  };
};
