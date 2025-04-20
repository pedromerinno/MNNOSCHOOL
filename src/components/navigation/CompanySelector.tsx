
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/company";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export const CompanySelector = () => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies
  } = useCompanies();
  
  // Estado local para evitar flickering do nome da empresa
  const [displayName, setDisplayName] = useState<string>("merinno");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Atualiza o nome de exibição imediatamente de cache se disponível
  useEffect(() => {
    // Tenta carregar do cache primeiro para evitar flickering
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      if (cachedCompany) {
        const company = JSON.parse(cachedCompany);
        if (company && company.nome) {
          setDisplayName(company.nome);
          setIsInitialLoad(false);
        }
      }
    } catch (e) {
      console.error('Erro ao ler empresa do cache:', e);
    }
  }, []);

  // Atualiza quando a empresa selecionada mudar
  useEffect(() => {
    if (selectedCompany?.nome) {
      setDisplayName(selectedCompany.nome);
      setIsInitialLoad(false);
    }
  }, [selectedCompany]);

  // Listener para mudanças nas relações de empresa
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

  // Auto-selecionar a primeira empresa se nenhuma for selecionada
  useEffect(() => {
    if (!selectedCompany && userCompanies.length > 0 && user?.id && !isLoading) {
      console.log('CompanySelector: Auto-selecting first company because none is selected yet');
      selectCompany(user.id, userCompanies[0]);
    }
  }, [userCompanies, selectedCompany, user, selectCompany, isLoading]);

  const handleCompanyChange = (company) => {
    if (company && user?.id) {
      if (selectedCompany?.id === company.id) {
        console.log('CompanySelector: Company already selected, skipping change');
        return;
      }
      
      console.log('CompanySelector: Selecionando empresa:', company.nome);
      selectCompany(user.id, company);
      toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
    }
  };

  // Mostrar um skeleton mais compacto durante o carregamento 
  if (isLoading && isInitialLoad) {
    return <Skeleton className="h-6 w-24" />;
  }

  // Se usuário não tiver empresas ou não estiver logado, mostrar texto padrão
  if (!user || !userCompanies || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-merinno-dark">merinno</span>;
  }

  // Se usuário tiver apenas uma empresa, apenas mostrar o nome sem dropdown
  if (userCompanies.length === 1) {
    return <span className="text-lg font-bold text-merinno-dark">{displayName}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-lg font-bold text-merinno-dark focus:outline-none">
          {displayName}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 z-50">
        {Array.isArray(userCompanies) && userCompanies.map((company) => (
          <DropdownMenuItem 
            key={company.id} 
            onClick={() => handleCompanyChange(company)}
            className={`cursor-pointer ${selectedCompany?.id === company.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <div className="flex items-center">
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.nome}
                  className="h-4 w-4 mr-2 object-contain rounded-lg"
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
