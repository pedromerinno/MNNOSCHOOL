
import { useState, useEffect, lazy, Suspense } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/home/LoadingState";
import { CompanyFormSection } from "@/components/home/CompanyFormSection";

const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const { userCompanies, isLoading, fetchCount, forceGetUserCompanies } = useCompanies();
  const { user, userProfile } = useAuth();
  const { getInitialSelectedCompany } = useCompanyCache();
  const navigate = useNavigate();
  const [formShowDelayComplete, setFormShowDelayComplete] = useState(false);
  
  // Verificar necessidade de onboarding
  useEffect(() => {
    if (!user) return;
    
    if (userProfile?.interesses?.includes("onboarding_incomplete")) {
      console.log("[Index] Usuário precisa completar onboarding, redirecionando...");
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, userProfile, navigate]);

  // Verificação imediata do cache e loading state
  const hasCachedCompany = getInitialSelectedCompany() !== null;
  
  // Implementa o delay de 500ms para mostrar o formulário
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (!isPageLoading && userCompanies.length === 0 && fetchCount > 0) {
      timeoutId = window.setTimeout(() => {
        setFormShowDelayComplete(true);
      }, 500);
    } else {
      setFormShowDelayComplete(false);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isPageLoading, userCompanies.length, fetchCount]);
  
  // Loading state management
  useEffect(() => {
    if (hasCachedCompany || (!isLoading && fetchCount > 0)) {
      setIsPageLoading(false);
      
      // Only show company form if user has no companies AND the delay is complete
      const shouldShowCompanyForm = userCompanies.length === 0 && formShowDelayComplete;
      setShowCompanyForm(shouldShowCompanyForm);
      
      // Log for debugging
      if (shouldShowCompanyForm) {
        console.log("[Index] Showing company form because user has no companies");
      } else if (userCompanies.length > 0) {
        console.log("[Index] User has companies, not showing company form");
      }
    }
    
    const timeoutId = setTimeout(() => {
      if (isPageLoading) {
        setIsPageLoading(false);
        if (fetchCount > 0 && userCompanies.length === 0 && formShowDelayComplete) {
          console.log("[Index] Timeout reached, showing company form");
          setShowCompanyForm(true);
        } else if (userCompanies.length > 0) {
          console.log("[Index] Timeout reached, user has companies, not showing form");
          setShowCompanyForm(false);
        }
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchCount, isPageLoading, hasCachedCompany, userCompanies, formShowDelayComplete]);

  // Force hide company form if userCompanies length changes to > 0
  useEffect(() => {
    if (userCompanies.length > 0 && showCompanyForm) {
      console.log("[Index] User now has companies, hiding company form");
      setShowCompanyForm(false);
    }
  }, [userCompanies.length, showCompanyForm]);

  if (isPageLoading) {
    return <LoadingState />;
  }

  if (showCompanyForm) {
    return (
      <CompanyFormSection
        onCompanyCreated={async () => {
          setShowCompanyForm(false);
          if (user?.id) {
            await forceGetUserCompanies(user.id);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};

export default Index;
