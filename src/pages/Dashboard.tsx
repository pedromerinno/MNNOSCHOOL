
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading } = useCompanies();

  // Fetch user's companies
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          await getUserCompanies(user.id);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  return (
    <DashboardLayout>
      <WelcomeBanner company={selectedCompany} />
      <CourseList title="Continue Aprendendo" filter="in-progress" />
      <CourseList title="Recomendados para Você" filter="all" />
    </DashboardLayout>
  );
};

export default Dashboard;
