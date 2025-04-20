
import { useEffect, useState, memo, useCallback } from "react";
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

// Usar memo para evitar renderizações desnecessárias
export const CompanySelector = memo(() => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies
  } = useCompanies();
  
  // Estado local para nome da empresa com inicialização imediata de cache
  const [displayName, setDisplayName] = useState<string>(() => {
    try {
      const cachedCompany = localStorage.getItem('selectedCompany');
      if (cachedCompany) {
        const company = JSON.parse(cachedCompany);
        return company?.nome || "merinno";
      }
    } catch (e) {}
    return "merinno";
  });
  
  // Atualizar o nome da empresa quando mudar a seleção
  useEffect(() => {
    if (selectedCompany?.nome) {
      setDisplayName(selectedCompany.nome);
    }
  }, [selectedCompany]);

  // Listener para mudanças nas relações de empresa - usando useCallback para evitar recriações
  const handleCompanyRelationChange = useCallback(async () => {
    if (user?.id) {
      console.log('CompanySelector: Detectada mudança na relação de empresa, atualizando dados');
      await forceGetUserCompanies(user.id);
    }
  }, [user, forceGetUserCompanies]);
  
  // Configurar ouvinte de eventos apenas uma vez
  useEffect(() => {
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [handleCompanyRelationChange]);

  // Removido o auto-select da primeira empresa para evitar resetar a seleção durante navegação

  const handleCompanyChange = useCallback((company) => {
    if (!company || !user?.id) return;
    
    if (selectedCompany?.id === company.id) {
      console.log('CompanySelector: Empresa já selecionada, pulando mudança');
      return;
    }
    
    // Verificar se o usuário tem acesso a esta empresa
    const hasAccess = userCompanies.some(c => c.id === company.id);
    if (!hasAccess) {
      console.error('CompanySelector: Usuário não tem acesso a esta empresa:', company.nome);
      toast.error(`Você não tem acesso à empresa ${company.nome}`);
      return;
    }
    
    console.log('CompanySelector: Selecionando empresa:', company.nome);
    selectCompany(user.id, company);
    toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
  }, [user?.id, selectedCompany?.id, selectCompany, userCompanies]);

  // Mostrar apenas o nome durante carregamento, sem skeleton
  if (isLoading && !selectedCompany) {
    return <span className="text-lg font-bold text-merinno-dark">{displayName}</span>;
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
});

// Definir displayName para melhorar depuração
CompanySelector.displayName = 'CompanySelector';
