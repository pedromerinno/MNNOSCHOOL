
import React, { useState, useEffect, useMemo } from 'react';
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
  const { selectedCompany, isLoading } = useCompanies();
  const { userProfile } = useAuth();
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [userRole, setUserRole] = useState<JobRole | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [activeTab, setActiveTab] = useState("culture");
  
  // Memoizar dados da empresa para evitar re-renderizações desnecessárias
  const companyData = useMemo(() => {
    if (!selectedCompany) return null;
    
    return {
      id: selectedCompany.id,
      nome: selectedCompany.nome,
      logo: selectedCompany.logo,
      cor_principal: selectedCompany.cor_principal || "#1EAEDB",
      valores: selectedCompany.valores,
      missao: selectedCompany.missao,
      historia: selectedCompany.historia,
      video_institucional: selectedCompany.video_institucional,
      descricao_video: selectedCompany.descricao_video
    };
  }, [selectedCompany]);
  
  const fetchJobRoles = async (companyId: string) => {
    if (!companyId || isLoadingRoles) return;
    
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
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error fetching job roles:", error);
      setJobRoles([]);
      setUserRole(null);
    } finally {
      setIsLoadingRoles(false);
    }
  };
  
  // Efeito para carregar dados da empresa e cargos
  useEffect(() => {
    if (companyData?.id) {
      // Armazenar logo da empresa no localStorage
      if (companyData.logo) {
        localStorage.setItem('selectedCompanyLogo', companyData.logo);
      } else {
        localStorage.setItem('selectedCompanyLogo', '/placeholder.svg');
      }
      
      // Buscar cargos apenas se necessário
      fetchJobRoles(companyData.id);
    }
  }, [companyData?.id]);
  
  // Efeito para ouvir eventos de atualização - simplificado
  useEffect(() => {
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("Company updated in Integration page:", updatedCompany.nome);
      
      if (updatedCompany.id === companyData?.id) {
        fetchJobRoles(updatedCompany.id);
      }
    };
    
    const handleRoleUpdated = () => {
      console.log("User role updated event detected, refreshing data");
      if (companyData?.id) {
        fetchJobRoles(companyData.id);
      }
    };
    
    // Adicionar listeners
    window.addEventListener('company-updated', handleCompanyUpdated as EventListener);
    window.addEventListener('user-role-updated', handleRoleUpdated as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdated as EventListener);
      window.removeEventListener('user-role-updated', handleRoleUpdated as EventListener);
    };
  }, [companyData?.id]);

  // Loading state
  if (isLoading && !companyData) {
    return (
      <IntegrationLayout>
        <LoadingState />
      </IntegrationLayout>
    );
  }

  // Sem empresa selecionada
  if (!companyData) {
    return (
      <IntegrationLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Nenhuma empresa selecionada</p>
        </div>
      </IntegrationLayout>
    );
  }

  return (
    <IntegrationLayout>
      <CompanyHeader 
        company={companyData} 
        companyColor={companyData.cor_principal}
      />
      <IntegrationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        company={companyData}
        companyColor={companyData.cor_principal}
        jobRoles={jobRoles}
        isLoadingRoles={isLoadingRoles}
        userRole={userRole}
      />
    </IntegrationLayout>
  );
};

export default Integration;
