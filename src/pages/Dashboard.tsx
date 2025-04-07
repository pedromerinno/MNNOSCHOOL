
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardChallenges } from "@/components/dashboard/DashboardChallenges";
import { LeaderBoard } from "@/components/dashboard/LeaderBoard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading, userCompanies } = useCompanies();
  const navigate = useNavigate();

  // Fetch user's companies
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // If user has no companies, show no companies screen
  if (!isLoading && user && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ready to grow? Discover new tasks and seize the opportunity!
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <DashboardMetrics />
        )}

        <DashboardChallenges />
        
        <LeaderBoard />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
