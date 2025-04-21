
import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCompanies } from "@/hooks/useCompanies";

const CompanyPage = () => {
  const { companyId } = useParams();
  const { getCompanyById, selectCompany } = useCompanies();
  const [isLoading, setIsLoading] = React.useState(true);
  const [companyExists, setCompanyExists] = React.useState(false);
  
  useEffect(() => {
    const checkCompany = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const company = await getCompanyById(companyId);
        if (company) {
          setCompanyExists(true);
          await selectCompany(company.id, company);
        }
      } catch (error) {
        console.error("Error checking company:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCompany();
  }, [companyId, getCompanyById, selectCompany]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Redirect to homepage if company doesn't exist
  if (!companyExists) {
    return <Navigate to="/" replace />;
  }
  
  // If company exists, we've already selected it, so just redirect to homepage
  return <Navigate to="/" replace />;
};

export default CompanyPage;
