
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserCompany } = useCompanies();
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's selected company
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (user?.id) {
        try {
          const result = await getUserCompany(user.id);
          if (!result.error && result.company) {
            setUserCompany(result.company);
            console.log('Dashboard: Company fetched successfully', result.company.nome);
          }
        } catch (error) {
          console.error('Error fetching company:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompany();
  }, [user, getUserCompany]);

  // Listen for company selection events
  useEffect(() => {
    const handleCompanySelected = async (event: CustomEvent) => {
      const { userId, companyId } = event.detail;
      
      if (userId && companyId && user?.id === userId) {
        try {
          const result = await getUserCompany(userId);
          if (!result.error && result.company) {
            console.log('Dashboard: Updated company after selection', result.company.nome);
            setUserCompany(result.company);
          }
        } catch (error) {
          console.error('Error updating selected company:', error);
        }
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [user, getUserCompany]);

  return (
    <DashboardLayout>
      <WelcomeBanner company={userCompany} />
      <CourseList title="Continue Aprendendo" filter="in-progress" />
      <CourseList title="Recomendados para Você" filter="all" />
    </DashboardLayout>
  );
};

export default Dashboard;
