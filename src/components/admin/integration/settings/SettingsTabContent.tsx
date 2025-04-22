
import React, { useEffect, useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Company } from "@/types/company";
import { CompanyIntegrationForm } from '../CompanyIntegrationForm';
import { IntegrationVideosManager } from '../IntegrationVideosManager';
import { JobRolesManager } from '../job-roles/JobRolesManager';
import { AccessManagement } from '../AccessManagement';
import { CollaboratorsManagement } from '../CollaboratorsManagement';
import { CompanyCourseManagement } from '../CompanyCourseManagement';

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
  // Use key state to force re-render when job roles update
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Listen for job role updates
  useEffect(() => {
    const handleJobRolesUpdated = () => {
      console.log("Job roles updated event detected, refreshing tab content");
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('job-roles-updated', handleJobRolesUpdated);
    
    return () => {
      window.removeEventListener('job-roles-updated', handleJobRolesUpdated);
    };
  }, []);

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
        return <JobRolesManager key={`roles-${company.id}-${refreshKey}`} company={company} />;
      case "access":
        return <AccessManagement key={`access-${company.id}`} company={company} />;
      case "collaborators":
        return <CollaboratorsManagement key={`collaborators-${company.id}`} company={company} />;
      case "courses":
        return <CompanyCourseManagement key={`courses-${company.id}`} company={company} />;
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
