
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import PhotoStep from "@/components/onboarding/steps/PhotoStep";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

const Onboarding = () => {
  return (
    <OnboardingProvider>
      <OnboardingLayout>
        <div className="w-full max-w-4xl mx-auto relative flex flex-col items-center">
          <OnboardingContent />
        </div>
      </OnboardingLayout>
    </OnboardingProvider>
  );
};

const OnboardingContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { userProfile } = useAuth();
  const [isExistingCompany, setIsExistingCompany] = useState<boolean | null>(null);
  
  const isUpdate = !userProfile?.interesses?.includes("onboarding_incomplete");

  // Define o número total de passos com base na seleção de tipo de empresa
  const totalSteps = isExistingCompany === true ? 4 : 3;

  const nextStep = () => {
    // Se for nova empresa, não avança além do passo 3, pois redirecionamento acontece após criar empresa.
    if ((isExistingCompany === false && currentStep < 3) ||
        (isExistingCompany === true && currentStep < 4)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompanyChoice = (isExisting: boolean) => {
    setIsExistingCompany(isExisting);
    // Reset step para 3 caso usuário troque opção para não pular passo
    if (currentStep > 3) {
      setCurrentStep(3);
    }
  };

  return (
    <>
      <div className="mb-10 w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
          {isUpdate ? "Atualizar Perfil" : "Complete seu perfil"}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Passo {currentStep} de {totalSteps}
        </p>
        <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
          <div 
            className="h-full rounded-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 w-full max-w-3xl transition-all duration-300">
        {currentStep === 1 && <ProfileStep onNext={nextStep} />}
        {currentStep === 2 && <PhotoStep onNext={nextStep} onBack={prevStep} />}
        {currentStep === 3 && (
          <CompanyStep 
            onNext={nextStep} 
            onBack={prevStep} 
            onCompanyTypeSelect={handleCompanyChoice}
          />
        )}
        {/* Exibe o passo 4 somente se uma empresa existente foi selecionada */}
        {currentStep === 4 && isExistingCompany && (
          <InterestsStep onBack={prevStep} />
        )}
      </div>
    </>
  );
};

export default Onboarding;
