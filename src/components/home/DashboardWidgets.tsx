
import { useEffect, useState } from "react";
import { CalendarWidget } from "./CalendarWidget";
import { NotificationsWidget } from "./NotificationsWidget";
import { FeedbackWidget } from "./FeedbackWidget";
import { Company } from "@/types/company";

export const DashboardWidgets = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load selected company from localStorage
  useEffect(() => {
    const loadSelectedCompany = () => {
      try {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
          const company = JSON.parse(storedCompany);
          console.log('[DashboardWidgets] Loading selected company:', company.nome);
          setSelectedCompany(company);
        }
      } catch (error) {
        console.error('[DashboardWidgets] Error loading selected company:', error);
      }
    };

    loadSelectedCompany();
  }, []);

  // Listen for company selection events
  useEffect(() => {
    const handleCompanyEvents = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[DashboardWidgets] Company event received:', company.nome);
      setSelectedCompany(company);
      // Force refresh of widgets
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('company-selected', handleCompanyEvents as EventListener);
    window.addEventListener('company-changed', handleCompanyEvents as EventListener);
    window.addEventListener('company-content-reload', handleCompanyEvents as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanyEvents as EventListener);
      window.removeEventListener('company-changed', handleCompanyEvents as EventListener);
      window.removeEventListener('company-content-reload', handleCompanyEvents as EventListener);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <div key={`calendar-${refreshKey}`}>
        <CalendarWidget />
      </div>
      <div key={`notifications-${refreshKey}`}>
        <NotificationsWidget />
      </div>
      <div key={`feedback-${refreshKey}`}>
        <FeedbackWidget />
      </div>
    </div>
  );
};
