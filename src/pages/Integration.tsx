
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyHeader } from '@/components/integration/header/CompanyHeader';
import { ScrollSection } from '@/components/integration/ScrollSection';
import { IntegrationNavigation } from '@/components/integration/IntegrationNavigation';
import { InteractiveCard } from '@/components/integration/InteractiveCard';
import { CultureManual } from '@/components/integration/CultureManual';
import { VideoPlaylist } from '@/components/integration/video-playlist';
import { UserRole } from '@/components/integration/UserRole';
import { SuggestedCourses } from '@/components/integration/SuggestedCourses';
import { SectionTitle } from '@/components/integration/SectionTitle';
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, PlayCircle, BriefcaseBusiness, GraduationCap, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { CompanyThemedBadge } from "@/components/ui/badge";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";
import { Preloader } from "@/components/ui/Preloader";
import { Footer } from "@/components/home/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamGallery } from '@/components/integration/TeamGallery';
import { useTeamMembersOptimized } from '@/hooks/team/useTeamMembersOptimized';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { IntegrationSidebar } from '@/components/integration/IntegrationSidebar';
import { useUserCompanyAdmin } from '@/hooks/company/useUserCompanyAdmin';

const Integration = () => {
  const navigate = useNavigate();
  const { selectedCompany, isLoading } = useCompanies();
  const { user, userProfile, loading: authLoading, updateUserProfile } = useAuth();
  const { isAdmin: isCompanyAdmin } = useUserCompanyAdmin();
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [userRole, setUserRole] = useState<JobRole | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentCompanyData, setCurrentCompanyData] = useState<Company | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Verificar se é admin (super admin ou admin da empresa)
  const isAdmin = useMemo(() => {
    return userProfile?.super_admin || isCompanyAdmin;
  }, [userProfile?.super_admin, isCompanyAdmin]);

  // Seções da landing page (sem 'hero' pois é adicionado automaticamente no sidebar)
  const sections = [
    { id: 'cultura', label: 'Cultura', icon: BookOpen },
    { id: 'videos', label: 'Vídeos', icon: PlayCircle },
    { id: 'time', label: 'Colaboradores', icon: Users },
    { id: 'cargo', label: 'Cargo', icon: BriefcaseBusiness },
    { id: 'cursos', label: 'Cursos', icon: GraduationCap },
  ];

  // Função utilitária para fazer scroll até uma seção
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    // Encontrar o container que tem scroll (SidebarInset)
    let scrollContainer: HTMLElement | null = null;
    let parent: HTMLElement | null = element;
    
    while (parent && parent !== document.body && parent !== document.documentElement) {
      const style = window.getComputedStyle(parent);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && parent.tagName === 'MAIN') {
        scrollContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }
    
    if (!scrollContainer) {
      scrollContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
    }
    
    const offset = 100;
    
    if (scrollContainer) {
      // Usar scrollIntoView suave primeiro para garantir que o elemento esteja visível
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      
      // Depois ajustar o scroll do container com o offset de forma suave
      // Usar um pequeno delay para que o scrollIntoView comece primeiro
      setTimeout(() => {
        const containerRect = scrollContainer!.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const currentScrollTop = scrollContainer!.scrollTop;
        const elementTopRelativeToContainer = elementRect.top - containerRect.top;
        const elementAbsoluteTop = currentScrollTop + elementTopRelativeToContainer;
        const targetScrollTop = elementAbsoluteTop - offset;
        
        // Só ajustar se ainda não estiver na posição correta
        if (Math.abs(scrollContainer!.scrollTop - targetScrollTop) > 10) {
          scrollContainer!.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
          });
        }
      }, 50);
    } else {
      // Fallback
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        window.scrollBy({ top: -offset, behavior: 'smooth' });
      }, 100);
    }
  }, []);
  
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
      
      setCurrentCompanyData(data);
      return data;
    } catch (error) {
      console.error("Error fetching company data:", error);
      return null;
    }
  };
  
  // Função para atualizar dados após edição
  const handleDataUpdated = useCallback(() => {
    if (selectedCompany?.id) {
      fetchCompanyData(selectedCompany.id);
      setRefreshKey(prev => prev + 1);
    }
  }, [selectedCompany?.id]);
  
  // Função para buscar cargos
  const fetchJobRoles = async (companyId: string) => {
    if (!companyId) return [];
    
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index', { ascending: true });
        
      if (error) {
        console.error("Error fetching job roles:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error fetching job roles:", error);
      return [];
    }
  };
  
  // Função para buscar cargo específico do usuário logado na empresa
  const fetchUserRole = useCallback(async (companyId: string) => {
    if (!userProfile?.id || !companyId) {
      setUserRole(null);
      return;
    }
    
    try {
      // Buscar cargo do usuário nesta empresa específica (nova estrutura)
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_empresa')
        .select('cargo_id')
        .eq('user_id', userProfile.id)
        .eq('empresa_id', companyId)
        .single();
        
      if (userCompanyError && userCompanyError.code !== 'PGRST116') {
        setUserRole(null);
        return;
      }
      
      if (userCompany?.cargo_id) {
        // Buscar detalhes do cargo
        const { data: roleData, error: roleError } = await supabase
          .from('job_roles')
          .select('*')
          .eq('id', userCompany.cargo_id)
          .eq('company_id', companyId)
          .single();
          
        if (roleError) {
          setUserRole(null);
          return;
        }
        
        setUserRole(roleData);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("[Integration] Error in fetchUserRole:", error);
      setUserRole(null);
    }
  }, [userProfile?.id]);
  
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
  
  // Hook para buscar membros do time - deve vir depois de companyData
  const { members: teamMembers, isLoading: isLoadingTeam } = useTeamMembersOptimized({
    selectedCompanyId: companyData?.id,
    skipLoading: !companyData?.id,
  });
  
  // Função otimizada para carregar todos os dados em paralelo
  const loadAllData = useCallback(async (companyId: string) => {
    if (!companyId) return;
    
    setIsLoadingData(true);
    setIsLoadingRoles(true);
    setUserRole(null);
    
    try {
      // Paralelizar todas as chamadas ao banco
      const [companyDataResult, jobRolesResult] = await Promise.all([
        fetchCompanyData(companyId),
        fetchJobRoles(companyId)
      ]);
      
      // Atualizar dados da empresa
      if (companyDataResult) {
        setCurrentCompanyData(companyDataResult);
        // Armazenar logo da empresa no localStorage
        if (companyDataResult.logo) {
          localStorage.setItem('selectedCompanyLogo', companyDataResult.logo);
        } else {
          localStorage.setItem('selectedCompanyLogo', '/placeholder.svg');
        }
      }
      
      // Atualizar cargos
      setJobRoles(jobRolesResult);
      setIsLoadingRoles(false);
      
      // Buscar cargo do usuário (pode ser feito em paralelo também se necessário)
      if (userProfile?.id) {
        await fetchUserRole(companyId);
      }
    } catch (error) {
      console.error("[Integration] Error loading data:", error);
      setIsLoadingRoles(false);
    } finally {
      setIsLoadingData(false);
    }
  }, [userProfile?.id, fetchUserRole]);
  
  // Efeito principal para carregar dados quando a empresa muda
  useEffect(() => {
    if (selectedCompany?.id && !authLoading && user && userProfile) {
      loadAllData(selectedCompany.id);
    }
  }, [selectedCompany?.id, userProfile?.id, authLoading, user, loadAllData]);
  
  // Escutar mudanças de empresa e dados de integração
  useEffect(() => {
    if (!userProfile?.id || !companyData?.id) return;
    
    const handleCompanyChange = (event: CustomEvent<{company: Company}>) => {
      const newCompany = event.detail.company;
      
      if (newCompany.id !== companyData?.id) {
        loadAllData(newCompany.id);
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      
      if (updatedCompany.id === companyData?.id) {
        setCurrentCompanyData(updatedCompany);
        // Recarregar apenas dados que podem ter mudado
        Promise.all([
          fetchJobRoles(updatedCompany.id).then(roles => setJobRoles(roles)),
          fetchUserRole(updatedCompany.id)
        ]).finally(() => {
          setIsLoadingRoles(false);
        });
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleIntegrationDataUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      
      if (updatedCompany.id === companyData?.id) {
        loadAllData(updatedCompany.id);
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleRoleUpdated = () => {
      if (companyData?.id) {
        Promise.all([
          fetchJobRoles(companyData.id).then(roles => setJobRoles(roles)),
          fetchUserRole(companyData.id)
        ]).finally(() => {
          setIsLoadingRoles(false);
        });
      }
    };
    
    const handleIntegrationRoleUpdated = (event: CustomEvent) => {
      const { userId, companyId } = event.detail;
      
      if (userId === userProfile?.id && companyId === companyData?.id) {
        fetchUserRole(companyId);
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
  }, [companyData?.id, userProfile?.id, loadAllData, fetchUserRole]);

  // Mostrar preloader apenas durante carregamento crítico (auth e empresa básica)
  // Não bloquear por dados secundários que podem ser carregados progressivamente
  if (authLoading || !user || !userProfile || isLoading) {
    return <Preloader />;
  }

  // Se não tem empresa selecionada, mostrar página vazia em vez de preloader
  if (!selectedCompany) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col items-center justify-center">
          <EmptyState 
            title="Selecione uma empresa"
            description="Selecione uma empresa no menu superior para visualizar a página de integração."
          />
        </div>
      </>
    );
  }

  const companyColor = companyData?.cor_principal || '#1EAEDB';
  
  // Verificar se o manual já foi aceito
  const isManualAccepted = userProfile?.manual_cultura_aceito || false;

  // Função para aceitar o manual de cultura
  const handleAcceptManual = async () => {
    if (!userProfile?.id || isManualAccepted) {
      return false;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ manual_cultura_aceito: true })
        .eq('id', userProfile.id);

      if (error) {
        console.error('Erro ao atualizar manual de cultura:', error);
        toast.error('Erro ao aceitar o manual de cultura');
        setIsUpdating(false);
        return false;
      }

      // Atualizar o perfil localmente
      updateUserProfile({ manual_cultura_aceito: true });
      toast.success('Manual de cultura aceito com sucesso!');
      setIsUpdating(false);
      return true;
    } catch (error) {
      console.error('Erro ao aceitar manual:', error);
      toast.error('Erro ao aceitar o manual de cultura');
      setIsUpdating(false);
      return false;
    }
  };

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
        <SidebarProvider 
          defaultOpen={true}
          className="has-[[data-variant=inset]]:!bg-transparent"
        >
          <div className="flex w-full h-full flex-1">
            <IntegrationSidebar 
              sections={sections}
              companyColor={companyColor}
            />
            <SidebarInset className="flex-1 overflow-y-auto !bg-[#F8F7F4] dark:!bg-[#191919]">
              <main className="w-full max-w-[1400px] mx-auto px-4 lg:px-6">
          {/* Hero Section - Header */}
          <ScrollSection
            id="hero"
            withPadding={true}
            className="pt-8 lg:pt-16"
          >
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center mb-8 lg:mb-12 gap-3 lg:gap-4"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-5 lg:h-5 lg:w-5 text-gray-500 dark:text-gray-400" />
              </Button>
              <div className="flex items-center gap-2 lg:gap-3">
                <h1 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white tracking-tight">
                  Integração
                </h1>
                {companyData && (
                  <CompanyThemedBadge variant="beta">
                    {companyData.nome}
                  </CompanyThemedBadge>
                )}
              </div>
            </motion.div>

            {/* Company Header Card */}
            <InteractiveCard 
              companyColor={companyColor}
              hoverEffect={false}
              borderBeam={true}
              className="p-6 lg:p-8"
            >
              <CompanyHeader 
                company={companyData} 
                companyColor={companyColor}
                userRole={userRole}
              />
            </InteractiveCard>
          </ScrollSection>

          {/* Cultura Section */}
          <ScrollSection
            id="cultura"
            direction="up"
            delay={0.05}
            companyColor={companyColor}
            isAdmin={isAdmin}
            adminTab="info"
            company={companyData}
            onDataUpdated={handleDataUpdated}
          >
            <CultureManual 
              key={refreshKey}
              companyValues={companyData?.valores || ""} 
              companyMission={companyData?.missao || ""} 
              companyHistory={companyData?.historia || ""} 
              companyColor={companyColor} 
              companyLogo={companyData?.logo} 
              companyName={companyData?.nome} 
              videoUrl={companyData?.video_institucional} 
              videoDescription={companyData?.descricao_video}
              company={companyData}
              onDataUpdated={handleDataUpdated}
            />
          </ScrollSection>

          {/* Vídeos Section */}
          <ScrollSection
            id="videos"
            direction="up"
            delay={0.1}
            companyColor={companyColor}
            isAdmin={isAdmin}
            adminTab="videos"
            company={companyData}
            onDataUpdated={handleDataUpdated}
          >
            <VideoPlaylist 
              key={`videos-${companyData?.id || 'empty'}-${refreshKey}`} 
              companyId={companyData?.id} 
              mainVideo={companyData?.video_institucional || ""} 
              mainVideoDescription={companyData?.descricao_video || ""} 
            />
          </ScrollSection>

          {/* Time Section - Título dentro do container */}
          <ScrollSection
            id="time"
            direction="up"
            delay={0.125}
            companyColor={companyColor}
            isAdmin={isAdmin}
            adminTab="collaborators"
          >
            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 p-6 lg:p-8">
              {companyData && (
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Conheça os nossos colaboradores
                    </h2>
                    {teamMembers.length > 0 && (
                      <CompanyThemedBadge 
                        variant="beta"
                        style={{
                          backgroundColor: `${companyColor}20`,
                          color: companyColor,
                          borderColor: `${companyColor}40`
                        }}
                      >
                        {teamMembers.length} {teamMembers.length === 1 ? 'pessoa' : 'pessoas'}
                      </CompanyThemedBadge>
                    )}
                  </div>
                </div>
              )}
              {isLoadingTeam ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <TeamGallery 
                  members={teamMembers}
                  companyColor={companyColor}
                />
              )}
            </div>
          </ScrollSection>

          {/* Cargo Section */}
          <ScrollSection
            id="cargo"
            direction="up"
            delay={0.15}
            companyColor={companyColor}
            isAdmin={isAdmin}
            adminTab="cargo"
          >
            <InteractiveCard 
              companyColor={companyColor}
              hoverEffect={false}
              borderBeam={false}
              delay={0.15}
              className="p-6 lg:p-8"
            >
              {companyData && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Seu Cargo
                </h2>
              )}
              {isLoadingRoles && (
                <Card className="border-0 shadow-none mb-4">
                  <CardContent className="p-6 flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </CardContent>
                </Card>
              )}
              <UserRole 
                key={userRole?.id || 'empty-role'}
                role={userRole || {
                  title: "",
                  description: null,
                  responsibilities: null,
                  requirements: null,
                  expectations: null
                }}
                companyColor={companyColor} 
                userProfile={userProfile} 
              />
            </InteractiveCard>
          </ScrollSection>

          {/* Botão Concluir Integração - Antes de Cursos Sugeridos */}
          {companyData?.historia && (
            <div className="mt-12 mb-12 flex justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    style={{ 
                      backgroundColor: companyColor,
                      borderColor: companyColor 
                    }}
                    variant="default"
                    size="lg"
                    className="px-10 py-5 text-lg rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all min-h-[56px]"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Concluir Integração
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Declaração de Cultura
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Conheça nossa declaração de cultura organizacional
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Conteúdo da Declaração */}
                  <div className="mt-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-l-4 mb-6" style={{ borderLeftColor: companyColor }}>
                      <p className="text-base lg:text-lg text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                        {companyData.historia}
                      </p>
                    </div>
                    
                    <div className="text-center mb-6">
                      <div className="inline-block">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Com os melhores cumprimentos,
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          Equipe de Gestão
                        </p>
                      </div>
                    </div>

                    {/* Aceite do Manual */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                      <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-4">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                            Aceite do Manual de Cultura
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {isManualAccepted 
                              ? "Você já aceitou este manual de cultura. Obrigado por fazer parte da nossa cultura organizacional."
                              : "Ao aceitar este manual, você confirma que leu e compreendeu nossa cultura, valores e missão, comprometendo-se a vivenciá-los no dia a dia."
                            }
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <Button 
                            onClick={async () => {
                              const success = await handleAcceptManual();
                              if (success) {
                                setIsDialogOpen(false);
                              }
                            }}
                            disabled={isManualAccepted || isUpdating}
                            style={{ 
                              backgroundColor: isManualAccepted ? companyColor : undefined,
                              borderColor: companyColor 
                            }}
                            variant={isManualAccepted ? "default" : "outline"}
                            size="lg"
                            className="px-8 py-2.5 rounded-lg font-medium"
                          >
                            {isUpdating 
                              ? "Processando..." 
                              : isManualAccepted 
                                ? "✓ Manual Aceito" 
                                : "Aceitar Manual de Cultura"
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Cursos Sugeridos Section */}
          <ScrollSection
            id="cursos"
            direction="up"
            delay={0.2}
            companyColor={companyColor}
            isAdmin={isAdmin}
            adminTab="suggested-courses"
          >
            <InteractiveCard 
              companyColor={companyColor}
              hoverEffect={false}
              borderBeam={false}
              delay={0.2}
              className="p-6 lg:p-8"
            >
              {companyData && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Cursos Sugeridos
                </h2>
              )}
              <SuggestedCourses companyColor={companyColor} />
            </InteractiveCard>
          </ScrollSection>
              </main>
              
              {/* Navegação flutuante - sempre passar as mesmas seções para manter hooks consistentes */}
              <IntegrationNavigation
                sections={sections.filter(s => s.id !== 'hero')}
                companyColor={companyColor}
              />
              
              <Footer />
            </SidebarInset>
          </div>
        </SidebarProvider>
        <AdminFloatingActionButton />
      </div>

      {/* Floating Dock Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div 
          className="rounded-2xl shadow-lg backdrop-blur-md border bg-white/95 dark:bg-neutral-900/95"
          style={{
            borderColor: `${companyColor}30`
          }}
        >
          <Dock className="items-end pb-2 px-4">
            <DockItem
              onClick={() => scrollToSection('cultura')}
              className="aspect-square rounded-full"
              style={{
                backgroundColor: `${companyColor}25`
              }}
            >
              <DockLabel>Manual de Cultura</DockLabel>
              <DockIcon>
                <BookOpen className="h-full w-full" style={{ color: companyColor }} />
              </DockIcon>
            </DockItem>
            
            <DockItem
              onClick={() => scrollToSection('videos')}
              className="aspect-square rounded-full"
              style={{
                backgroundColor: `${companyColor}25`
              }}
            >
              <DockLabel>Playlist de Integração</DockLabel>
              <DockIcon>
                <PlayCircle className="h-full w-full" style={{ color: companyColor }} />
              </DockIcon>
            </DockItem>
            
            <DockItem
              onClick={() => scrollToSection('time')}
              className="aspect-square rounded-full"
              style={{
                backgroundColor: `${companyColor}25`
              }}
            >
              <DockLabel>Conheça os Colaboradores</DockLabel>
              <DockIcon>
                <Users className="h-full w-full" style={{ color: companyColor }} />
              </DockIcon>
            </DockItem>
            
            <DockItem
              onClick={() => scrollToSection('cargo')}
              className="aspect-square rounded-full"
              style={{
                backgroundColor: `${companyColor}25`
              }}
            >
              <DockLabel>Seu Cargo</DockLabel>
              <DockIcon>
                <BriefcaseBusiness className="h-full w-full" style={{ color: companyColor }} />
              </DockIcon>
            </DockItem>
            
            <DockItem
              onClick={() => scrollToSection('cursos')}
              className="aspect-square rounded-full"
              style={{
                backgroundColor: `${companyColor}25`
              }}
            >
              <DockLabel>Cursos Sugeridos</DockLabel>
              <DockIcon>
                <GraduationCap className="h-full w-full" style={{ color: companyColor }} />
              </DockIcon>
            </DockItem>
          </Dock>
        </div>
      </div>
    </>
  );
};

export default Integration;
