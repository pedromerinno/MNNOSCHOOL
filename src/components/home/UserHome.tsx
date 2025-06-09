
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";
import { Company } from "@/types/company";

export const UserHome = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const hasLoadedRef = useRef(false);
  
  // Load selected company from localStorage only once
  useEffect(() => {
    if (!hasLoadedRef.current) {
      try {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
          const company = JSON.parse(storedCompany);
          console.log('[UserHome] Loading selected company:', company.nome);
          setSelectedCompany(company);
        }
      } catch (error) {
        console.error('[UserHome] Error loading selected company:', error);
      }
      hasLoadedRef.current = true;
    }
  }, []);
  
  // Listen for company selection events (simplified)
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[UserHome] Company selected event received:', company.nome);
      setSelectedCompany(company);
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if (user?.id) {
      console.log("[UserHome] User authenticated, rendering home for company:", selectedCompany?.nome || 'none');
    }
  }, [user?.id, selectedCompany]);
  
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection />
        <QuickLinks />
        <DashboardWidgets />
      </main>
      <Footer />
      <AdminFloatingActionButton />
    </div>
  );
};
