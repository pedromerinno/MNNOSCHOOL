import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import PhotoStep from "@/components/onboarding/steps/PhotoStep";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const { userProfile, user } = useAuth();
  const [searchParams] = useSearchParams();
  const forcedStep = searchParams.get('step');
  
  // Verifica se precisa de onboarding completo ou apenas o passo 3
  const needsCompleteOnboarding = userProfile?.interesses?.includes("onboarding_incomplete");
  
  // Se forçar passo 3 via URL, permite acesso mesmo sem flag de onboarding
  if (!needsCompleteOnboarding && forcedStep !== '3') {
    console.log("User doesn't need onboarding, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  return (
    <OnboardingProvider>
      <OnboardingLayout>
        <div className="w-full max-w-4xl mx-auto relative flex flex-col items-center">
          <OnboardingContent forcedStep={forcedStep} />
        </div>
      </OnboardingLayout>
    </OnboardingProvider>
  );
};

const OnboardingContent = ({ forcedStep }: { forcedStep: string | null }) => {
  const [currentStep, setCurrentStep] = useState(forcedStep ? parseInt(forcedStep) : 1);
  const { userProfile, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [isExistingCompany, setIsExistingCompany] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  const needsCompleteOnboarding = userProfile?.interesses?.includes("onboarding_incomplete");
  const totalSteps = needsCompleteOnboarding ? (isExistingCompany ? 4 : 3) : 1;

  // Ensure the correct step is shown when user chooses company type
  useEffect(() => {
    if (isExistingCompany === true && currentStep === 3) {
      setCurrentStep(4);
    }
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

  const handleCompanyChoice = (isExisting: boolean) => {
    setIsExistingCompany(isExisting);
  };

  const handleCompanyCreated = async () => {
    console.log("Company created successfully, finishing onboarding");
    
    // Remove the onboarding flag from user profile
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      const updatedInterests = userProfile.interesses.filter(i => i !== "onboarding_incomplete");
      await updateUserData({
        interesses: updatedInterests
      });
    }
    
    toast.success("Setup completed successfully!");
    setOnboardingComplete(true);
    
    // Trigger events to update data
    window.dispatchEvent(new Event('company-relation-changed'));
    window.dispatchEvent(new Event('force-reload-companies'));
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
  };

  // Direct redirect if onboarding is complete
  if (onboardingComplete) {
    console.log("Onboarding complete, redirecting to home");
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="mb-10 w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
          {needsCompleteOnboarding ? "Complete Your Profile" : "Cadastrar Empresa"}
        </h1>
        {needsCompleteOnboarding && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Step {currentStep} of {totalSteps}
            </p>
            <Progress 
              value={(currentStep / totalSteps) * 100} 
              className="h-1 w-full rounded-full bg-gray-100"
              indicatorClassName="bg-black transition-all duration-500 ease-out"
            />
          </>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 w-full max-w-3xl transition-all duration-300">
        {needsCompleteOnboarding ? (
          <>
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
          </>
        ) : (
          <CompanyStep 
            onNext={nextStep}
            onBack={() => navigate('/')}
            onCompanyTypeSelect={handleCompanyChoice}
            onCompanyCreated={handleCompanyCreated}
            hideBack={true}
          />
        )}
      </div>
    </>
  );
};

export default Onboarding;
