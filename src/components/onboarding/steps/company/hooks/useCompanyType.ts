
import { useState, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";

export type CompanyType = "existing" | "new";

export function useCompanyType(onCompanyTypeSelect: (isExisting: boolean) => void) {
  const { profileData } = useOnboarding();
  const [companyType, setCompanyType] = useState<CompanyType>(
    profileData.companyId ? "existing" : "new"
  );

  useEffect(() => {
    onCompanyTypeSelect(companyType === "existing");
  }, [companyType, onCompanyTypeSelect]);

  const handleCompanyTypeChange = (type: CompanyType) => {
    setCompanyType(type);
  };

  return { companyType, setCompanyType, handleCompanyTypeChange };
}
