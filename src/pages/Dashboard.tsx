
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserCompanies } = useCompanies();
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's companies
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          // Get all companies the user is related to
          const companies = await getUserCompanies(user.id);
          
          // If user has any companies, set the first one as default
          if (companies.length > 0) {
            setUserCompany(companies[0]);
            console.log('Dashboard: Using first available company', companies[0].nome);
          }
        } catch (error) {
          console.error('Error fetching companies:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // Listen for company selection events
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { userId, company } = event.detail;
      
      if (userId && company && user?.id === userId) {
        console.log('Dashboard: Updated company after selection', company.nome);
        setUserCompany(company);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [user]);

  return (
    <DashboardLayout>
      <WelcomeBanner company={userCompany} />
      <CourseList title="Continue Aprendendo" filter="in-progress" />
      <CourseList title="Recomendados para Você" filter="all" />
    </DashboardLayout>
  );
};

export default Dashboard;
