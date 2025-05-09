import React, { useState, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NewCompanyForm from "./company/NewCompanyForm";
import ExistingCompanyForm from "./company/ExistingCompanyForm";
import CompanyTypeSelector from "./company/CompanyTypeSelector";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect?: (isExisting: boolean) => void;
  onCompanyCreated?: () => void;
  showBackButton?: boolean;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ 
  onNext, 
  onBack, 
  onCompanyTypeSelect,
  onCompanyCreated,
  showBackButton = true
}) => {
  const { profileData, updateProfileData, isLoading } = useOnboarding();
  const [companyType, setCompanyType] = useState<"new" | "existing" | null>(null);
  
  const handleCompanyTypeSelect = (type: "new" | "existing") => {
    setCompanyType(type);
    if (onCompanyTypeSelect) {
      onCompanyTypeSelect(type === "existing");
    }
  };
  
  return (
    <div className="space-y-6">
      {!companyType ? (
        // Company Type Selection Screen
        <>
          <CompanyTypeSelector onSelect={handleCompanyTypeSelect} />
          
          {showBackButton && (
            <Button 
              type="button" 
              variant="ghost"
              className="mt-6 flex items-center justify-center gap-2 text-gray-500"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </>
      ) : companyType === "new" ? (
        // New Company Form
        <NewCompanyForm 
          onBack={() => setCompanyType(null)} 
          onComplete={() => {
            if (onCompanyCreated) onCompanyCreated();
            onNext();
          }}
        />
      ) : (
        // Existing Company Form
        <ExistingCompanyForm 
          onBack={() => setCompanyType(null)} 
          onComplete={() => {
            if (onCompanyCreated) onCompanyCreated();
            onNext();
          }}
        />
      )}
    </div>
  );
};

export default CompanyStep;
