
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
        <div className="w-full max-w-3xl mx-auto relative">
          <OnboardingContent />
        </div>
      </OnboardingLayout>
    </OnboardingProvider>
  );
};

const OnboardingContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const { userProfile } = useAuth();
  
  const isUpdate = !userProfile?.interesses?.includes("onboarding_incomplete");

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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 transition-all duration-300">
      <div className="mb-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            {isUpdate ? "Atualizar Perfil" : "Complete seu perfil"}
          </h1>
          <p className="text-sm text-gray-500">
            Passo {currentStep} de {totalSteps}
          </p>
        </div>
        <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
          <div 
            className="h-full rounded-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {currentStep === 1 && <ProfileStep onNext={nextStep} />}
      {currentStep === 2 && <PhotoStep onNext={nextStep} onBack={prevStep} />}
      {currentStep === 3 && <CompanyStep onNext={nextStep} onBack={prevStep} />}
      {currentStep === 4 && <InterestsStep onBack={prevStep} />}
    </div>
  );
};

export default Onboarding;
