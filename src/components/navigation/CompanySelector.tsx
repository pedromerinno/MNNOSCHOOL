
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { getUserCompanies } = useCompanies();
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user companies on component mount
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          // Get all companies the user is related to
          const companies = await getUserCompanies(user.id);
          setUserCompanies(companies);
          console.log('CompanySelector: Fetched user companies:', companies.map(c => c.nome).join(', '));
          
          // If there are companies, use the first one as default
          if (companies.length > 0) {
            setSelectedCompany(companies[0]);
            console.log('CompanySelector: Setting default company:', companies[0].nome);
            
            // Dispatch event to inform other components
            const navEvent = new CustomEvent('company-selected', { 
              detail: { userId: user.id, company: companies[0] } 
            });
            window.dispatchEvent(navEvent);
          }
        } catch (error) {
          console.error('Erro ao buscar empresas do usuário:', error);
          toast.error("Não foi possível carregar as empresas");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // Listen for company selection events from UserNavigation
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { userId, company } = event.detail;
      
      if (userId && company && user?.id === userId) {
        console.log('CompanySelector: Setting selected company from event', company.nome);
        setSelectedCompany(company);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [user]);

  const handleCompanyChange = (company: Company) => {
    if (company && user?.id) {
      console.log('CompanySelector: Selecting company:', company.nome);
      
      // Update the local state
      setSelectedCompany(company);
      
      // Dispatch event to notify other components without updating the database
      const navEvent = new CustomEvent('company-selected', { 
        detail: { userId: user.id, company: company } 
      });
      window.dispatchEvent(navEvent);
      
      toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
    }
  };

  // If user has no companies or is not logged in, show default text
  if (!user || userCompanies.length === 0) {
    return <span className="text-xl font-bold text-merinno-dark">merinno</span>;
  }

  // If user has only one company, just show the name without dropdown
  if (userCompanies.length === 1) {
    return <span className="text-xl font-bold text-merinno-dark">{userCompanies[0].nome}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-xl font-bold text-merinno-dark focus:outline-none">
          {selectedCompany?.nome || "merinno"}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {userCompanies.map((company) => (
          <DropdownMenuItem 
            key={company.id} 
            onClick={() => handleCompanyChange(company)}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.nome}
                  className="h-4 w-4 mr-2 object-contain"
                />
              )}
              <span>{company.nome}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
