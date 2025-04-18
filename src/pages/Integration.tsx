import React, { useState, useEffect } from 'react';
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlaylist } from "@/components/integration/VideoPlaylist";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { CultureManual } from '@/components/integration/CultureManual';
import { UserRole } from '@/components/integration/UserRole';
import { LoadingState } from '@/components/integration/video-playlist/LoadingState';

const Integration = () => {
  const { selectedCompany, isLoading, forceGetUserCompanies, getUserCompanies, user } = useCompanies();
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
        
        <div className="bg-white dark:bg-card rounded-lg shadow-sm divide-y dark:divide-gray-800">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="p-6">
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
                
                <p className="text-gray-700 dark:text-gray-300">
                  {localCompany 
                    ? `Aqui você encontrará todas as informações sobre a ${localCompany.nome}, expectativas, 
                      descrição do cargo e tudo relacionado à sua contratação.`
                    : "Aqui você encontrará todas as informações sobre nossa empresa, expectativas, descrição do cargo e tudo relacionado à sua contratação."}
                </p>
              </div>

              <div className="p-6 space-y-8">
                {/* Culture Manual Section */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">Manual de Cultura</h3>
                  <CultureManual
                    companyValues={localCompany?.valores || ""}
                    companyMission={localCompany?.missao || ""}
                    companyHistory={localCompany?.historia || ""}
                    companyColor={companyColor}
                  />
                </section>

                {/* Video Section */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">Vídeo Institucional e Materiais</h3>
                  <VideoPlaylist 
                    key={`videos-${localCompany?.id}`}
                    companyId={localCompany?.id} 
                    mainVideo={localCompany?.video_institucional || ""}
                    mainVideoDescription={localCompany?.descricao_video || ""}
                  />
                </section>

                {/* User Role Section */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">Seu Cargo</h3>
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
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Integration;
