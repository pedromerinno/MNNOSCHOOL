
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useOnboardingCheck = (user: any, userProfile: any) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, userProfile, navigate]);
};
