
import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import CompanyTypeSelector from "./company/CompanyTypeSelector";
import ExistingCompanyForm from "./company/ExistingCompanyForm";
import NewCompanyForm from "./company/NewCompanyForm";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyStepProps {
  onBack: () => void;
  onNext: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onBack, onNext, onCompanyTypeSelect }) => {
  const { user } = useAuth();
  const { profileData, updateProfileData, saveProfileData, isLoading } = useOnboarding();
  const [companyType, setCompanyType] = useState<'existing' | 'new'>('existing');
  const [companyId, setCompanyId] = useState("");
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    description: "",
    historia: "",
    missao: "",
    valores: "",
    frase_institucional: "",
    video_institucional: "",
    descricao_video: "",
  });

  const handleTypeChange = (type: 'existing' | 'new') => {
    setCompanyType(type);
    onCompanyTypeSelect(type === 'existing');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      return;
    }
    
    if (companyType === 'existing') {
      if (!companyId.trim()) {
        return;
      }
      updateProfileData({ companyId });
    } else {
      if (!companyDetails.name.trim()) {
        return;
      }
      updateProfileData({ 
        newCompanyName: companyDetails.name,
        companyDetails
      });
    }
    
    await saveProfileData();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Sobre sua empresa</h2>
        <p className="text-gray-500 text-sm">
          Nos conte um pouco sobre a empresa que você trabalha
        </p>
      </div>

      <CompanyTypeSelector 
        companyType={companyType} 
        onTypeChange={handleTypeChange} 
      />

      <div className="mt-6">
        {companyType === 'existing' ? (
          <ExistingCompanyForm 
            companyId={companyId}
            onCompanyIdChange={setCompanyId}
          />
        ) : (
          <NewCompanyForm 
            companyDetails={companyDetails}
            onCompanyDetailsChange={setCompanyDetails}
          />
        )}
      </div>

      <div className="flex justify-between pt-6 space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-merinno-dark hover:bg-black text-white"
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Atualizar perfil"}
        </Button>
      </div>
    </form>
  );
};

export default CompanyStep;
