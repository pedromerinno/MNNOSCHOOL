
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import PhotoStep from "@/components/onboarding/steps/PhotoStep";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Navigate } from "react-router-dom";

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
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const isUpdate = !userProfile?.interesses?.includes("onboarding_incomplete");
  // Novo: totalSteps dinâmico com base na seleção de empresa
  const totalSteps = isExistingCompany ? 4 : 3;

  // Step auto-avança/regressa conforme seleção de empresa
  useEffect(() => {
    // Caso opção Empresa Existente seja selecionada, vá para o passo 4
    if (isExistingCompany && currentStep === 3) {
      setCurrentStep(4);
    }
    // Caso Nova Empresa, volte ao passo 3 se já estamos no 4
    if (isExistingCompany === false && currentStep === 4) {
      setCurrentStep(3);
    }
  }, [isExistingCompany, currentStep]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Quando selecionar tipo de empresa no CompanyStep, atualize isExistingCompany (Empresa existente: true, Nova: false)
  const handleCompanyChoice = (isExisting: boolean) => {
    setIsExistingCompany(isExisting);
  };

  // Nova função para redirecionar após criar empresa
  const handleCompanyCreated = () => {
    setOnboardingComplete(true);
  };

  // Se onboarding finalizado, redirecionar para a homepage
  if (onboardingComplete) {
    return <Navigate to="/" replace />;
  }

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
            onCompanyCreated={handleCompanyCreated}
          />
        )}
        {/* Só mostra o passo 4 se isExistingCompany for true! */}
        {currentStep === 4 && isExistingCompany && (
          <InterestsStep onBack={prevStep} />
        )}
      </div>
    </>
  );
};

export default Onboarding;
