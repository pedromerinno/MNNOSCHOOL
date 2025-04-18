
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccessList } from "@/components/access/AccessList";
import { AccessDetails } from "@/components/access/AccessDetails";
import { LoadingState } from "@/components/access/LoadingState";
import { EmptyState } from "@/components/access/EmptyState";
import { AccessItem } from "@/components/access/types";

const Access = () => {
  const { selectedCompany, user } = useCompanies();
  const [accessItems, setAccessItems] = useState<AccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccess, setSelectedAccess] = useState<AccessItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAccessItems = async () => {
      if (!selectedCompany || !user) {
        setAccessItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching access items for company:', selectedCompany.id);
        
        // First check if user is associated with this company
        const { data: userCompanyRelation, error: relationError } = await supabase
          .from('user_empresa')
          .select('*')
          .eq('user_id', user.id)
          .eq('empresa_id', selectedCompany.id)
          .maybeSingle();
        
        if (relationError) {
          console.error('Error checking user-company relation:', relationError);
          throw relationError;
        }
        
        // If user is related to this company, fetch access items
        if (userCompanyRelation) {
          console.log('User is related to company, fetching access items');
          const { data, error } = await supabase
            .from('company_access')
            .select('*')
            .eq('company_id', selectedCompany.id)
            .order('tool_name');
          
          if (error) throw error;
          
          console.log('Access items fetched:', data?.length);
          setAccessItems(data as AccessItem[] || []);
        } else {
          console.log('User does not have permission to view accesses for this company');
          setAccessItems([]);
        }
      } catch (error: any) {
        console.error('Erro ao carregar informações de acesso:', error);
        toast.error('Não foi possível carregar os dados de acesso');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessItems();
  }, [selectedCompany, user]);

  const openAccessDetails = (access: AccessItem) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            title="Selecione uma empresa"
            description="Selecione uma empresa no menu superior para visualizar os acessos cadastrados."
          />
        </main>
      </div>
    );
  }

  if (accessItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Acessos</h1>
          <EmptyState 
            title="Nenhum acesso cadastrado"
            description={`Não há informações de acesso cadastradas para ${selectedCompany.nome}. Peça ao administrador para adicionar os acessos necessários.`}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Acessos</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Aqui estão todos os acessos às ferramentas e plataformas utilizadas pela empresa {selectedCompany.nome}.
          Clique em um card para visualizar as informações completas.
        </p>
        
        <AccessList 
          items={accessItems}
          onSelectAccess={openAccessDetails}
          companyColor={selectedCompany.cor_principal}
        />

        <AccessDetails 
          access={selectedAccess}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          companyColor={selectedCompany.cor_principal}
        />
      </main>
    </div>
  );
};

export default Access;
