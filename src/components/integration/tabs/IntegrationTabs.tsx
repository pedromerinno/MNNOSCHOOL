
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PlayCircle, BriefcaseBusiness, GraduationCap } from "lucide-react";
import { CultureManual } from '@/components/integration/CultureManual';
import { VideoPlaylist } from '@/components/integration/video-playlist';
import { UserRole } from '@/components/integration/UserRole';
import { SuggestedCourses } from '@/components/integration/SuggestedCourses';
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full rounded-[30px] p-1.5 lg:p-2 gap-2 lg:gap-3 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 shadow-sm">
            <TabsTrigger 
              value="culture" 
              className="relative flex items-center justify-center gap-2 rounded-2xl py-3 lg:py-4 px-3 lg:px-6 transition-all duration-300 text-xs lg:text-sm font-medium group overflow-hidden" 
              style={{
                color: activeTab === "culture" ? companyColor : undefined
              }}
            >
              {activeTab === "culture" && (
                <motion.div
                  layoutId="activeTabIntegration"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    backgroundColor: `${companyColor}15`,
                    border: `1.5px solid ${companyColor}30`
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <BookOpen className="relative z-10 h-4 w-4 lg:h-5 lg:w-5" style={{ color: activeTab === "culture" ? companyColor : undefined }} />
              <span className="relative z-10 hidden sm:inline">Manual de Cultura</span>
              <span className="relative z-10 sm:hidden">Cultura</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="videos" 
              className="relative flex items-center justify-center gap-2 rounded-2xl py-3 lg:py-4 px-3 lg:px-6 transition-all duration-300 text-xs lg:text-sm font-medium group overflow-hidden" 
              style={{
                color: activeTab === "videos" ? companyColor : undefined
              }}
            >
              {activeTab === "videos" && (
                <motion.div
                  layoutId="activeTabIntegration"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    backgroundColor: `${companyColor}15`,
                    border: `1.5px solid ${companyColor}30`
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <PlayCircle className="relative z-10 h-4 w-4 lg:h-5 lg:w-5" style={{ color: activeTab === "videos" ? companyColor : undefined }} />
              <span className="relative z-10 hidden sm:inline">Playlist Integração</span>
              <span className="relative z-10 sm:hidden">Vídeos</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="role" 
              className="relative flex items-center justify-center gap-2 rounded-2xl py-3 lg:py-4 px-3 lg:px-6 transition-all duration-300 text-xs lg:text-sm font-medium group overflow-hidden" 
              style={{
                color: activeTab === "role" ? companyColor : undefined
              }}
            >
              {activeTab === "role" && (
                <motion.div
                  layoutId="activeTabIntegration"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    backgroundColor: `${companyColor}15`,
                    border: `1.5px solid ${companyColor}30`
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <BriefcaseBusiness className="relative z-10 h-4 w-4 lg:h-5 lg:w-5" style={{ color: activeTab === "role" ? companyColor : undefined }} />
              <span className="relative z-10">Cargo</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="suggested-courses" 
              className="relative flex items-center justify-center gap-2 rounded-2xl py-3 lg:py-4 px-3 lg:px-6 transition-all duration-300 text-xs lg:text-sm font-medium group overflow-hidden" 
              style={{
                color: activeTab === "suggested-courses" ? companyColor : undefined
              }}
            >
              {activeTab === "suggested-courses" && (
                <motion.div
                  layoutId="activeTabIntegration"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    backgroundColor: `${companyColor}15`,
                    border: `1.5px solid ${companyColor}30`
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <GraduationCap className="relative z-10 h-4 w-4 lg:h-5 lg:w-5" style={{ color: activeTab === "suggested-courses" ? companyColor : undefined }} />
              <span className="relative z-10">Cursos</span>
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <div className="mt-6 lg:mt-10 mb-8 lg:mb-16 space-y-6 lg:space-y-8">
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
              <Card className="border-gray-100 dark:border-gray-800">
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
              <div className="flex justify-center">
                <EmptyState
                  title="Nenhum cargo atribuído"
                  description="Nenhum cargo atribuído para você nesta empresa"
                  icons={[BriefcaseBusiness]}
                />
              </div>
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
