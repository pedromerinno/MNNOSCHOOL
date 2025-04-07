
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
  } = useCompanies();

  // Debug log to check selected company
  useEffect(() => {
    if (selectedCompany) {
      console.log('CompanySelector: Empresa selecionada:', {
        nome: selectedCompany.nome,
        frase: selectedCompany.frase_institucional
      });
    }
  }, [selectedCompany]);

  const handleCompanyChange = (company) => {
    if (company && user?.id) {
      console.log('CompanySelector: Selecionando empresa:', company.nome);
      
      // Certifique-se de que a empresa está completa antes de selecioná-la
      if (!company.frase_institucional) {
        console.log('CompanySelector: Frase institucional não encontrada na empresa selecionada');
      }
      
      selectCompany(user.id, company);
      toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
    }
  };

  // If user has no companies or is not logged in, show default text
  if (!user || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-merinno-dark">merinno</span>;
  }

  // If user has only one company, just show the name without dropdown
  if (userCompanies.length === 1) {
    return <span className="text-lg font-bold text-merinno-dark">{userCompanies[0].nome}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-merinno-dark focus:outline-none">
          {selectedCompany?.nome || userCompanies[0]?.nome || "merinno"}
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
