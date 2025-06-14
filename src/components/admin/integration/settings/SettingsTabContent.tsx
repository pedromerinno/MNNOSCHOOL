import React, { useEffect, useState, useCallback } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Company } from "@/types/company";
import { CompanyIntegrationForm } from '../CompanyIntegrationForm';
import { IntegrationVideosManager } from '../IntegrationVideosManager';
import { JobRolesManager } from '../job-roles/JobRolesManager';
import { AccessManagement } from '../AccessManagement';
import { CollaboratorsManagement } from '../collaborators/CollaboratorsManagement';
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
  const [refreshKey, setRefreshKey] = useState(0);
  
  // More efficient event handler using useCallback
  const handleJobRolesUpdated = useCallback(() => {
    console.log("Job roles updated event detected, refreshing tab content");
    // Only refresh if we're on the roles tab
    if (value === "cargo") {
      setRefreshKey(prev => prev + 1);
    }
  }, [value]);
  
  // Listen for job role updates
  useEffect(() => {
    window.addEventListener('job-roles-updated', handleJobRolesUpdated);
    
    return () => {
      window.removeEventListener('job-roles-updated', handleJobRolesUpdated);
    };
  }, [handleJobRolesUpdated]);

  // Only generate key when needed, not on every render
  const getKey = useCallback((tabValue: string) => {
    if (tabValue === "cargo") {
      return `roles-${company.id}-${refreshKey}`;
    }
    return `${tabValue}-${company.id}`;
  }, [company.id, refreshKey]);

  const getContent = () => {
    switch (value) {
      case "info":
        return (
          <CompanyIntegrationForm 
            key={getKey("info")}
            company={company}
            onSubmit={onSubmit!}
            isSaving={isSaving!}
          />
        );
      case "videos":
        return <IntegrationVideosManager key={getKey("videos")} company={company} />;
      case "cargo":
        return <JobRolesManager key={getKey("cargo")} company={company} />;
      case "access":
        return <AccessManagement key={getKey("access")} companyId={company.id} companyColor={company?.cor_principal} />;
      case "collaborators":
        return <CollaboratorsManagement key={getKey("collaborators")} company={company} />;
      case "courses":
        return <CompanyCourseManagement key={getKey("courses")} company={company} />;
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
