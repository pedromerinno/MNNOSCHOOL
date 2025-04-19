import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchAccessItems = async () => {
      if (!selectedCompany || !user) {
        setAccessItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasPermission(true);

      try {
        console.log('Fetching access items for company:', selectedCompany.id, 'User ID:', user.id);
        
        // Buscar os itens de acesso diretamente - a política RLS cuidará das permissões
        const { data, error } = await supabase
          .from('company_access')
          .select('*')
          .eq('company_id', selectedCompany.id)
          .order('tool_name');
        
        if (error) {
          // Se for um erro de permissão (violating row-level security), isso significa
          // que o usuário não tem permissão para ver os dados desta empresa
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
        }
      } catch (error: any) {
        console.error('Erro ao carregar informações de acesso:', error);
        toast.error('Não foi possível carregar os dados de acesso');
        setAccessItems([]);
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

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Acessos</h1>
          <EmptyState 
            title="Acesso não autorizado"
            description={`Você não tem permissão para visualizar os acessos da empresa ${selectedCompany.nome}. Entre em contato com o administrador.`}
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
    <PageLayout title="Acessos">
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Aqui estão todos os acessos às ferramentas e plataformas utilizadas pela empresa {selectedCompany?.nome}.
        Clique em um card para visualizar as informações completas.
      </p>
        
      <AccessList 
        items={accessItems}
        onSelectAccess={openAccessDetails}
        companyColor={selectedCompany?.cor_principal}
      />

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
