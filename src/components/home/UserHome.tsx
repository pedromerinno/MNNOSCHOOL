
import React, { useState, useEffect } from 'react';
import { WelcomeSection } from './WelcomeSection';
import { DashboardWidgets } from './DashboardWidgets';
import { Footer } from './Footer';
import { useCompanies } from '@/hooks/useCompanies';
import { NoCompaniesAvailable } from './NoCompaniesAvailable';
import { EmptyCompanyState } from './EmptyCompanyState';
import { toast } from 'sonner';

// Default export is needed for lazy loading
const UserHome: React.FC = () => {
  const { companies, isLoading, selectedCompany, forceGetUserCompanies, user } = useCompanies();
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentKey, setContentKey] = useState(Date.now()); // Add a key to force re-render

  useEffect(() => {
    // Show empty state if there are companies but none selected
    if (!isLoading && companies.length > 0 && !selectedCompany) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }
    
    // Force a re-render when the selected company changes
    if (selectedCompany) {
      setContentKey(Date.now());
    }
  }, [isLoading, companies, selectedCompany]);

  // Listen for company selection events to force update
  useEffect(() => {
    const handleCompanySelected = () => {
      console.log("[UserHome] Company selection event detected, forcing re-render");
      setContentKey(Date.now());
    };
    
    window.addEventListener('company-selected', handleCompanySelected);
    window.addEventListener('force-reload-companies', handleCompanySelected);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected);
      window.removeEventListener('force-reload-companies', handleCompanySelected);
    };
  }, []);

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[UserHome] Company type selected:", isExisting ? "existing" : "new");
  };
  
  const handleCompanyCreated = () => {
    setShowDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id)
        .then(() => {
          setContentKey(Date.now()); // Force re-render after companies update
        });
    }
  };

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
    return (
      <EmptyCompanyState 
        showDialog={showDialog} 
        onOpenChange={setShowDialog} 
        onCompanyTypeSelect={handleCompanyTypeSelect} 
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />
    );
  }

  // Use the contentKey to force re-render when selected company changes
  return (
    <div key={contentKey} className="container mx-auto px-4 lg:px-8 py-4">
      <WelcomeSection />
      <DashboardWidgets />
      <Footer />
    </div>
  );
};

// Explicitly mark as default export for lazy loading
export default UserHome;
// Also keep named export for direct imports
export { UserHome };
