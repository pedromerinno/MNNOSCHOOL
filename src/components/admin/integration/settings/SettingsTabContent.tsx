
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Company } from "@/types/company";
import { CompanyIntegrationForm } from '../CompanyIntegrationForm';
import { IntegrationVideosManager } from '../IntegrationVideosManager';
import { JobRolesManager } from '../JobRolesManager';
import { AccessManagement } from '../AccessManagement';
import { CollaboratorsManagement } from '../CollaboratorsManagement';
import { CompanyCourseManagement } from '../CompanyCourseManagement';
import { BackgroundManager } from '../../BackgroundManager';

interface SettingsTabContentProps {
  value: string;
  company: Company;
  onSubmit?: (formData: any) => Promise<void>;
  isSaving?: boolean;
}

export const SettingsTabContent: React.FC<SettingsTabContentProps> = ({
  value,
  company,
  onSubmit,
  isSaving
}) => {
  const getContent = () => {
    switch (value) {
      case "info":
        return (
          <CompanyIntegrationForm 
            key={`info-${company.id}`}
            company={company}
            onSubmit={onSubmit!}
            isSaving={isSaving!}
          />
        );
      case "videos":
        return <IntegrationVideosManager key={`videos-${company.id}`} company={company} />;
      case "cargo":
        return <JobRolesManager key={`roles-${company.id}`} company={company} />;
      case "access":
        return <AccessManagement key={`access-${company.id}`} company={company} />;
      case "collaborators":
        return <CollaboratorsManagement key={`collaborators-${company.id}`} company={company} />;
      case "courses":
        return <CompanyCourseManagement key={`courses-${company.id}`} company={company} />;
      case "background":
        return <BackgroundManager />;
      default:
        return null;
    }
  };

  return (
    <TabsContent value={value} className="m-0">
      {getContent()}
    </TabsContent>
  );
};
