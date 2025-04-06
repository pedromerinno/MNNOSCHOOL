
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserCompany, getUserCompanies } = useCompanies();
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's companies and selected company
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (user?.id) {
        try {
          // First try to get the user's selected company
          const result = await getUserCompany(user.id);
          
          if (!result.error && result.company) {
            setUserCompany(result.company);
            console.log('Dashboard: Company fetched successfully', result.company.nome);
          } else {
            // If no selected company, try to get any company the user belongs to
            const companies = await getUserCompanies(user.id);
            if (companies.length > 0) {
              setUserCompany(companies[0]);
              console.log('Dashboard: No selected company found, using first available', companies[0].nome);
            }
          }
        } catch (error) {
          console.error('Error fetching company:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompany();
  }, [user, getUserCompany, getUserCompanies]);

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
