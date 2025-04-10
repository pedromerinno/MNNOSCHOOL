
import React, { useState, useEffect } from 'react';
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlaylist } from "@/components/integration/VideoPlaylist";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Building, BriefcaseBusiness, ChevronRight, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";

const Integration = () => {
  const { selectedCompany, isLoading, forceGetUserCompanies, getUserCompanies, user } = useCompanies();
  const [localCompany, setLocalCompany] = useState<Company | null>(selectedCompany);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [activeTab, setActiveTab] = useState("sobre");
  
  // Update local company state when selectedCompany changes
  useEffect(() => {
    if (selectedCompany) {
      setLocalCompany(selectedCompany);
      fetchJobRoles(selectedCompany.id);
    }
  }, [selectedCompany]);
  
  // Fetch job roles for the selected company
  const fetchJobRoles = async (companyId: string) => {
    setIsLoadingRoles(true);
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setJobRoles(data);
      } else {
        // Set empty array if no roles found
        setJobRoles([]);
      }
    } catch (error) {
      console.error("Error fetching job roles:", error);
      setJobRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };
  
  // Listen for company updates from settings
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
  
  // Definir cor da empresa ou usar padrão se não disponível
  const companyColor = localCompany?.cor_principal || "#1EAEDB";
  
  // Estilo dinâmico com a cor da empresa
  const companyColorStyle = {
    color: companyColor,
    borderColor: companyColor
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <h1 className="text-3xl font-bold dark:text-white">Integração</h1>
        </div>
        
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold mr-3 dark:text-white">
                  {localCompany 
                    ? `Bem-vindo ao processo de integração da ${localCompany.nome}` 
                    : "Bem-vindo ao processo de integração"}
                </h2>
                {localCompany && (
                  <CompanyThemedBadge 
                    variant="beta"
                    style={{
                      backgroundColor: `${companyColor}20`, 
                      color: companyColor,
                      borderColor: `${companyColor}40`
                    }}
                  >
                    Empresa
                  </CompanyThemedBadge>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {localCompany 
                  ? `Aqui você encontrará todas as informações sobre a ${localCompany.nome}, expectativas, 
                    descrição do cargo e tudo relacionado à sua contratação.`
                  : "Aqui você encontrará todas as informações sobre nossa empresa, expectativas, descrição do cargo e tudo relacionado à sua contratação."}
              </p>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-1.5 mb-6 rounded-xl" style={{ '--tab-accent': companyColor } as React.CSSProperties}>
                  <TabsTrigger 
                    value="sobre" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 py-2.5"
                    style={{ 
                      backgroundColor: activeTab === "sobre" ? companyColor : 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Sobre a Empresa
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 py-2.5"
                    style={{ 
                      backgroundColor: activeTab === "videos" ? companyColor : 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cargo" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 py-2.5"
                    style={{ 
                      backgroundColor: activeTab === "cargo" ? companyColor : 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <BriefcaseBusiness className="h-4 w-4 mr-2" />
                    Cargos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sobre" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={{color: companyColor}}>
                        {localCompany 
                          ? `Sobre a ${localCompany.nome}` 
                          : "Sobre a empresa"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {localCompany?.historia 
                          ? localCompany.historia
                          : "Conheça nossa história, valores e visão."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={{color: companyColor}}>
                        Missão
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {localCompany?.missao 
                          ? localCompany.missao
                          : "Nossa missão e propósito."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={{color: companyColor}}>
                        Valores
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {localCompany?.valores 
                          ? localCompany.valores
                          : "Os valores que orientam nossas ações."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={{color: companyColor}}>
                        Frase Institucional
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {localCompany?.frase_institucional 
                          ? `"${localCompany.frase_institucional}"`
                          : "Nossa frase que resume nossa essência."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="videos" className="mt-0">
                  <div className="mt-2">
                    <VideoPlaylist 
                      key={`videos-${localCompany?.id}`}
                      companyId={localCompany?.id} 
                      mainVideo={localCompany?.video_institucional || ""}
                      mainVideoDescription={localCompany?.descricao_video || ""}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="cargo" className="mt-0">
                  <div className="grid md:grid-cols-1 gap-6">
                    {isLoadingRoles ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : jobRoles.length > 0 ? (
                      jobRoles.map((role, index) => (
                        <Card key={role.id} className="overflow-hidden border-l-4 shadow-sm hover:shadow transition-all duration-200" style={{ borderLeftColor: companyColor }}>
                          <CardHeader className="py-4 px-6 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <BriefcaseBusiness className="h-5 w-5" style={{ color: companyColor }} />
                              <h3 className="font-medium text-lg" style={{ color: companyColor }}>
                                {role.title}
                              </h3>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                              {role.description}
                            </p>
                            
                            <Accordion type="single" collapsible className="w-full">
                              {role.responsibilities && (
                                <AccordionItem value="responsibilities" className="border-b">
                                  <AccordionTrigger className="py-4 text-base font-medium hover:text-primary hover:no-underline">
                                    <span className="flex items-center gap-2">
                                      <Info className="h-4 w-4" style={{ color: companyColor }} />
                                      Responsabilidades
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">
                                    {role.responsibilities}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {role.requirements && (
                                <AccordionItem value="requirements" className="border-b">
                                  <AccordionTrigger className="py-4 text-base font-medium hover:text-primary hover:no-underline">
                                    <span className="flex items-center gap-2">
                                      <Info className="h-4 w-4" style={{ color: companyColor }} />
                                      Requisitos
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">
                                    {role.requirements}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {role.expectations && (
                                <AccordionItem value="expectations" className="border-b">
                                  <AccordionTrigger className="py-4 text-base font-medium hover:text-primary hover:no-underline">
                                    <span className="flex items-center gap-2">
                                      <Info className="h-4 w-4" style={{ color: companyColor }} />
                                      Expectativas
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">
                                    {role.expectations}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                            </Accordion>
                          </CardContent>
                          <CardFooter className="py-3 px-6 bg-gray-50 dark:bg-gray-800 border-t">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-auto text-xs group"
                              style={{ 
                                borderColor: companyColor,
                                color: companyColor
                              }}
                            >
                              Ver Detalhes
                              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm" style={{borderLeft: `4px solid ${companyColor}`}}>
                        <h3 className="text-xl font-medium mb-4 dark:text-white" style={{color: companyColor}}>
                          Descrição de Cargos
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Ainda não há informações sobre cargos disponíveis para {localCompany?.nome || "esta empresa"}.
                        </p>
                        <Button 
                          variant="outline" 
                          style={{ 
                            borderColor: companyColor,
                            color: companyColor
                          }}
                        >
                          Saiba Mais
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Integration;
