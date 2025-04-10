import React, { useState, useEffect } from 'react';
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlaylist } from "@/components/integration/VideoPlaylist";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Building, Info, BriefcaseBusiness } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Company } from "@/types/company";

// Mock data for job roles - in a real app this would come from the database
const mockJobRoles = [
  {
    title: "Desenvolvedor Full Stack",
    description: "Responsável pelo desenvolvimento de aplicações web completas, desde o backend até o frontend.",
    responsibilities: "- Desenvolver e manter aplicações web\n- Colaborar com equipes de design e produto\n- Implementar testes automatizados",
    requirements: "- Experiência com React, Node.js\n- Conhecimento de bancos de dados SQL e NoSQL\n- Boas práticas de desenvolvimento",
    expectations: "- Entrega de código de qualidade\n- Participação ativa em code reviews\n- Aprendizado contínuo"
  },
  {
    title: "Designer UX/UI",
    description: "Criar experiências de usuário excepcionais e interfaces visualmente atraentes.",
    responsibilities: "- Criar wireframes e protótipos\n- Conduzir pesquisas com usuários\n- Desenvolver design systems",
    requirements: "- Experiência com Figma ou Adobe XD\n- Portfolio com projetos relevantes\n- Conhecimento de princípios de design",
    expectations: "- Soluções centradas no usuário\n- Inovação em design\n- Colaboração com desenvolvedores"
  }
];

const Integration = () => {
  const { selectedCompany, isLoading, forceGetUserCompanies, getUserCompanies, user } = useCompanies();
  const [jobRoles, setJobRoles] = useState(mockJobRoles);
  const [localCompany, setLocalCompany] = useState<Company | null>(selectedCompany);
  
  // Update local company state when selectedCompany changes
  useEffect(() => {
    if (selectedCompany) {
      setLocalCompany(selectedCompany);
    }
  }, [selectedCompany]);
  
  // Listen for company updates from settings
  useEffect(() => {
    const handleCompanyUpdated = (event: CustomEvent<{company: Company}>) => {
      const updatedCompany = event.detail.company;
      console.log("Company updated in Integration page:", updatedCompany.nome);
      setLocalCompany(updatedCompany);
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

  // Em uma implementação real, isso buscaria dados do servidor
  useEffect(() => {
    // Simulando busca de dados
    const fetchJobRoles = async () => {
      // Aqui você faria uma chamada à API
      // Por enquanto, estamos usando dados simulados
      setJobRoles(mockJobRoles);
    };
    
    fetchJobRoles();
  }, [selectedCompany]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Integração</h1>
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
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold mr-3 dark:text-white">
                  {localCompany 
                    ? `Bem-vindo ao processo de integração da ${localCompany.nome}` 
                    : "Bem-vindo ao processo de integração"}
                </h2>
                {localCompany && (
                  <CompanyThemedBadge variant="beta">Empresa</CompanyThemedBadge>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {localCompany 
                  ? `Aqui você encontrará todas as informações sobre a ${localCompany.nome}, expectativas, 
                    descrição do cargo e tudo relacionado à sua contratação.`
                  : "Aqui você encontrará todas as informações sobre nossa empresa, expectativas, descrição do cargo e tudo relacionado à sua contratação."}
              </p>

              <Tabs defaultValue="sobre" className="mt-6">
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 mb-6" style={{ '--tab-accent': companyColor } as React.CSSProperties}>
                  <TabsTrigger 
                    value="sobre" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm"
                    style={{ 
                      backgroundColor: 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Sobre a Empresa
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm"
                    style={{ 
                      backgroundColor: 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cargo" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm"
                    style={{ 
                      backgroundColor: 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <BriefcaseBusiness className="h-4 w-4 mr-2" />
                    Cargos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sobre" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
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
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={{color: companyColor}}>
                        Missão
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {localCompany?.missao 
                          ? localCompany.missao
                          : "Nossa missão e propósito."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={{color: companyColor}}>
                        Valores
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {localCompany?.valores 
                          ? localCompany.valores
                          : "Os valores que orientam nossas ações."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
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
                      companyId={localCompany?.id} 
                      mainVideo={localCompany?.video_institucional || ""}
                      mainVideoDescription={localCompany?.descricao_video || ""}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="cargo" className="mt-0">
                  <div className="grid md:grid-cols-1 gap-6">
                    {jobRoles.length > 0 ? (
                      jobRoles.map((role, index) => (
                        <Card key={index} className="overflow-hidden border-l-4" style={{ borderLeftColor: companyColor }}>
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
                                  <AccordionTrigger className="py-4 text-base font-medium">
                                    Responsabilidades
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                    {role.responsibilities}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {role.requirements && (
                                <AccordionItem value="requirements" className="border-b">
                                  <AccordionTrigger className="py-4 text-base font-medium">
                                    Requisitos
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                    {role.requirements}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {role.expectations && (
                                <AccordionItem value="expectations" className="border-b">
                                  <AccordionTrigger className="py-4 text-base font-medium">
                                    Expectativas
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                    {role.expectations}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                            </Accordion>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                        <h3 className="text-xl font-medium mb-4 dark:text-white" style={{color: companyColor}}>
                          Descrição de Cargos
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Ainda não há informações sobre cargos disponíveis para {localCompany?.nome || "esta empresa"}.
                        </p>
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
