
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import PhotoStep from "@/components/onboarding/steps/PhotoStep";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

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
  const navigate = useNavigate();
  const [isExistingCompany, setIsExistingCompany] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const isUpdate = !userProfile?.interesses?.includes("onboarding_incomplete");
  const totalSteps = isExistingCompany ? 4 : 3;

  useEffect(() => {
    if (isExistingCompany && currentStep === 3) {
      setCurrentStep(4);
    }
    if (isExistingCompany === false && currentStep === 4) {
      setCurrentStep(3);
    }
  }, [isExistingCompany, currentStep]);
  
  // Se o usuário estiver logado e onboarding estiver completo, redirecionar imediatamente
  useEffect(() => {
    if (userProfile && !userProfile.interesses?.includes("onboarding_incomplete")) {
      // Redirecionar para a página inicial se o onboarding já foi concluído
      navigate("/", { replace: true });
    }
  }, [userProfile, navigate]);

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

  const handleCompanyChoice = (isExisting: boolean) => {
    setIsExistingCompany(isExisting);
  };

  const handleCompanyCreated = () => {
    setOnboardingComplete(true);
  };

  // Redirecionamento direto se o onboarding foi completado (via criação de empresa)
  if (onboardingComplete) {
    console.log("Onboarding complete, redirecting to home");
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
        <Progress 
          value={(currentStep / totalSteps) * 100} 
          className="h-1 w-full rounded-full bg-gray-100"
          indicatorClassName="bg-black transition-all duration-500 ease-out"
        />
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
        {currentStep === 4 && isExistingCompany && (
          <InterestsStep onBack={prevStep} />
        )}
      </div>
    </>
  );
};

export default Onboarding;
