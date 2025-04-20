
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const { getUserCompanies, selectedCompany, isLoading, userCompanies, error } = useCompanies();

  // Alert on fetch errors
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar dados da empresa", {
        description: "Por favor, tente novamente em alguns instantes",
      });
    }
  }, [error]);

  // Check if user is admin
  useEffect(() => {
    const checkUserAdmin = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin, super_admin')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Error checking admin status:", error);
          } else {
            setIsUserAdmin(data?.is_admin || data?.super_admin || false);
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
        }
      }
    };
    
    checkUserAdmin();
  }, [user]);

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

  // For admins, always show the dashboard even without companies
  if (isUserAdmin) {
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
  }

  // If user has no companies and is not an admin, show no companies screen
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
