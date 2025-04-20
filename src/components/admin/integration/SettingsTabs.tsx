import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Video, FileText, Users, Key, Book } from "lucide-react";
import { Company } from "@/types/company";
import { CompanyIntegrationForm } from './CompanyIntegrationForm';
import { IntegrationVideosManager } from './IntegrationVideosManager';
import { JobRolesManager } from './JobRolesManager';
import { AccessManagement } from './AccessManagement';
import { CollaboratorsManagement } from './CollaboratorsManagement';
import { CompanyCourseManagement } from './CompanyCourseManagement';

interface SettingsTabsProps {
  company: Company;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleFormSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  company,
  activeTab,
  setActiveTab,
  handleFormSubmit,
  isSaving
}) => {
  useEffect(() => {
    console.log(`SettingsTabs: Company changed to ${company.nome}, ID: ${company.id}`);
  }, [company.id]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="border-b">
        <TabsList className="bg-gray-50 dark:bg-gray-900 w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger 
            value="info" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            style={{
              borderColor: activeTab === "info" ? company?.cor_principal || "#1EAEDB" : "transparent"
            }}
          >
            <Building className="h-4 w-4 mr-2" />
            Informações da Empresa
          </TabsTrigger>
          <TabsTrigger 
            value="videos" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            style={{
              borderColor: activeTab === "videos" ? company?.cor_principal || "#1EAEDB" : "transparent"
            }}
          >
            <Video className="h-4 w-4 mr-2" />
            Vídeos
          </TabsTrigger>
          <TabsTrigger 
            value="cargo" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            style={{
              borderColor: activeTab === "cargo" ? company?.cor_principal || "#1EAEDB" : "transparent"
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Cargos
          </TabsTrigger>
          <TabsTrigger 
            value="access" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            style={{
              borderColor: activeTab === "access" ? company?.cor_principal || "#1EAEDB" : "transparent"
            }}
          >
            <Key className="h-4 w-4 mr-2" />
            Acessos
          </TabsTrigger>
          <TabsTrigger 
            value="collaborators" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            style={{
              borderColor: activeTab === "collaborators" ? company?.cor_principal || "#1EAEDB" : "transparent"
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger 
            value="courses" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            style={{
              borderColor: activeTab === "courses" ? company?.cor_principal || "#1EAEDB" : "transparent"
            }}
          >
            <Book className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger 
            value="background" 
            className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            <Video className="h-4 w-4 mr-2" />
            Background Login
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="p-6">
        <TabsContent value="info" className="m-0">
          <CompanyIntegrationForm 
            key={`info-${company.id}`}
            company={company}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
          />
        </TabsContent>
        <TabsContent value="videos" className="m-0">
          <IntegrationVideosManager key={`videos-${company.id}`} company={company} />
        </TabsContent>
        <TabsContent value="cargo" className="m-0">
          <JobRolesManager key={`roles-${company.id}`} company={company} />
        </TabsContent>
        <TabsContent value="access" className="m-0">
          <AccessManagement key={`access-${company.id}`} company={company} />
        </TabsContent>
        <TabsContent value="collaborators" className="m-0">
          <CollaboratorsManagement key={`collaborators-${company.id}`} company={company} />
        </TabsContent>
        <TabsContent value="courses" className="m-0">
          <CompanyCourseManagement key={`courses-${company.id}`} company={company} />
        </TabsContent>
        <TabsContent value="background" className="m-0">
          <BackgroundVideoManager />
        </TabsContent>
      </div>
    </Tabs>
  );
};
