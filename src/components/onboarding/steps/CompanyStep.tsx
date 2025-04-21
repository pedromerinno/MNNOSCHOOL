
import React, { useState, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
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
  const { updateProfileData } = useOnboarding();
  
  const handleTypeChange = (type: "existing" | "new") => {
    console.log("Company type changed in CompanyStep:", type);
    setCompanyType(type);
    onCompanyTypeSelect(type === "existing");
  };

  // Notificar componente pai do tipo de empresa inicial ao montar
  useEffect(() => {
    onCompanyTypeSelect(companyType === "existing");
  }, []);

  const handleSubmitSuccess = (companyId: string | null = null) => {
    console.log("Form submitted successfully, companyId:", companyId);
    
    if (companyId) {
      updateProfileData({
        companyId,
        newCompanyName: null,
        companyDetails: null
      });
    }
    
    onNext();
  };

  return (
    <>
      <CompanyStepHeader 
        companyType={companyType} 
        onTypeChange={handleTypeChange} 
      />
      <CompanyStepForm
        onNext={handleSubmitSuccess}
        onBack={onBack}
        companyType={companyType}
        onCompanyTypeChange={handleTypeChange}
      />
    </>
  );
};

export default CompanyStep;
