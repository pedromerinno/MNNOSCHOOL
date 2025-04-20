
import { useState, useEffect } from "react";
import { UserHome } from "@/components/home/UserHome";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const { userCompanies, isLoading, fetchCount, selectedCompany, error } = useCompanies();
  const { user } = useAuth();

  // Check for fetch errors and show toast
  useEffect(() => {
    if (error) {
      toast.error("Erro ao buscar empresas", {
        description: "Tentaremos novamente em alguns segundos",
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
            console.log("User is admin:", data?.is_admin || data?.super_admin || false);
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
        }
      }
    };
    
    checkUserAdmin();
  }, [user]);

  // Improved loading state to ensure we don't show "no companies" too early
  useEffect(() => {
    // Only stop showing loading state when:
    // 1. We've attempted to fetch companies at least once (fetchCount > 0)
    // 2. We have a selected company already 
    // 3. Or, we've finished loading and confirmed there are no companies
    const timer = setTimeout(() => {
      if (selectedCompany || fetchCount > 0 || !isLoading) {
        setIsPageLoading(false);
      }
    }, 2000); // Minimum loading time to give cache a chance to load
    
    return () => clearTimeout(timer);
  }, [isLoading, fetchCount, selectedCompany]);

  // Show loading state while we're checking for companies
  if (isPageLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex justify-center">
            <Skeleton className="h-8 w-48 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-3/4 mx-auto rounded-lg" />
            <div className="flex justify-center mt-6">
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // For admin users, always show the main page even without linked companies
  // Admin users can create companies if they don't have any
  if (isUserAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <UserHome />
      </div>
    );
  }

  // For regular users, only show NoCompanies if there are actually no companies
  if (user && !isLoading && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHome />
    </div>
  );
};

export default Index;
