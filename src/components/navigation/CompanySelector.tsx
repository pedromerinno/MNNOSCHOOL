
import { useEffect, useState } from "react";
import { ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies,
    error,
    fetchCount
  } = useCompanies();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorType, setErrorType] = useState<'resource' | 'connection' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Detectar quando há erro e classificá-lo
  useEffect(() => {
    if (error) {
      if (error.message?.includes('insufficient') || error.message?.includes('resource')) {
        setErrorType('resource');
      } else {
        setErrorType('connection');
      }
    } else {
      setErrorType(null);
    }
  }, [error]);

  // Handle manual refresh when connection issues occur
  const handleManualRefresh = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    
    toast.info('Atualizando lista de empresas...', {
      description: 'Tentando reconectar ao servidor'
    });
    
    try {
      await forceGetUserCompanies(user.id);
      toast.success('Lista de empresas atualizada com sucesso!');
      setErrorType(null);
    } catch (err) {
      toast.error('Não foi possível atualizar a lista de empresas', {
        description: 'Aguarde um momento e tente novamente'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCompanyChange = (company) => {
    if (company && user?.id) {
      // Don't perform change if already on the same company
      if (selectedCompany?.id === company.id) {
        console.log('CompanySelector: Already on company:', company.nome);
        setDropdownOpen(false); // Close the dropdown
        return;
      }
      
      console.log('CompanySelector: Mudando para empresa:', company.nome);
      
      // Close dropdown first
      setDropdownOpen(false);
      
      // IMPORTANTE: Forçar um limpar do state antes da seleção
      window.dispatchEvent(new Event('company-changing'));
      
      // Mostrar loading imediatamente
      toast.info(`Carregando empresa ${company.nome}...`, {
        id: "company-loading",
        duration: 3000
      });
      
      // Pequeno atraso para seleção
      setTimeout(() => {
        selectCompany(user.id, company);
      }, 100);
    }
  };

  // If there are resource errors, show special message
  if (errorType === 'resource') {
    return (
      <div className="flex items-center">
        <span className="text-lg font-bold text-merinno-dark mr-2">merinno</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-amber-500"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="sr-only">Tentar novamente</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Servidor sobrecarregado. Aguarde ou clique para tentar novamente.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // If there are connection errors, show retry button
  if (errorType === 'connection' && (!userCompanies || userCompanies.length === 0)) {
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
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
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
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-merinno-dark focus:outline-none">
          {isLoading && fetchCount <= 1 ? (
            <>
              <span>Carregando...</span>
              <Spinner className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              {selectedCompany?.nome || userCompanies[0]?.nome || "merinno"}
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {Array.isArray(userCompanies) && userCompanies.map((company) => (
          <DropdownMenuItem 
            key={company.id} 
            onClick={() => handleCompanyChange(company)}
            className="cursor-pointer"
            disabled={isRefreshing || isLoading}
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
        
        {/* Add refresh option if we have companies */}
        <DropdownMenuItem 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="cursor-pointer border-t mt-1 pt-1"
        >
          <div className="flex items-center text-gray-500">
            {isRefreshing ? (
              <Spinner className="h-4 w-4 mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            <span>Atualizar lista</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
