
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
  const { getUserCompanies, getUserCompany, updateUserSelectedCompany } = useCompanies();
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
          
          // If there are companies, get the current one
          if (companies.length > 0) {
            const currentCompanyResult = await getUserCompany(user.id);
            
            // If no selected company yet, use the first company as default
            if (!currentCompanyResult.company && companies.length > 0) {
              // Set the first company as selected
              await updateUserSelectedCompany(user.id, companies[0].id);
              setSelectedCompany(companies[0]);
              
              // Dispatch event to inform other components
              const navEvent = new CustomEvent('company-selected', { 
                detail: { userId: user.id, companyId: companies[0].id } 
              });
              window.dispatchEvent(navEvent);
            } else {
              setSelectedCompany(currentCompanyResult.company);
            }
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
  }, [user, getUserCompanies, getUserCompany, updateUserSelectedCompany]);

  // Listen for company selection events from UserNavigation
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { userId, companyId } = event.detail;
      
      if (userId && companyId && user?.id === userId) {
        const selectedComp = userCompanies.find(c => c.id === companyId);
        if (selectedComp) {
          console.log('CompanySelector: Company selection event received', selectedComp.nome);
          setSelectedCompany(selectedComp);
        }
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [userCompanies, user]);

  const handleCompanyChange = async (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      try {
        // Don't update UI until we've successfully updated the backend
        setLoading(true);
        
        // Update the selected company in the database
        await updateUserSelectedCompany(user.id, company.id);
        
        // Update the local state
        setSelectedCompany(company);
        
        // Dispatch event to notify other components
        const navEvent = new CustomEvent('company-selected', { 
          detail: { userId: user.id, companyId: company.id } 
        });
        window.dispatchEvent(navEvent);
        
        toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
      } catch (error) {
        console.error('Erro ao selecionar empresa:', error);
        toast.error("Não foi possível selecionar a empresa");
      } finally {
        setLoading(false);
      }
    }
  };

  // Get the default text to display (selected company name or "merinno")
  const getDefaultText = () => {
    return selectedCompany?.nome || "merinno";
  };

  // If user has no companies or is not logged in, show default text
  if (!user || userCompanies.length === 0) {
    return <span className="text-xl font-bold text-merinno-dark">merinno</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-xl font-bold text-merinno-dark focus:outline-none">
          {getDefaultText()}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {userCompanies.map((company) => (
          <DropdownMenuItem 
            key={company.id} 
            onClick={() => handleCompanyChange(company.id)}
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

