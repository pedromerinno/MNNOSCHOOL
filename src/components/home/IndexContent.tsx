
import React, { useEffect, useState } from 'react';
import { UserHome } from './UserHome';
import { IndexLoadingState } from './IndexLoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';

export const IndexContent = () => {
  const { loading: authLoading } = useAuth();
  const { userCompanies, selectedCompany, isLoading: companiesLoading } = useCompanies();
  const [contentKey, setContentKey] = useState(Date.now());
  
  // Listen for company selection events to force re-render
  useEffect(() => {
    const handleCompanyEvent = () => {
      console.log("IndexContent: Company event detected, forcing re-render");
      setContentKey(Date.now());
    };
    
    window.addEventListener('company-selected', handleCompanyEvent);
    window.addEventListener('company-changed', handleCompanyEvent);
    window.addEventListener('force-reload-companies', handleCompanyEvent);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanyEvent);
      window.removeEventListener('company-changed', handleCompanyEvent);
      window.removeEventListener('force-reload-companies', handleCompanyEvent);
    };
  }, []);
  
  // Notify on company selection
  useEffect(() => {
    if (selectedCompany && !authLoading && !companiesLoading) {
      console.log("IndexContent: Company selected:", selectedCompany.nome);
    }
  }, [selectedCompany, authLoading, companiesLoading]);

  if (authLoading || companiesLoading) {
    return <IndexLoadingState />;
  }

  // Force re-render when key changes
  return <div key={contentKey}><UserHome /></div>;
};
