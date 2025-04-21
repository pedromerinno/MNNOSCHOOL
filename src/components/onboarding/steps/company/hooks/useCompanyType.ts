
import { useState, useEffect, useCallback } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";

export type CompanyType = "existing" | "new";

export function useCompanyType(onCompanyTypeSelect: (isExisting: boolean) => void) {
  const { profileData } = useOnboarding();
  const [companyType, setCompanyType] = useState<CompanyType>(
    profileData.companyId ? "existing" : "new"
  );

  useEffect(() => {
    // Notificar mudança de tipo de empresa para componente pai
    onCompanyTypeSelect(companyType === "existing");
  }, [companyType, onCompanyTypeSelect]);

  const handleCompanyTypeChange = useCallback((type: CompanyType) => {
    console.log("Company type changed to:", type);
    setCompanyType(type);
  }, []);

  return { companyType, setCompanyType, handleCompanyTypeChange };
}
