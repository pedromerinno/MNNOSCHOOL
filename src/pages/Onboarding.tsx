
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import PhotoStep from "@/components/onboarding/steps/PhotoStep";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Onboarding = () => {
  const { signOut } = useAuth();
  
  return (
    <OnboardingProvider>
      <OnboardingLayout>
        <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center relative max-w-xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-900 transition-colors"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> 
            Sair
          </Button>
          
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
    <div className="w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isUpdate ? "Atualizar Perfil" : "Complete seu perfil"}
          </h1>
          <div className="text-sm font-medium text-gray-500">
            Passo {currentStep} de {totalSteps}
          </div>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-black h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
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
