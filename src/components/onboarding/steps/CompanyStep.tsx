import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Building, ArrowRight } from "lucide-react";
import NewCompanyForm from "./company/NewCompanyForm";
import ExistingCompanyForm from "./company/ExistingCompanyForm";

interface CompanyStepProps {
  onNext?: () => void;
  onBack?: () => void;
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
  const { companyType, setCompanyType } = useOnboarding();
  const [companyId, setCompanyId] = useState("");

  const handleTypeSelect = (type: 'new' | 'existing') => {
    setCompanyType(type);
    if (onCompanyTypeSelect) {
      onCompanyTypeSelect(type === 'existing');
    }
  };

  return (
    <div className="space-y-6">
      {!companyType ? (
        // Select company type (new or existing)
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">
              Configuração da Empresa
            </h1>
            <p className="text-gray-500 text-sm mb-4">
              Escolha entre criar uma nova empresa ou vincular-se a uma existente
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create new company option */}
            <button
              onClick={() => handleTypeSelect('new')}
              className="border border-gray-200 rounded-lg p-5 text-left hover:border-black transition-colors flex flex-col items-center text-center hover:bg-gray-50"
            >
              <div className="mb-4 p-3 bg-gray-100 rounded-full">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-1">Nova Empresa</h3>
              <p className="text-sm text-gray-500">
                Crie uma nova empresa no sistema
              </p>
            </button>

            {/* Existing company option */}
            <button
              onClick={() => handleTypeSelect('existing')}
              className="border border-gray-200 rounded-lg p-5 text-left hover:border-black transition-colors flex flex-col items-center text-center hover:bg-gray-50"
            >
              <div className="mb-4 p-3 bg-gray-100 rounded-full">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-1">Empresa Existente</h3>
              <p className="text-sm text-gray-500">
                Vincule-se a uma empresa já registrada
              </p>
            </button>
          </div>

          {showBackButton && (
            <div className="flex justify-start mt-4">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                >
                  Voltar
                </Button>
              )}
            </div>
          )}
        </div>
      ) : companyType === 'new' ? (
        <NewCompanyForm
          onBack={() => setCompanyType(null)}
          onComplete={() => {
            if (onCompanyCreated) onCompanyCreated();
            if (onNext) onNext();
          }}
        />
      ) : (
        <ExistingCompanyForm
          companyId={companyId}
          onCompanyIdChange={setCompanyId}
          onBack={() => setCompanyType(null)}
          onComplete={() => {
            if (onCompanyCreated) onCompanyCreated();
            if (onNext) onNext();
          }}
        />
      )}
    </div>
  );
};

export default CompanyStep;
