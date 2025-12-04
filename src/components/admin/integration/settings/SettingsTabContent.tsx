import React, { useCallback } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Company } from "@/types/company";
import { CompanyIntegrationForm } from '../CompanyIntegrationForm';
import { IntegrationVideosManager } from '../IntegrationVideosManager';

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
  // Generate key for component
  const getKey = useCallback((tabValue: string) => {
    return `${tabValue}-${company.id}`;
  }, [company.id]);

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
