
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardChallenges } from "@/components/dashboard/DashboardChallenges";
import { LeaderBoard } from "@/components/dashboard/LeaderBoard";
import { UserInfoHeader } from "@/components/dashboard/UserInfoHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading, userCompanies } = useCompanies();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

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

  // Improved loading state with longer minimum delay for admins
  useEffect(() => {
    // Set a longer minimum loading time for admins to prevent flickering
    const minLoadTime = isAdmin ? 2500 : 1500;
    
    const timer = setTimeout(() => {
      if (selectedCompany || !isLoading) {
        setIsPageLoading(false);
      }
    }, minLoadTime);
    
    return () => clearTimeout(timer);
  }, [isLoading, selectedCompany, isAdmin]);

  // If still loading, show consistent loading state
  if (isPageLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <Skeleton className="h-24 w-full rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>

          <Skeleton className="h-64 w-full rounded-lg" />
          
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

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
        
        <UserInfoHeader />

        <DashboardMetrics />

        <DashboardChallenges />
        
        <LeaderBoard />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
