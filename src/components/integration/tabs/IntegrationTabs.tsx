
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PlayCircle, BriefcaseBusiness } from "lucide-react";
import { CultureManual } from '@/components/integration/CultureManual';
import { VideoPlaylist } from '@/components/integration/video-playlist';
import { UserRole } from '@/components/integration/UserRole';
import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types/company";

interface IntegrationTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  company: Company | null;
  companyColor: string;
  jobRoles: any[];
}

export const IntegrationTabs: React.FC<IntegrationTabsProps> = ({
  activeTab,
  setActiveTab,
  company,
  companyColor,
  jobRoles
}) => {
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

        <div className="mt-6 mb-12 space-y-6"> {/* Added mb-12 for consistent bottom margin */}
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

