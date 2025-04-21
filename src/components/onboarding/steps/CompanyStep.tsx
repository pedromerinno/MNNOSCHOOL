
import React, { useState, useEffect } from "react";
import CompanyStepHeader from "./company/CompanyStepHeader";
import CompanyStepForm from "./company/CompanyStepForm";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ 
  onNext, 
  onBack, 
  onCompanyTypeSelect 
}) => {
  const [companyType, setCompanyType] = useState<"existing" | "new">("existing");
  
  const handleTypeChange = (type: "existing" | "new") => {
    console.log("Company type changed in CompanyStep:", type);
    setCompanyType(type);
    onCompanyTypeSelect(type === "existing");
  };

  // Notify parent component of initial company type on mount
  useEffect(() => {
    onCompanyTypeSelect(companyType === "existing");
  }, []);

  return (
    <>
      <CompanyStepHeader 
        companyType={companyType} 
        onTypeChange={handleTypeChange} 
      />
      <CompanyStepForm
        onNext={onNext}
        onBack={onBack}
        companyType={companyType}
        onCompanyTypeChange={handleTypeChange}
      />
    </>
  );
};

export default CompanyStep;
