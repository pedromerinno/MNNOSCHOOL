
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from "@/hooks/useCompanies";
import { LoadingState } from '@/components/integration/video-playlist/LoadingState';
import { CompanyHeader } from '@/components/integration/header/CompanyHeader';
import { IntegrationTabs } from '@/components/integration/tabs/IntegrationTabs';
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";
import { PagePreloader } from "@/components/ui/PagePreloader";
import { Footer } from "@/components/home/Footer";

const Integration = () => {
  const navigate = useNavigate();
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
  
  // Função para buscar cargos
  const fetchJobRoles = async (companyId: string) => {
    if (!companyId || isLoadingRoles) return;
    
    setIsLoadingRoles(true);
    try {
      console.log('[Integration] Fetching job roles for company:', companyId);
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
        console.log(`[Integration] Fetched ${data.length} job roles for company ${companyId}`);
        setJobRoles(data);
      } else {
        console.log(`[Integration] No job roles found for company ${companyId}`);
        setJobRoles([]);
      }
    } catch (error) {
      console.error("Error fetching job roles:", error);
      setJobRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };
  
  // Função para buscar cargo específico do usuário logado
  const fetchUserRole = async (companyId: string) => {
    if (!userProfile?.id || !companyId) {
      console.log('[Integration] Missing userProfile or companyId for role fetch');
      setUserRole(null);
      return;
    }
    
    console.log('[Integration] Fetching user role for user:', userProfile.id, 'company:', companyId);
    
    try {
      // Primeiro, buscar perfil atualizado do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cargo_id')
        .eq('id', userProfile.id)
        .single();
        
      if (profileError) {
        console.error("[Integration] Error fetching user profile:", profileError);
        setUserRole(null);
        return;
      }
      
      console.log('[Integration] User profile cargo_id:', profile?.cargo_id);
      
      if (profile?.cargo_id) {
        // Buscar detalhes do cargo especificamente para esta empresa
        const { data: roleData, error: roleError } = await supabase
          .from('job_roles')
          .select('*')
          .eq('id', profile.cargo_id)
          .eq('company_id', companyId)
          .single();
          
        if (roleError) {
          console.error("[Integration] Error fetching user role:", roleError);
          console.log('[Integration] Role not found for this company, user has no role here');
          setUserRole(null);
          return;
        }
        
        console.log('[Integration] ✅ User role found:', roleData?.title);
        setUserRole(roleData);
      } else {
        console.log('[Integration] User has no cargo_id assigned');
        setUserRole(null);
      }
    } catch (error) {
      console.error("[Integration] Error in fetchUserRole:", error);
      setUserRole(null);
    }
  };
  
  // Função para atualizar dados da empresa
  const refreshCompanyData = async (companyId: string) => {
    const updatedCompany = await fetchCompanyData(companyId);
    if (updatedCompany) {
      setCurrentCompanyData(updatedCompany);
      console.log("[Integration] Company data refreshed:", updatedCompany.nome);
    }
  };
  
  // Efeito principal para carregar dados quando a empresa muda
  useEffect(() => {
    console.log('[Integration] Main effect triggered - selectedCompany:', selectedCompany?.nome, 'userProfile:', !!userProfile);
    
    if (selectedCompany?.id) {
      console.log('[Integration] Loading data for company:', selectedCompany.nome);
      
      // Reset user role imediatamente ao trocar empresa
      setUserRole(null);
      
      // Buscar dados atualizados da empresa
      refreshCompanyData(selectedCompany.id);
      
      // Armazenar logo da empresa no localStorage
      if (selectedCompany.logo) {
        localStorage.setItem('selectedCompanyLogo', selectedCompany.logo);
      } else {
        localStorage.setItem('selectedCompanyLogo', '/placeholder.svg');
      }
      
      // Buscar cargos da empresa
      fetchJobRoles(selectedCompany.id);
      
      // Buscar cargo do usuário para esta empresa
      if (userProfile?.id) {
        // Aguardar um pouco para garantir que o perfil está atualizado
        setTimeout(() => {
          fetchUserRole(selectedCompany.id);
        }, 500);
      }
    }
  }, [selectedCompany?.id, userProfile?.id]);
  
  // Escutar mudanças de empresa e dados de integração
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent<{company: Company}>) => {
      const newCompany = event.detail.company;
      console.log("[Integration] Company change event received:", newCompany.nome);
      
      // Reset imediato do userRole
      setUserRole(null);
      
      if (newCompany.id !== companyData?.id) {
        refreshCompanyData(newCompany.id);
        fetchJobRoles(newCompany.id);
        if (userProfile?.id) {
          // Aguardar um pouco para garantir sincronia
          setTimeout(() => {
            fetchUserRole(newCompany.id);
          }, 500);
        }
      }
      
      // Force refresh do componente
      setRefreshKey(prev => prev + 1);
    };
    
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("[Integration] Company updated event:", updatedCompany.nome);
      
      if (updatedCompany.id === companyData?.id) {
        setCurrentCompanyData(updatedCompany);
        fetchJobRoles(updatedCompany.id);
        if (userProfile?.id) {
          setTimeout(() => {
            fetchUserRole(updatedCompany.id);
          }, 500);
        }
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleIntegrationDataUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("[Integration] Integration data updated:", updatedCompany.nome);
      
      if (updatedCompany.id === companyData?.id) {
        refreshCompanyData(updatedCompany.id);
        if (userProfile?.id) {
          setTimeout(() => {
            fetchUserRole(updatedCompany.id);
          }, 500);
        }
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleRoleUpdated = () => {
      console.log("[Integration] User role updated event detected");
      if (companyData?.id) {
        fetchJobRoles(companyData.id);
        if (userProfile?.id) {
          setTimeout(() => {
            fetchUserRole(companyData.id);
          }, 500);
        }
      }
    };
    
    const handleIntegrationRoleUpdated = (event: CustomEvent) => {
      console.log("[Integration] Integration role updated event:", event.detail);
      const { userId, companyId } = event.detail;
      
      if (userId === userProfile?.id && companyId === companyData?.id) {
        console.log("[Integration] Updating current user role");
        setTimeout(() => {
          fetchUserRole(companyId);
        }, 500);
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
  if (isLoading && !currentCompanyData && !selectedCompany) {
    return <PagePreloader />;
  }

  // Sem empresa selecionada
  if (!companyData) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
          <main className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
            <div className="flex items-center mb-8 lg:mb-12 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold dark:text-white">
                  Integração
                </h1>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Nenhuma empresa selecionada</p>
              </div>
            </div>
          </main>
          <Footer />
          <AdminFloatingActionButton />
        </div>
      </>
    );
  }

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <main className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className="flex items-center mb-8 lg:mb-12 gap-3 lg:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-5 lg:h-5 lg:w-5 text-gray-500" />
            </Button>
            <div className="flex items-center gap-2 lg:gap-3">
              <h1 className="text-xl lg:text-3xl font-bold dark:text-white">
                Integração
              </h1>
              {companyData && (
                <CompanyThemedBadge variant="beta">
                  {companyData.nome}
                </CompanyThemedBadge>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-4 lg:p-6">
            <CompanyHeader 
              company={companyData} 
              companyColor={companyData?.cor_principal}
            />
            <IntegrationTabs
              key={refreshKey}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              company={companyData}
              companyColor={companyData?.cor_principal}
              jobRoles={jobRoles}
              isLoadingRoles={isLoadingRoles}
              userRole={userRole}
            />
          </div>
        </main>
        <Footer />
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

export default Integration;
