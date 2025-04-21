
import React, { useState } from "react";
import CompanyStepHeader from "./company/CompanyStepHeader";
import CompanyStepForm from "./company/CompanyStepForm";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onNext, onBack, onCompanyTypeSelect }) => {
  const [companyType, setCompanyType] = useState<"existing" | "new">("existing");
  
  const handleTypeChange = (type: "existing" | "new") => {
    setCompanyType(type);
  };

  return (
    <>
      <CompanyStepHeader 
        companyType={companyType} 
        onTypeChange={handleTypeChange} 
      />
      <CompanyStepForm
        onNext={onNext}
        onBack={onBack}
        onCompanyTypeSelect={onCompanyTypeSelect}
      />
    </>
  );
};

export default CompanyStep;
