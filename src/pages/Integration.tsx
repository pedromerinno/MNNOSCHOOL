
import React, { useState, useEffect } from 'react';
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from '@/components/integration/video-playlist/LoadingState';
import { IntegrationLayout } from '@/components/integration/layout/IntegrationLayout';
import { CompanyHeader } from '@/components/integration/header/CompanyHeader';
import { IntegrationTabs } from '@/components/integration/tabs/IntegrationTabs';
import { toast } from "sonner";

const Integration = () => {
  const { selectedCompany, isLoading, forceGetUserCompanies, getUserCompanies, user } = useCompanies();
  const [localCompany, setLocalCompany] = useState<Company | null>(selectedCompany);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [activeTab, setActiveTab] = useState("culture");
  
  useEffect(() => {
    if (selectedCompany) {
      setLocalCompany(selectedCompany);
      fetchJobRoles(selectedCompany.id);
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
  
  useEffect(() => {
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("Company updated in Integration page:", updatedCompany.nome);
      setLocalCompany(updatedCompany);
      fetchJobRoles(updatedCompany.id);
    };
    
    window.addEventListener('company-updated', handleCompanyUpdated as EventListener);
    window.addEventListener('company-relation-changed', () => {
      if (user?.id) {
        forceGetUserCompanies(user.id);
      }
    });
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdated as EventListener);
      window.removeEventListener('company-relation-changed', () => {});
    };
  }, [forceGetUserCompanies, user?.id]);
  
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
          />
        </>
      )}
    </IntegrationLayout>
  );
};

export default Integration;
