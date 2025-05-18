
import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  companyType: 'new' | 'existing' | null;
  setCompanyType: (type: 'new' | 'existing' | null) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyType, setCompanyType] = useState<'new' | 'existing' | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const resetOnboarding = () => {
    setCompanyType(null);
    setOnboardingStep(0);
  };

  return (
    <OnboardingContext.Provider
      value={{
        companyType,
        setCompanyType,
        onboardingStep,
        setOnboardingStep,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

