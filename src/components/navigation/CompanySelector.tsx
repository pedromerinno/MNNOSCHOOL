
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
      const { data, error } = await supabase
        .rpc('get_user_companies', { user_id: user.id });

      if (error) throw error;
      
      const companies = data as Company[];
      setUserCompanies(companies);
      
      // Auto-select first company if none selected
      if (companies.length > 0 && !selectedCompany) {
        setSelectedCompany(companies[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoading, userCompanies.length, selectedCompany]);

  useEffect(() => {
    fetchUserCompanies();
  }, [fetchUserCompanies]);

  const handleCompanyChange = useCallback((company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompanyId', company.id);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  }, []);

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
