
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PlayCircle, BriefcaseBusiness, GraduationCap } from "lucide-react";
import { CultureManual } from '@/components/integration/CultureManual';
import { VideoPlaylist } from '@/components/integration/video-playlist';
import { UserRole } from '@/components/integration/UserRole';
import { SuggestedCourses } from '@/components/integration/SuggestedCourses';
import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types/company";
import { JobRole } from "@/types/job-roles";
import { useAuth } from "@/contexts/AuthContext";

interface IntegrationTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  company: Company | null;
  companyColor: string;
  jobRoles: JobRole[];
  isLoadingRoles?: boolean;
  userRole: JobRole | null;
}

export const IntegrationTabs: React.FC<IntegrationTabsProps> = ({
  activeTab,
  setActiveTab,
  company,
  companyColor,
  jobRoles,
  isLoadingRoles = false,
  userRole
}) => {
  const { userProfile } = useAuth();
  
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full rounded-2xl p-1 lg:p-1.5 gap-1 lg:gap-2 bg-gray-100/0">
          <TabsTrigger 
            value="culture" 
            className="flex items-center gap-1 lg:gap-2 rounded-xl py-2.5 lg:py-4 px-2 lg:px-6 transition-colors text-xs lg:text-sm" 
            style={{
              backgroundColor: activeTab === "culture" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "culture" ? companyColor : undefined,
              color: activeTab === "culture" ? companyColor : undefined
            }}
          >
            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Manual de Cultura</span>
            <span className="sm:hidden">Cultura</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="videos" 
            className="flex items-center gap-1 lg:gap-2 rounded-xl py-2.5 lg:py-4 px-2 lg:px-6 transition-colors text-xs lg:text-sm" 
            style={{
              backgroundColor: activeTab === "videos" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "videos" ? companyColor : undefined,
              color: activeTab === "videos" ? companyColor : undefined
            }}
          >
            <PlayCircle className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Playlist Integração</span>
            <span className="sm:hidden">Vídeos</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="role" 
            className="flex items-center gap-1 lg:gap-2 rounded-xl py-2.5 lg:py-4 px-2 lg:px-6 transition-colors text-xs lg:text-sm" 
            style={{
              backgroundColor: activeTab === "role" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "role" ? companyColor : undefined,
              color: activeTab === "role" ? companyColor : undefined
            }}
          >
            <BriefcaseBusiness className="h-3 w-3 lg:h-4 lg:w-4" />
            <span>Cargo</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="suggested-courses" 
            className="flex items-center gap-1 lg:gap-2 rounded-xl py-2.5 lg:py-4 px-2 lg:px-6 transition-colors text-xs lg:text-sm" 
            style={{
              backgroundColor: activeTab === "suggested-courses" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "suggested-courses" ? companyColor : undefined,
              color: activeTab === "suggested-courses" ? companyColor : undefined
            }}
          >
            <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
            <span>Cursos</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 lg:mt-10 mb-8 lg:mb-16 space-y-6 lg:space-y-8">
          <TabsContent value="culture" className="m-0">
            <CultureManual 
              companyValues={company?.valores || ""} 
              companyMission={company?.missao || ""} 
              companyHistory={company?.historia || ""} 
              companyColor={companyColor} 
              companyLogo={company?.logo} 
              companyName={company?.nome} 
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
            {isLoadingRoles ? (
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
                userProfile={userProfile} 
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center py-16 lg:py-[80px] px-8 lg:px-[80px]">
                  <BriefcaseBusiness className="h-8 w-8 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum cargo atribuído para você nesta empresa
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggested-courses" className="m-0">
            <SuggestedCourses companyColor={companyColor} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
