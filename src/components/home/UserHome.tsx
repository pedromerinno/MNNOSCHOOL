
import React, { useState, useEffect } from 'react';
import { WelcomeSection } from './WelcomeSection';
import { DashboardWidgets } from './DashboardWidgets';
import { Footer } from './Footer';
import { useCompanies } from '@/hooks/useCompanies';
import { NoCompaniesAvailable } from './NoCompaniesAvailable';
import { EmptyCompanyState } from './EmptyCompanyState';

export const UserHome: React.FC = () => {
  const { companies, isLoading, selectedCompany } = useCompanies();
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    // Show empty state if there are companies but none selected
    if (!isLoading && companies.length > 0 && !selectedCompany) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }
  }, [isLoading, companies, selectedCompany]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  if (showEmptyState) {
    return <EmptyCompanyState />;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-4">
      <WelcomeSection />
      <DashboardWidgets />
      <Footer />
    </div>
  );
};

// Adicionar exportação default para compatibilidade com lazy loading
export default UserHome;
