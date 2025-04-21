
import React from "react";
import { useCompanyStepForm } from "./useCompanyStepForm";
import CompanyStepSection from "./CompanyStepSection";
import CompanyStepError from "./CompanyStepError";
import CompanyStepActions from "./CompanyStepActions";

interface CompanyStepFormProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
  companyType: "existing" | "new";
  onCompanyTypeChange: (type: "existing" | "new") => void;
}

const CompanyStepForm: React.FC<CompanyStepFormProps> = ({
  onNext,
  onBack,
  onCompanyTypeSelect,
  companyType: parentCompanyType,
  onCompanyTypeChange
}) => {
  const {
    companyType,
    setCompanyType,
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

  // Sincronizar o tipo de empresa entre o componente pai e o hook
  React.useEffect(() => {
    if (parentCompanyType !== companyType) {
      setCompanyType(parentCompanyType);
    }
  }, [parentCompanyType, companyType, setCompanyType]);

  // Atualizar o componente pai quando o tipo de empresa mudar
  React.useEffect(() => {
    onCompanyTypeSelect(companyType === "existing");
    onCompanyTypeChange(companyType);
  }, [companyType, onCompanyTypeSelect, onCompanyTypeChange]);

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
