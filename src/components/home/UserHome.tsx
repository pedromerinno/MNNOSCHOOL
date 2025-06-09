
import { useEffect, useState } from "react";
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
  
  // Load selected company from localStorage
  useEffect(() => {
    const loadSelectedCompany = () => {
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
    };

    loadSelectedCompany();
  }, []);
  
  // Listen for company selection events
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[UserHome] Company selected event received:', company.nome);
      setSelectedCompany(company);
    };

    const handleCompanyChanged = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[UserHome] Company changed event received:', company.nome);
      setSelectedCompany(company);
    };

    const handleCompanyContentReload = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[UserHome] Company content reload event received:', company.nome);
      setSelectedCompany(company);
      // Force re-render of components that depend on company
      window.location.reload();
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    window.addEventListener('company-changed', handleCompanyChanged as EventListener);
    window.addEventListener('company-content-reload', handleCompanyContentReload as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
      window.removeEventListener('company-changed', handleCompanyChanged as EventListener);
      window.removeEventListener('company-content-reload', handleCompanyContentReload as EventListener);
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
