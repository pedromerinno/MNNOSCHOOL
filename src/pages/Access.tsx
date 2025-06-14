
import { useCompanies } from "@/hooks/useCompanies";
import { useAccessItems } from "@/hooks/useAccessItems";
import { LoadingState } from "@/components/access/LoadingState";
import { EmptyState } from "@/components/access/EmptyState";
import { AccessDescription } from "@/components/access/AccessDescription";
import { AccessTabs } from "@/components/access/AccessTabs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Access = () => {
  const { selectedCompany, user } = useCompanies();
  const { accessItems, isLoading, hasPermission, refetch } = useAccessItems({
    companyId: selectedCompany?.id,
    userId: user?.id
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Senhas e Acessos</h1>
          </div>
          <EmptyState 
            title="Selecione uma empresa"
            description="Selecione uma empresa no menu superior para visualizar os acessos cadastrados."
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!hasPermission) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Senhas e Acessos</h1>
          </div>
          <EmptyState 
            title="Acesso não autorizado"
            description={`Você não tem permissão para visualizar os acessos da empresa ${selectedCompany.nome}. Entre em contato com o administrador.`}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Senhas e Acessos</h1>
        </div>
        <AccessDescription companyName={selectedCompany.nome} />
        <AccessTabs 
          companyAccessItems={accessItems}
          companyColor={selectedCompany.cor_principal}
          onAccessUpdated={refetch}
        />
      </div>
    </DashboardLayout>
  );
};

export default Access;
