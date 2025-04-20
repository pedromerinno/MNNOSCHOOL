
import React, { useState, useEffect } from "react";
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
        <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 relative">
          {/* Botão de logout no canto superior direito */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 text-gray-500 hover:text-black flex items-center gap-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
          
          <OnboardingContent />
        </div>
      </OnboardingLayout>
    </OnboardingProvider>
  );
};

// Componente separado para o conteúdo do onboarding
// evitando re-renderizações desnecessárias
const OnboardingContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Complete seu perfil</h1>
          <div className="text-sm text-gray-500">
            Passo {currentStep} de {totalSteps}
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-merinno-dark h-full rounded-full transition-all duration-300"
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
