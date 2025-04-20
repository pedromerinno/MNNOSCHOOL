
import { useEffect, useRef } from "react";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyCache } from "./useCompanyCache";
import { toast } from "sonner";

interface UseInitialCompanyDataProps {
  user?: { id: string } | null;
  skipLoadingInOnboarding?: boolean;
  setUserCompanies: (companies: Company[]) => void;
  getUserCompanies: (userId: string, forceRefresh?: boolean) => Promise<Company[]>;
}

export const useInitialCompanyData = ({
  user,
  skipLoadingInOnboarding = false,
  setUserCompanies,
  getUserCompanies
}: UseInitialCompanyDataProps) => {
  const initialDataLoaded = useRef(false);

  useEffect(() => {
    const loadInitialData = async () => {
      // Skip if already loaded or during onboarding
      if (initialDataLoaded.current || skipLoadingInOnboarding) {
        console.log("[useInitialCompanyData] Skipping initial load");
        return;
      }

      if (!user?.id) {
        return;
      }

      try {
        initialDataLoaded.current = true;
        console.log("[useInitialCompanyData] Loading initial company data");

        // Verify if super admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('super_admin')
          .eq('id', user.id)
          .single();

        if (profileData?.super_admin) {
          const { data: allCompanies } = await supabase
            .from('empresas')
            .select('*');

          setUserCompanies(allCompanies as Company[] || []);
        } else {
          await getUserCompanies(user.id);
        }
      } catch (error) {
        console.error('[useInitialCompanyData] Error loading initial data:', error);
        toast.error("Erro ao carregar dados iniciais");
      }
    };

    loadInitialData();
  }, [user?.id, skipLoadingInOnboarding, getUserCompanies, setUserCompanies]);

  return { initialDataLoaded };
};
