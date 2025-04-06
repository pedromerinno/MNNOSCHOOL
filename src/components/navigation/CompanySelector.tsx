
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { getUserCompanies, getUserCompany } = useCompanies();
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
            setSelectedCompany(currentCompanyResult.company);
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
  }, [user, getUserCompanies, getUserCompany]);

  const handleCompanyChange = async (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      try {
        // Update the selected company in UserNavigation.tsx
        // This will trigger a page reload
        const navEvent = new CustomEvent('company-selected', { 
          detail: { userId: user.id, companyId: company.id } 
        });
        window.dispatchEvent(navEvent);
      } catch (error) {
        console.error('Erro ao selecionar empresa:', error);
        toast.error("Não foi possível selecionar a empresa");
      }
    }
  };

  // Get the default text to display (first company name or "merinno")
  const getDefaultText = () => {
    if (userCompanies.length > 0 && userCompanies[0].nome) {
      return userCompanies[0].nome;
    }
    return "merinno";
  };

  // If user has no companies or is not logged in, show default text
  if (!user || userCompanies.length === 0) {
    return <span className="text-xl font-bold text-merinno-dark">merinno</span>;
  }

  return (
    <div className="flex items-center">
      <Select 
        disabled={loading} 
        value={selectedCompany?.id}
        onValueChange={handleCompanyChange}
      >
        <SelectTrigger 
          className="border-none bg-transparent focus:ring-0 text-xl font-bold text-merinno-dark pl-0 min-w-[120px]"
        >
          <div className="flex items-center">
            <SelectValue placeholder={getDefaultText()}>
              {selectedCompany?.nome || getDefaultText()}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {userCompanies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
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
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
