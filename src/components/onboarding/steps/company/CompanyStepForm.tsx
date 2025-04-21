
import React from "react";
import CompanyTypeSelector from "./CompanyTypeSelector";
import CompanyStepActions from "./CompanyStepActions";
import ExistingCompanySection from "./ExistingCompanySection";
import NewCompanySection from "./NewCompanySection";
import { useCompanyStepForm } from "./useCompanyStepForm";

interface CompanyStepFormProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStepForm: React.FC<CompanyStepFormProps> = ({
  onNext,
  onBack,
  onCompanyTypeSelect
}) => {
  const {
    companyType,
    companyId,
    setCompanyId,
    companyDetails,
    setCompanyDetails,
    error,
    isSubmitting,
    handleInitialSubmit,
    companyInfo,
    companyLoading,
    showCompanyInfo,
    setShowCompanyInfo,
    handleCompanyLookup,
    handleCompanyTypeChange
  } = useCompanyStepForm(onNext, onBack, onCompanyTypeSelect);

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-8">
      <CompanyTypeSelector
        companyType={companyType}
        onTypeChange={handleCompanyTypeChange}
      />

      <div className="pt-2">
        {companyType === "existing" ? (
          <ExistingCompanySection
            companyId={companyId}
            setCompanyId={setCompanyId}
            companyInfo={companyInfo}
            companyLoading={companyLoading}
            showCompanyInfo={showCompanyInfo}
            setShowCompanyInfo={setShowCompanyInfo}
            handleCompanyLookup={handleCompanyLookup}
          />
        ) : (
          <NewCompanySection
            companyDetails={companyDetails}
            setCompanyDetails={setCompanyDetails}
          />
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <CompanyStepActions
        companyType={companyType}
        isSubmitting={isSubmitting}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        onBack={onBack}
      />
    </form>
  );
};

export default CompanyStepForm;
