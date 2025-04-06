
import { useEffect, useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    getUserCompanies, 
    selectCompany,
    isLoading,
    error 
  } = useCompanies();
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Fetch user companies on component mount
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        console.log('CompanySelector: Fetching user companies');
        await getUserCompanies(user.id);
        setFetchAttempted(true);
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // Debug log to check selected company
  useEffect(() => {
    if (selectedCompany) {
      console.log('CompanySelector: Selected company data:', {
        nome: selectedCompany.nome,
        frase: selectedCompany.frase_institucional
      });
    }
  }, [selectedCompany]);

  const handleCompanyChange = (company) => {
    if (company && user?.id) {
      console.log('CompanySelector: Selecting company:', company.nome);
      console.log('CompanySelector: Company phrase:', company.frase_institucional);
      
      // Certifique-se de que a empresa está completa antes de selecioná-la
      if (!company.frase_institucional) {
        console.log('CompanySelector: Frase institucional não encontrada na empresa selecionada');
      }
      
      selectCompany(user.id, company);
      toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
    }
  };

  const handleRetry = async () => {
    if (user?.id) {
      toast.info("Tentando novamente...");
      await getUserCompanies(user.id);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
        <ChevronDown className="h-4 w-4 text-gray-400 animate-pulse" />
      </div>
    );
  }

  // Show error state with retry button
  if (error && fetchAttempted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleRetry}
        className="text-red-500 hover:text-red-600 flex items-center gap-1 py-1 px-2"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="text-sm">Reconectar</span>
      </Button>
    );
  }

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
