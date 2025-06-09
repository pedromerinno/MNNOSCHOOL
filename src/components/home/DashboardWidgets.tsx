
import { useEffect, useState, useRef } from "react";
import { CalendarWidget } from "./CalendarWidget";
import { NotificationsWidget } from "./NotificationsWidget";
import { FeedbackWidget } from "./FeedbackWidget";
import { Company } from "@/types/company";

export const DashboardWidgets = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const hasLoadedRef = useRef(false);

  // Load selected company from localStorage only once
  useEffect(() => {
    if (!hasLoadedRef.current) {
      try {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
          const company = JSON.parse(storedCompany);
          setSelectedCompany(company);
        }
      } catch (error) {
        console.error('[DashboardWidgets] Error loading selected company:', error);
      }
      hasLoadedRef.current = true;
    }
  }, []);

  // Listen for company selection events
  useEffect(() => {
    const handleCompanyEvents = (event: CustomEvent) => {
      const { company } = event.detail;
      setSelectedCompany(company);
    };

    window.addEventListener('company-selected', handleCompanyEvents as EventListener);
    window.addEventListener('company-changed', handleCompanyEvents as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanyEvents as EventListener);
      window.removeEventListener('company-changed', handleCompanyEvents as EventListener);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <CalendarWidget />
      <NotificationsWidget />
      <FeedbackWidget />
    </div>
  );
};
