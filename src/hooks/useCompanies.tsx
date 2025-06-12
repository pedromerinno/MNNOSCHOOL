
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CompaniesContextType {
  userCompanies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  selectCompany: (userId: string, company: Company) => void;
  forceGetUserCompanies: (userId: string) => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

interface CompaniesProviderProps {
  children: ReactNode;
  skipLoadingInOnboarding?: boolean;
}

export const CompaniesProvider = ({ children, skipLoadingInOnboarding = false }: CompaniesProviderProps) => {
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();
  
  const getUserCompanies = useCallback(async (userId: string, forceReload = false) => {
    if (!userId) return;
    
    if (isLoading && !forceReload) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[CompaniesProvider] Loading companies for user: ${userId}, forceReload: ${forceReload}`);
      
      const { data, error } = await supabase
        .rpc('get_user_companies', { user_id: userId });
        
      if (error) {
        console.error('[CompaniesProvider] Error loading companies:', error);
        throw error;
      }
      
      const companies = data || [];
      console.log(`[CompaniesProvider] Loaded ${companies.length} companies:`, companies);
      
      setUserCompanies(companies);
      
      // Auto-select first company if none selected and companies exist
      if (companies.length > 0 && !selectedCompany) {
        console.log('[CompaniesProvider] Auto-selecting first company:', companies[0]);
        setSelectedCompany(companies[0]);
        
        // Store in localStorage
        localStorage.setItem(`selectedCompany_${userId}`, JSON.stringify(companies[0]));
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('company-selected', {
          detail: { company: companies[0] }
        }));
      }
      
      // If selected company doesn't exist in user companies, clear it
      if (selectedCompany && companies.length > 0) {
        const stillExists = companies.find(c => c.id === selectedCompany.id);
        if (!stillExists) {
          console.log('[CompaniesProvider] Selected company no longer exists, clearing selection');
          setSelectedCompany(null);
          localStorage.removeItem(`selectedCompany_${userId}`);
        }
      }
      
    } catch (error: any) {
      console.error('[CompaniesProvider] Error in getUserCompanies:', error);
      setError(error.message || 'Erro ao carregar empresas');
      setUserCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedCompany]);

  const forceGetUserCompanies = useCallback(async (userId: string) => {
    console.log('[CompaniesProvider] Force reloading companies for user:', userId);
    await getUserCompanies(userId, true);
  }, [getUserCompanies]);

  const selectCompany = useCallback((userId: string, company: Company) => {
    console.log('[CompaniesProvider] Selecting company:', company);
    setSelectedCompany(company);
    
    // Store in localStorage
    localStorage.setItem(`selectedCompany_${userId}`, JSON.stringify(company));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('company-selected', {
      detail: { company }
    }));
  }, []);

  // Load companies when user changes
  useEffect(() => {
    if (user?.id && !skipLoadingInOnboarding) {
      // Try to restore selected company from localStorage first
      const storedCompany = localStorage.getItem(`selectedCompany_${user.id}`);
      if (storedCompany) {
        try {
          const parsedCompany = JSON.parse(storedCompany);
          console.log('[CompaniesProvider] Restored company from localStorage:', parsedCompany);
          setSelectedCompany(parsedCompany);
        } catch (error) {
          console.error('[CompaniesProvider] Error parsing stored company:', error);
          localStorage.removeItem(`selectedCompany_${user.id}`);
        }
      }
      
      getUserCompanies(user.id);
    }
  }, [user?.id, getUserCompanies, skipLoadingInOnboarding]);

  // Listen for company relation changes
  useEffect(() => {
    const handleCompanyRelationChange = () => {
      if (user?.id) {
        console.log('[CompaniesProvider] Company relation changed, reloading companies');
        forceGetUserCompanies(user.id);
      }
    };

    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [user?.id, forceGetUserCompanies]);

  const value: CompaniesContextType = {
    userCompanies,
    selectedCompany,
    isLoading,
    error,
    selectCompany,
    forceGetUserCompanies,
  };

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
};

export const useCompanies = (options?: { skipLoadingInOnboarding?: boolean }) => {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider');
  }
  return context;
};
