import React, { useState, useEffect } from 'react';
import { useCompanies } from "@/hooks/useCompanies";
import { VideoPlaylist } from "@/components/integration/video-playlist";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { CultureManual } from '@/components/integration/CultureManual';
import { UserRole } from '@/components/integration/UserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingState } from '@/components/integration/video-playlist/LoadingState';
import { useAuth } from "@/contexts/AuthContext";

const Integration = () => {
  const { selectedCompany, isLoading, forceGetUserCompanies, getUserCompanies, user } = useCompanies();
  const { user: authUser } = useAuth();
  const [localCompany, setLocalCompany] = useState<Company | null>(selectedCompany);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
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
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setJobRoles(data);
      } else {
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={authUser?.user_metadata?.avatar_url} />
                  <AvatarFallback>{authUser?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{authUser?.user_metadata?.full_name || authUser?.email}</h3>
                  {jobRoles.length > 0 && (
                    <p className="text-sm opacity-90">{jobRoles[0].title}</p>
                  )}
                </div>
              </div>
              <div className="md:text-center">
                <p className="text-sm opacity-75">GESTOR</p>
                <p className="font-medium">{localCompany?.responsavel || "Não definido"}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm opacity-75">INÍCIO</p>
                <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="company" className="mb-8">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-full inline-flex">
            <TabsTrigger value="company" className="rounded-full">
              A Empresa
            </TabsTrigger>
            <TabsTrigger value="role" className="rounded-full">
              Job Description
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-full">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="tools" className="rounded-full">
              Ferramentas & Acessos
            </TabsTrigger>
            <TabsTrigger value="integration" className="rounded-full">
              Integração
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-6 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {localCompany?.logo && (
                    <img 
                      src={localCompany.logo} 
                      alt={`${localCompany.nome} logo`}
                      className="h-12 w-12 object-contain rounded"
                    />
                  )}
                  <h2 className="text-2xl font-semibold">
                    A {localCompany?.nome || "Empresa"}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {localCompany?.descricao || "Descrição não disponível"}
                </p>
              </CardContent>
            </Card>

            <section className="space-y-6">
              <CultureManual
                companyValues={localCompany?.valores || ""}
                companyMission={localCompany?.missao || ""}
                companyHistory={localCompany?.historia || ""}
                companyColor={companyColor}
              />
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-semibold">Vídeo Institucional e Materiais</h3>
              <VideoPlaylist 
                key={`videos-${localCompany?.id}`}
                companyId={localCompany?.id} 
                mainVideo={localCompany?.video_institucional || ""}
                mainVideoDescription={localCompany?.descricao_video || ""}
              />
            </section>
          </TabsContent>

          <TabsContent value="role" className="mt-6">
            <section className="space-y-6">
              {jobRoles.map((role) => (
                <UserRole
                  key={role.id}
                  role={role}
                  companyColor={companyColor}
                />
              ))}
              {jobRoles.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <BriefcaseBusiness className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Informações sobre o cargo não disponíveis
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Seção em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Seção em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Seção em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Integration;
