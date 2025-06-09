
import { useEffect, memo, useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CompanySelector = memo(() => {
  const { user } = useAuth();
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simplified company fetching - only fetch once
  const fetchUserCompanies = useCallback(async () => {
    if (!user?.id || isLoading || userCompanies.length > 0) return;

    setIsLoading(true);
    try {
      console.log('[CompanySelector] Fetching user companies for user:', user.id);
      const { data, error } = await supabase
        .rpc('get_user_companies', { user_id: user.id });

      if (error) throw error;
      
      const companies = data as Company[];
      console.log('[CompanySelector] Fetched companies:', companies.length);
      setUserCompanies(companies);
      
      // Auto-select first company if none selected
      if (companies.length > 0 && !selectedCompany) {
        console.log('[CompanySelector] Auto-selecting first company:', companies[0].nome);
        handleCompanyChange(companies[0]);
      }
    } catch (error) {
      console.error('[CompanySelector] Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoading, userCompanies.length, selectedCompany]);

  useEffect(() => {
    fetchUserCompanies();
  }, [fetchUserCompanies]);

  // Load selected company from localStorage on mount
  useEffect(() => {
    const loadStoredCompany = () => {
      try {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
          const company = JSON.parse(storedCompany);
          console.log('[CompanySelector] Loading stored company:', company.nome);
          setSelectedCompany(company);
        }
      } catch (error) {
        console.error('[CompanySelector] Error loading stored company:', error);
      }
    };

    loadStoredCompany();
  }, []);

  const handleCompanyChange = useCallback((company: Company) => {
    console.log('[CompanySelector] Company selection changed to:', company.nome);
    
    setSelectedCompany(company);
    
    // Store in localStorage
    localStorage.setItem('selectedCompanyId', company.id);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    
    // Dispatch multiple events to ensure all components are notified
    console.log('[CompanySelector] Dispatching company selection events');
    
    // Event for company selection
    const selectEvent = new CustomEvent('company-selected', { 
      detail: { userId: user?.id, company } 
    });
    window.dispatchEvent(selectEvent);
    
    // Event for company change (broader notification)
    const changeEvent = new CustomEvent('company-changed', { 
      detail: { company, companyId: company.id } 
    });
    window.dispatchEvent(changeEvent);
    
    // Event for force reload of company-dependent content
    const reloadEvent = new CustomEvent('company-content-reload', { 
      detail: { company } 
    });
    window.dispatchEvent(reloadEvent);
    
    console.log('[CompanySelector] All events dispatched for company:', company.nome);
  }, [user?.id]);

  const displayName = selectedCompany?.nome || "merinno";

  if (isLoading) {
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  if (!user || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-foreground">merinno</span>;
  }

  if (userCompanies.length === 1) {
    return <span className="text-lg font-bold text-foreground">{displayName}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-foreground focus:outline-none">
          {displayName}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {userCompanies.map((company) => (
          <DropdownMenuItem 
            key={company.id} 
            onClick={() => handleCompanyChange(company)}
            className={`cursor-pointer ${selectedCompany?.id === company.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <div className="flex items-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.nome}
                  className="h-4 w-4 mr-2 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.onerror = null;
                  }}
                />
              ) : (
                <div className="h-4 w-4 mr-2 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                  {company.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{company.nome}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CompanySelector.displayName = 'CompanySelector';
