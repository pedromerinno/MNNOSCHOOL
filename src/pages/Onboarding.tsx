
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import PhotoStep from "@/components/onboarding/steps/PhotoStep";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const { userProfile, user, updateUserData } = useAuth();
  
  // Check if onboarding is actually needed
  useEffect(() => {
    const checkIfOnboardingNeeded = async () => {
      if (user?.id && userProfile) {
        // Check if user has any companies
        const { data: relations } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', user.id);
          
        if (relations && relations.length > 0) {
          // User has companies, remove onboarding flag if present
          if (userProfile.interesses?.includes("onboarding_incomplete")) {
            console.log("User has companies but onboarding flag is still set. Removing flag...");
            const updatedInterests = userProfile.interesses.filter(i => i !== "onboarding_incomplete");
            await updateUserData({
              interesses: updatedInterests
            });
          }
        }
      }
    };
    
    checkIfOnboardingNeeded();
  }, [user, userProfile, updateUserData]);
  
  // If user doesn't need onboarding, redirect
  if (userProfile && !userProfile.interesses?.includes("onboarding_incomplete")) {
    console.log("User doesn't need onboarding, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
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
  const { userProfile, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [isExistingCompany, setIsExistingCompany] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const isUpdate = userProfile && !userProfile?.interesses?.includes("onboarding_incomplete");
  const totalSteps = 3; // Changed from conditional 3/4 to fixed 3 (removed interests step)

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
        interesses: updatedInterests,
        primeiro_login: false
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
          {isUpdate ? "Update Profile" : "Complete Your Profile"}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Step {currentStep} of {totalSteps}
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
      </div>
    </>
  );
};

export default Onboarding;
