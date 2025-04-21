
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useNavigate } from "react-router-dom";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

export const useCompanyInitialization = (setShowCompanyDialog: (show: boolean) => void) => {
  const { user, userProfile } = useAuth();
  const { 
    userCompanies, 
    isLoading, 
    fetchCount, 
    forceGetUserCompanies 
  } = useCompanies();
  const navigate = useNavigate();
  const hasAttemptedForceLoad = useRef(false);
  const hasRedirectedToOnboarding = useRef(false);
  const { clearCachedUserCompanies } = useCompanyCache();

  useEffect(() => {
    if (!user) return;

    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] User needs to complete onboarding, redirecting...");
      navigate("/onboarding", { replace: true });
      return;
    }

    if (user && !isLoading && userCompanies.length === 0 && fetchCount > 0) {
      console.log("[Index] User does not have companies after loading. Checking if onboarding is needed...");
      
      if (!userProfile?.interesses?.includes("onboarding_incomplete")) {
        console.log("[Index] User does not have onboarding incomplete flag but does not have companies. Trying to force load...");
        
        if (!hasAttemptedForceLoad.current && user.id) {
          hasAttemptedForceLoad.current = true;
          clearCachedUserCompanies();
          
          forceGetUserCompanies(user.id)
            .then(companies => {
              if (companies.length === 0 && !hasRedirectedToOnboarding.current) {
                console.log("[Index] Even after forcing load, no companies. Opening company creation dialog...");
                setShowCompanyDialog(true);
              }
            })
            .catch(err => {
              console.error("[Index] Error while trying to force load companies:", err);
            })
            .finally(() => {
              setTimeout(() => {
                hasAttemptedForceLoad.current = false;
              }, 10000);
            });
        }
      }
    }
  }, [user, userProfile, navigate, isLoading, userCompanies, fetchCount, forceGetUserCompanies, setShowCompanyDialog, clearCachedUserCompanies]);
};
