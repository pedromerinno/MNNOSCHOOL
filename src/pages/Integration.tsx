
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentCompanyData, setCurrentCompanyData] = useState<Company | null>(null);
  
  // Função para buscar dados atualizados da empresa
  const fetchCompanyData = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error) {
        console.error("Error fetching company data:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching company data:", error);
      return null;
    }
  };
  
  // Memoizar dados da empresa com dados atualizados do banco
  const companyData = useMemo(() => {
    const company = currentCompanyData || selectedCompany;
    if (!company) return null;
    
    return {
      id: company.id,
      nome: company.nome,
      logo: company.logo,
      cor_principal: company.cor_principal || "#1EAEDB",
      valores: company.valores,
      missao: company.missao,
      historia: company.historia,
      video_institucional: company.video_institucional,
      descricao_video: company.descricao_video
    };
  }, [currentCompanyData, selectedCompany, refreshKey]);
  
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
  
  // Função para buscar cargo específico do usuário logado
  const fetchUserRole = async (companyId: string) => {
    if (!userProfile?.id || !companyId) return;
    
    console.log('[Integration] Fetching user role for user:', userProfile.id, 'company:', companyId);
    
    try {
      // Buscar perfil atualizado do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cargo_id')
        .eq('id', userProfile.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return;
      }
      
      console.log('[Integration] Updated user profile cargo_id:', profile?.cargo_id);
      
      if (profile?.cargo_id) {
        // Buscar detalhes do cargo
        const { data: roleData, error: roleError } = await supabase
          .from('job_roles')
          .select('*')
          .eq('id', profile.cargo_id)
          .eq('company_id', companyId)
          .single();
          
        if (roleError) {
          console.error("Error fetching user role:", roleError);
          setUserRole(null);
          return;
        }
        
        console.log('[Integration] User role updated:', roleData?.title);
        setUserRole(roleData);
      } else {
        console.log('[Integration] User has no role assigned');
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
    }
  };
  
  // Função para atualizar dados da empresa
  const refreshCompanyData = async (companyId: string) => {
    const updatedCompany = await fetchCompanyData(companyId);
    if (updatedCompany) {
      setCurrentCompanyData(updatedCompany);
      console.log("Company data refreshed:", updatedCompany.nome);
    }
  };
  
  // Efeito para carregar dados da empresa e cargos
  useEffect(() => {
    if (companyData?.id) {
      // Buscar dados atualizados da empresa
      refreshCompanyData(companyData.id);
      
      // Armazenar logo da empresa no localStorage
      if (companyData.logo) {
        localStorage.setItem('selectedCompanyLogo', companyData.logo);
      } else {
        localStorage.setItem('selectedCompanyLogo', '/placeholder.svg');
      }
      
      // Buscar cargos apenas se necessário
      fetchJobRoles(companyData.id);
      
      // Buscar cargo do usuário
      if (userProfile?.id) {
        fetchUserRole(companyData.id);
      }
    }
  }, [selectedCompany?.id, userProfile?.id]);
  
  // Escutar mudanças de empresa e dados de integração
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent<{company: Company}>) => {
      const newCompany = event.detail.company;
      console.log("Company changed in Integration page:", newCompany.nome);
      
      if (newCompany.id !== companyData?.id) {
        refreshCompanyData(newCompany.id);
        fetchJobRoles(newCompany.id);
        if (userProfile?.id) {
          fetchUserRole(newCompany.id);
        }
      }
      
      // Force refresh do componente
      setRefreshKey(prev => prev + 1);
    };
    
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("Company updated in Integration page:", updatedCompany.nome);
      
      if (updatedCompany.id === companyData?.id) {
        // Atualizar dados locais com os dados do evento
        setCurrentCompanyData(updatedCompany);
        fetchJobRoles(updatedCompany.id);
        if (userProfile?.id) {
          fetchUserRole(updatedCompany.id);
        }
        // Force refresh do componente
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleIntegrationDataUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("Integration data updated:", updatedCompany.nome);
      
      if (updatedCompany.id === companyData?.id) {
        // Buscar dados atualizados do banco para garantir consistência
        refreshCompanyData(updatedCompany.id);
        if (userProfile?.id) {
          fetchUserRole(updatedCompany.id);
        }
        // Force refresh do componente para mostrar novos dados
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleRoleUpdated = () => {
      console.log("User role updated event detected, refreshing data");
      if (companyData?.id) {
        fetchJobRoles(companyData.id);
        if (userProfile?.id) {
          fetchUserRole(companyData.id);
        }
      }
    };
    
    // Novo handler para atualização específica do cargo na integração
    const handleIntegrationRoleUpdated = (event: CustomEvent) => {
      console.log("Integration role updated event detected:", event.detail);
      const { userId, companyId } = event.detail;
      
      // Se o usuário atualizado é o usuário logado e a empresa é a atual
      if (userId === userProfile?.id && companyId === companyData?.id) {
        console.log("Updating current user role in integration page");
        // Atualizar perfil do usuário e depois buscar o cargo
        fetchUserRole(companyId);
        // Force refresh do componente
        setRefreshKey(prev => prev + 1);
      }
    };
    
    // Adicionar listeners
    window.addEventListener('company-changed', handleCompanyChange as EventListener);
    window.addEventListener('company-navigation-change', handleCompanyChange as EventListener);
    window.addEventListener('company-updated', handleCompanyUpdated as EventListener);
    window.addEventListener('company-data-updated', handleCompanyUpdated as EventListener);
    window.addEventListener('integration-data-updated', handleIntegrationDataUpdated as EventListener);
    window.addEventListener('force-company-refresh', handleIntegrationDataUpdated as EventListener);
    window.addEventListener('user-role-updated', handleRoleUpdated as EventListener);
    window.addEventListener('integration-role-updated', handleIntegrationRoleUpdated as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('company-changed', handleCompanyChange as EventListener);
      window.removeEventListener('company-navigation-change', handleCompanyChange as EventListener);
      window.removeEventListener('company-updated', handleCompanyUpdated as EventListener);
      window.removeEventListener('company-data-updated', handleCompanyUpdated as EventListener);
      window.removeEventListener('integration-data-updated', handleIntegrationDataUpdated as EventListener);
      window.removeEventListener('force-company-refresh', handleIntegrationDataUpdated as EventListener);
      window.removeEventListener('user-role-updated', handleRoleUpdated as EventListener);
      window.removeEventListener('integration-role-updated', handleIntegrationRoleUpdated as EventListener);
    };
  }, [companyData?.id, userProfile?.id]);

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
        key={refreshKey}
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
