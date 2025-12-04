import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@/types/company";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Video, FileText, Key, Users } from "lucide-react";
import { getSafeTextColor } from "@/lib/utils";
import { CompanyIntegrationForm } from '../CompanyIntegrationForm';
import { IntegrationVideosManager } from '../IntegrationVideosManager';
import { JobRolesManager } from '../JobRolesManager';
import { AccessManagement } from '../AccessManagement';
import { CollaboratorsManagement } from '../collaborators/CollaboratorsManagement';

interface IntegrationContentProps {
  company: Company;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleFormSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}

export const IntegrationContent: React.FC<IntegrationContentProps> = ({
  company,
  activeTab,
  setActiveTab,
  handleFormSubmit,
  isSaving
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="bg-gray-50 dark:bg-gray-900 w-full justify-start rounded-none p-0 h-auto">
              <TabsTrigger 
                value="info" 
                className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                style={{
                  borderColor: activeTab === "info" ? company?.cor_principal || "#1EAEDB" : "transparent",
                  color: activeTab === "info" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined
                }}
              >
                <Building className="h-4 w-4 mr-2" style={{ color: activeTab === "info" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined }} />
                Informações da Empresa
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                style={{
                  borderColor: activeTab === "videos" ? company?.cor_principal || "#1EAEDB" : "transparent",
                  color: activeTab === "videos" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined
                }}
              >
                <Video className="h-4 w-4 mr-2" style={{ color: activeTab === "videos" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined }} />
                Vídeos
              </TabsTrigger>
              <TabsTrigger 
                value="cargo" 
                className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                style={{
                  borderColor: activeTab === "cargo" ? company?.cor_principal || "#1EAEDB" : "transparent",
                  color: activeTab === "cargo" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined
                }}
              >
                <FileText className="h-4 w-4 mr-2" style={{ color: activeTab === "cargo" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined }} />
                Cargos
              </TabsTrigger>
              <TabsTrigger 
                value="access" 
                className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                style={{
                  borderColor: activeTab === "access" ? company?.cor_principal || "#1EAEDB" : "transparent",
                  color: activeTab === "access" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined
                }}
              >
                <Key className="h-4 w-4 mr-2" style={{ color: activeTab === "access" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined }} />
                Acessos
              </TabsTrigger>
              <TabsTrigger 
                value="collaborators" 
                className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                style={{
                  borderColor: activeTab === "collaborators" ? company?.cor_principal || "#1EAEDB" : "transparent",
                  color: activeTab === "collaborators" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined
                }}
              >
                <Users className="h-4 w-4 mr-2" style={{ color: activeTab === "collaborators" ? getSafeTextColor(company?.cor_principal || "#1EAEDB", false) : undefined }} />
                Colaboradores
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="info" className="m-0">
              <CompanyIntegrationForm 
                company={company}
                onSubmit={handleFormSubmit}
                isSaving={isSaving}
              />
            </TabsContent>
            <TabsContent value="videos" className="m-0">
              <IntegrationVideosManager company={company} />
            </TabsContent>
            <TabsContent value="cargo" className="m-0">
              <JobRolesManager company={company} />
            </TabsContent>
            <TabsContent value="access" className="m-0">
              <AccessManagement companyId={company.id} companyColor={company?.cor_principal} />
            </TabsContent>
            <TabsContent value="collaborators" className="m-0">
              <CollaboratorsManagement company={company} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
