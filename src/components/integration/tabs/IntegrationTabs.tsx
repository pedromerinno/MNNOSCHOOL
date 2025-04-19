
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PlayCircle, BriefcaseBusiness } from "lucide-react";
import { CultureManual } from '@/components/integration/CultureManual';
import { VideoPlaylist } from '@/components/integration/video-playlist';
import { UserRole } from '@/components/integration/UserRole';
import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/types/job-roles";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface IntegrationTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  company: Company | null;
  companyColor: string;
  jobRoles: JobRole[];
}

export const IntegrationTabs: React.FC<IntegrationTabsProps> = ({
  activeTab,
  setActiveTab,
  company,
  companyColor,
  jobRoles
}) => {
  const [userRole, setUserRole] = useState<JobRole | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!userProfile?.id || !company?.id) {
          console.log('No user profile or company selected');
          setUserRole(null);
          return;
        }
        
        setIsLoadingRole(true);
        
        // Primeiro, buscar o cargo_id do perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('cargo_id')
          .eq('id', userProfile.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          toast.error("Erro ao carregar informações do perfil");
          setUserRole(null);
          setIsLoadingRole(false);
          return;
        }
        
        if (!profileData?.cargo_id) {
          console.log('User has no assigned role');
          setUserRole(null);
          setIsLoadingRole(false);
          return;
        }
        
        console.log('User cargo_id found:', profileData.cargo_id);
        
        // Buscar os detalhes do cargo usando o cargo_id e o company_id
        const { data: roleData, error: roleError } = await supabase
          .from('job_roles')
          .select('*')
          .eq('id', profileData.cargo_id)
          .eq('company_id', company.id)
          .single();
          
        if (roleError) {
          console.error('Error fetching user role:', roleError);
          setUserRole(null);
          setIsLoadingRole(false);
          return;
        }
        
        console.log('User role found:', roleData);
        setUserRole(roleData);
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole(null);
      } finally {
        setIsLoadingRole(false);
      }
    };

    if (company) {
      fetchUserRole();
    }
  }, [company, userProfile]);

  return (
    <div className="w-full">
      <Tabs
        defaultValue="culture"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full rounded-2xl p-1.5 bg-transparent dark:bg-transparent gap-2">
          <TabsTrigger 
            value="culture"
            className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
            style={{
              backgroundColor: activeTab === "culture" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "culture" ? companyColor : undefined,
              color: activeTab === "culture" ? companyColor : undefined
            }}
          >
            <BookOpen className="h-4 w-4" />
            Manual de Cultura
          </TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
            style={{
              backgroundColor: activeTab === "videos" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "videos" ? companyColor : undefined,
              color: activeTab === "videos" ? companyColor : undefined
            }}
          >
            <PlayCircle className="h-4 w-4" />
            Playlist Integração
          </TabsTrigger>
          <TabsTrigger 
            value="role"
            className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
            style={{
              backgroundColor: activeTab === "role" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "role" ? companyColor : undefined,
              color: activeTab === "role" ? companyColor : undefined
            }}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Meu Cargo
          </TabsTrigger>
        </TabsList>

        <div className="mt-10 mb-16 space-y-8">
          <TabsContent value="culture" className="m-0">
            <CultureManual
              companyValues={company?.valores || ""}
              companyMission={company?.missao || ""}
              companyHistory={company?.historia || ""}
              companyColor={companyColor}
              videoUrl={company?.video_institucional}
              videoDescription={company?.descricao_video}
            />
          </TabsContent>

          <TabsContent value="videos" className="m-0">
            <VideoPlaylist 
              key={`videos-${company?.id}`}
              companyId={company?.id} 
              mainVideo={company?.video_institucional || ""}
              mainVideoDescription={company?.descricao_video || ""}
            />
          </TabsContent>

          <TabsContent value="role" className="m-0">
            {isLoadingRole ? (
              <Card>
                <CardContent className="p-6 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </CardContent>
              </Card>
            ) : userRole ? (
              <UserRole
                key={userRole.id}
                role={userRole}
                companyColor={companyColor}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BriefcaseBusiness className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum cargo atribuído para você nesta empresa
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
