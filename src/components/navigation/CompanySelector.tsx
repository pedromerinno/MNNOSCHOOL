
import { useEffect } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies,
    error
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

  // Listen for company-relation-changed events
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        console.log('CompanySelector: Detected company relation change, refreshing data');
        await forceGetUserCompanies(user.id);
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [user, forceGetUserCompanies]);

  // Handle manual refresh when connection issues occur
  const handleManualRefresh = async () => {
    if (user?.id) {
      toast.info('Atualizando lista de empresas...', {
        description: 'Tentando reconectar ao servidor'
      });
      try {
        await forceGetUserCompanies(user.id);
        toast.success('Lista de empresas atualizada com sucesso!');
      } catch (err) {
        toast.error('Não foi possível atualizar a lista de empresas', {
          description: 'Verifique sua conexão com a internet e tente novamente'
        });
      }
    }
  };

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

  // If there are connection errors, show retry button
  if (error && (!userCompanies || userCompanies.length === 0)) {
    return (
      <div className="flex items-center">
        <span className="text-lg font-bold text-merinno-dark mr-2">merinno</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-yellow-500"
              onClick={handleManualRefresh}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="sr-only">Reconectar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Problemas de conexão. Clique para tentar novamente.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // If user has no companies or is not logged in, show default text
  if (!user || !userCompanies || userCompanies.length === 0) {
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
        {Array.isArray(userCompanies) && userCompanies.map((company) => (
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
                  className="h-4 w-4 mr-2 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.onerror = null;
                  }}
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
