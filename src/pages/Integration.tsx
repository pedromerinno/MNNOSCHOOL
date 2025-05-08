
import React, { useState, useEffect } from 'react';
import { useCompanies } from "@/hooks/useCompanies";
import { LoadingState } from '@/components/integration/video-playlist/LoadingState';
import { IntegrationLayout } from '@/components/integration/layout/IntegrationLayout';
import { CompanyHeader } from '@/components/integration/header/CompanyHeader';
import { IntegrationTabs } from '@/components/integration/tabs/IntegrationTabs';
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Integration = () => {
  const { selectedCompany, isLoading, forceGetUserCompanies, getUserCompanies, user } = useCompanies();
  const { userProfile } = useAuth();
  const [localCompany, setLocalCompany] = useState<Company | null>(selectedCompany);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [userRole, setUserRole] = useState<JobRole | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [activeTab, setActiveTab] = useState("culture");
  
  useEffect(() => {
    if (selectedCompany) {
      setLocalCompany(selectedCompany);
      fetchJobRoles(selectedCompany.id);
      
      // Store the company logo in localStorage for use in UserRoleProfile
      if (selectedCompany.logo) {
        localStorage.setItem('selectedCompanyLogo', selectedCompany.logo);
      } else {
        localStorage.setItem('selectedCompanyLogo', '/placeholder.svg');
      }
    }
  }, [selectedCompany]);
  
  const fetchJobRoles = async (companyId: string) => {
    setIsLoadingRoles(true);
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index', { ascending: true });
        
      if (error) {
        console.error("Error fetching job roles:", error);
        toast.error("Erro ao carregar cargos");
        setJobRoles([]);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} job roles for company ${companyId}`);
        setJobRoles(data);
        
        // Se temos um userProfile com cargo_id, vamos buscar o cargo do usuário
        if (userProfile?.cargo_id) {
          const userRole = data.find(role => role.id === userProfile.cargo_id);
          if (userRole) {
            setUserRole(userRole);
          }
        }
      } else {
        console.log(`No job roles found for company ${companyId}`);
        setJobRoles([]);
      }
    } catch (error) {
      console.error("Error fetching job roles:", error);
      setJobRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };
  
  // Ouvir eventos para atualização de dados
  useEffect(() => {
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("Company updated in Integration page:", updatedCompany.nome);
      setLocalCompany(updatedCompany);
      fetchJobRoles(updatedCompany.id);
    };
    
    const handleRoleUpdated = () => {
      console.log("User role updated event detected, refreshing data");
      if (localCompany?.id) {
        fetchJobRoles(localCompany.id);
      }
    };
    
    window.addEventListener('company-updated', handleCompanyUpdated as EventListener);
    window.addEventListener('company-relation-changed', () => {
      if (user?.id) {
        forceGetUserCompanies(user.id);
      }
    });
    window.addEventListener('user-role-updated', handleRoleUpdated as EventListener);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdated as EventListener);
      window.removeEventListener('company-relation-changed', () => {});
      window.removeEventListener('user-role-updated', handleRoleUpdated as EventListener);
    };
  }, [forceGetUserCompanies, user?.id, localCompany]);
  
  const companyColor = localCompany?.cor_principal || "#1EAEDB";

  return (
    <IntegrationLayout>
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <CompanyHeader 
            company={localCompany} 
            companyColor={companyColor}
          />
          <IntegrationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            company={localCompany}
            companyColor={companyColor}
            jobRoles={jobRoles}
            isLoadingRoles={isLoadingRoles}
            userRole={userRole}
          />
        </>
      )}
    </IntegrationLayout>
  );
};

export default Integration;
