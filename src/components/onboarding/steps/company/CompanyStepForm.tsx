
import React from "react";
import { useCompanyStepForm } from "./useCompanyStepForm";
import CompanyStepSection from "./CompanyStepSection";
import CompanyStepError from "./CompanyStepError";
import CompanyStepActions from "./CompanyStepActions";

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
    handleCompanyTypeChange,
    onBack: handleBack
  } = useCompanyStepForm(onNext, onBack, onCompanyTypeSelect);

  // Update parent component whenever company type changes
  React.useEffect(() => {
    onCompanyTypeSelect(companyType === "existing");
  }, [companyType, onCompanyTypeSelect]);

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-6">
      <CompanyStepSection
        companyType={companyType}
        companyId={companyId}
        setCompanyId={setCompanyId}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        showCompanyInfo={showCompanyInfo}
        setShowCompanyInfo={setShowCompanyInfo}
        handleCompanyLookup={handleCompanyLookup}
        companyDetails={companyDetails}
        setCompanyDetails={setCompanyDetails}
      />
      
      <CompanyStepError error={error} />
      
      <CompanyStepActions
        companyType={companyType}
        isSubmitting={isSubmitting}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        onBack={handleBack}
      />
    </form>
  );
};

export default CompanyStepForm;
