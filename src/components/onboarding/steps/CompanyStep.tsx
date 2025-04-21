
import React from "react";
import CompanyStepHeader from "./company/CompanyStepHeader";
import CompanyStepForm from "./company/CompanyStepForm";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onNext, onBack, onCompanyTypeSelect }) => {
  return (
    <>
      <CompanyStepHeader />
      <CompanyStepForm
        onNext={onNext}
        onBack={onBack}
        onCompanyTypeSelect={onCompanyTypeSelect}
      />
    </>
  );
};

export default CompanyStep;
