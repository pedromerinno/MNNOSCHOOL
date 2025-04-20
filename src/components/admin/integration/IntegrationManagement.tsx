
import React from 'react';
import { Loader2 } from "lucide-react";
import { useIntegrationManagement } from './management/useIntegrationManagement';
import { IntegrationHeader } from './management/IntegrationHeader';
import { IntegrationContent } from './management/IntegrationContent';
import { NoCompanyState } from './management/NoCompanyState';

export const IntegrationManagement: React.FC = () => {
  const {
    companies,
    isLoading,
    selectedCompany,
    isSaving,
    activeTab,
    setActiveTab,
    handleCompanyChange,
    handleFormSubmit
  } = useIntegrationManagement();

  if (isLoading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IntegrationHeader
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={handleCompanyChange}
        isDisabled={companies.length === 0}
      />

      {selectedCompany ? (
        <IntegrationContent
          company={selectedCompany}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleFormSubmit={handleFormSubmit}
          isSaving={isSaving}
        />
      ) : (
        <NoCompanyState />
      )}
    </div>
  );
};
