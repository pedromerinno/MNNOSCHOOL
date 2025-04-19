import { useState, useEffect, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccessList } from "@/components/access/AccessList";
import { AccessDetails } from "@/components/access/AccessDetails";
import { LoadingState } from "@/components/access/LoadingState";
import { EmptyState } from "@/components/access/EmptyState";
import { AccessItem } from "@/components/access/types";
import { PageLayout } from "@/components/layout/PageLayout";

const Access = () => {
  const { selectedCompany, user } = useCompanies();
  const [accessItems, setAccessItems] = useState<AccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccess, setSelectedAccess] = useState<AccessItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [requestInProgress, setRequestInProgress] = useState(false);
  
  const lastSelectedCompanyIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchAccessItems = async () => {
      if (!selectedCompany || !user) {
        setAccessItems([]);
        setIsLoading(false);
        return;
      }
      
      if (lastSelectedCompanyIdRef.current === selectedCompany.id) {
        console.log('Already fetched data for this company, skipping duplicate fetch');
        return;
      }

      if (requestInProgress) {
        console.log('Request already in progress, skipping duplicate fetch');
        return;
      }

      setIsLoading(true);
      setHasPermission(true);
      setRequestInProgress(true);

      try {
        console.log('Fetching access items for company:', selectedCompany.id, 'User ID:', user.id);
        
        const { data, error } = await supabase
          .from('company_access')
          .select('*')
          .eq('company_id', selectedCompany.id)
          .order('tool_name');
        
        if (error) {
          if (error.code === '42501' || error.message.includes('policy')) {
            console.log('Acesso negado pela política RLS:', error.message);
            setHasPermission(false);
            setAccessItems([]);
          } else {
            console.error('Erro ao buscar itens de acesso:', error);
            throw error;
          }
        } else {
          console.log('Itens de acesso encontrados:', data?.length);
          setAccessItems(data as AccessItem[] || []);
          lastSelectedCompanyIdRef.current = selectedCompany.id;
        }
      } catch (error: any) {
        console.error('Erro ao carregar informações de acesso:', error);
        toast.error('Não foi possível carregar os dados de acesso');
        setAccessItems([]);
      } finally {
        setIsLoading(false);
        setRequestInProgress(false);
      }
    };

    fetchAccessItems();
    
    return () => {
      if (requestInProgress) {
        setRequestInProgress(false);
      }
    };
  }, [selectedCompany, user, requestInProgress]);

  const openAccessDetails = (access: AccessItem) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!selectedCompany) {
    return (
      <PageLayout title="Acessos">
        <EmptyState 
          title="Selecione uma empresa"
          description="Selecione uma empresa no menu superior para visualizar os acessos cadastrados."
        />
      </PageLayout>
    );
  }

  if (!hasPermission) {
    return (
      <PageLayout title="Acessos">
        <EmptyState 
          title="Acesso não autorizado"
          description={`Você não tem permissão para visualizar os acessos da empresa ${selectedCompany.nome}. Entre em contato com o administrador.`}
        />
      </PageLayout>
    );
  }

  if (accessItems.length === 0) {
    return (
      <PageLayout title="Acessos">
        <EmptyState 
          title="Nenhum acesso cadastrado"
          description={`Não há informações de acesso cadastradas para ${selectedCompany.nome}. Peça ao administrador para adicionar os acessos necessários.`}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Acessos">
      <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 mb-6">
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
          Aqui estão todos os acessos às ferramentas e plataformas utilizadas pela empresa {selectedCompany?.nome}. 
          Clique em um card para visualizar as informações completas.
        </p>
      </div>
        
      <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
        <AccessList 
          items={accessItems}
          onSelectAccess={openAccessDetails}
          companyColor={selectedCompany?.cor_principal}
        />
      </div>

      <AccessDetails 
        access={selectedAccess}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        companyColor={selectedCompany?.cor_principal}
      />
    </PageLayout>
  );
};

export default Access;
