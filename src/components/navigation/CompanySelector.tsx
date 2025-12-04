import { useEffect, memo, useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import {
  Workspaces,
  WorkspaceTrigger,
  WorkspaceContent,
  type Workspace,
} from "@/components/ui/workspaces";
import { cn } from "@/lib/utils";

// Adapter para converter Company em Workspace
interface CompanyWorkspace extends Workspace {
  nome: string;
  logo?: string | null;
  cor_principal?: string | null;
}

export const CompanySelector = memo(() => {
  const { user } = useAuth();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany, 
    isLoading 
  } = useCompanies();
  
  const [displayName, setDisplayName] = useState<string>("");

  // Converter companies para workspaces format
  const workspaces: CompanyWorkspace[] = userCompanies.map((company) => ({
    id: company.id,
    name: company.nome,
    nome: company.nome,
    logo: company.logo,
    cor_principal: company.cor_principal,
  }));

  // Atualizar displayName sempre que selectedCompany mudar
  useEffect(() => {
    if (selectedCompany?.nome) {
      setDisplayName(selectedCompany.nome);
    } else if (userCompanies.length > 0) {
      setDisplayName(userCompanies[0].nome);
    } else {
      // Só mostrar BUSINESS se não há empresas carregadas ainda
      if (!isLoading) {
        setDisplayName("BUSINESS");
      }
    }
  }, [selectedCompany, userCompanies, isLoading]);

  // Função para lidar com mudança de empresa
  const handleCompanyChange = useCallback((workspace: CompanyWorkspace) => {
    if (user?.id && workspace) {
      // Encontrar a company original pelo ID
      const company = userCompanies.find(c => c.id === workspace.id);
      if (company) {
        selectCompany(user.id, company);
        setDisplayName(company.nome);
        
        // Force immediate update of other components
        const event = new CustomEvent('company-selector-changed', { 
          detail: { company } 
        });
        window.dispatchEvent(event);
      }
    }
  }, [user?.id, selectCompany, userCompanies]);

  // Escutar mudanças de empresa vindas de outras partes da aplicação
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company?.nome) {
        setDisplayName(company.nome);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('company-changed', handleCompanyUpdate as EventListener);
    window.addEventListener('company-selected', handleCompanyUpdate as EventListener);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-changed', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-selected', handleCompanyUpdate as EventListener);
    };
  }, []);

  // Durante o loading, não mostrar nada se há empresas para carregar
  if (isLoading) {
    // Se há uma empresa selecionada ou empresas no cache, mostrar o nome
    if (selectedCompany?.nome) {
      return (
        <span className="text-lg font-bold text-foreground">{selectedCompany.nome}</span>
      );
    }
    if (userCompanies.length > 0) {
      return (
        <span className="text-lg font-bold text-foreground">{userCompanies[0].nome}</span>
      );
    }
    // Durante loading inicial, não mostrar nada para evitar o flash de BUSINESS
    return <span className="text-lg font-bold text-foreground"></span>;
  }

  if (!user || userCompanies.length === 0) {
    return <span className="text-lg font-bold text-foreground">BUSINESS</span>;
  }

  if (userCompanies.length === 1) {
    return (
      <span className="text-lg font-bold text-foreground">{displayName}</span>
    );
  }

  // Não renderizar o dropdown se displayName está vazio (evita flash)
  if (!displayName) {
    return <span className="text-lg font-bold text-foreground"></span>;
  }

  return (
    <Workspaces
      workspaces={workspaces}
      selectedWorkspaceId={selectedCompany?.id}
      onWorkspaceChange={handleCompanyChange}
      getWorkspaceId={(ws) => ws.id}
      getWorkspaceName={(ws) => (ws as CompanyWorkspace).nome}
    >
      <WorkspaceTrigger
        className={cn(
          "flex items-center space-x-2 text-lg font-bold text-foreground focus:outline-none border-none bg-transparent shadow-none p-0 h-auto",
          "hover:opacity-80 transition-opacity"
        )}
        renderTrigger={(workspace, isOpen) => (
          <>
            <span>{(workspace as CompanyWorkspace).nome}</span>
            <ChevronDown className={cn(
              "ml-1 h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      />
      <WorkspaceContent
        align="start"
        className="bg-white dark:bg-gray-800 z-50 w-auto min-w-[200px] max-w-[280px] !rounded-2xl"
        title=""
      />
    </Workspaces>
  );
});

CompanySelector.displayName = 'CompanySelector';
