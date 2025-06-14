
import { useCompanies } from "@/hooks/useCompanies";
import { useAccessItems } from "@/hooks/useAccessItems";
import { LoadingState } from "@/components/access/LoadingState";
import { EmptyState } from "@/components/access/EmptyState";
import { AccessDescription } from "@/components/access/AccessDescription";
import { AccessTabs } from "@/components/access/AccessTabs";
import { PageLayout } from "@/components/layout/PageLayout";

const Access = () => {
  const { selectedCompany, user } = useCompanies();
  const { accessItems, isLoading, hasPermission } = useAccessItems({
    companyId: selectedCompany?.id,
    userId: user?.id
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!selectedCompany) {
    return (
      <PageLayout title="Senhas e Acessos">
        <EmptyState 
          title="Selecione uma empresa"
          description="Selecione uma empresa no menu superior para visualizar os acessos cadastrados."
        />
      </PageLayout>
    );
  }

  if (!hasPermission) {
    return (
      <PageLayout title="Senhas e Acessos">
        <EmptyState 
          title="Acesso não autorizado"
          description={`Você não tem permissão para visualizar os acessos da empresa ${selectedCompany.nome}. Entre em contato com o administrador.`}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Senhas e Acessos">
      <AccessDescription companyName={selectedCompany.nome} />
      <AccessTabs 
        companyAccessItems={accessItems}
        companyColor={selectedCompany.cor_principal}
      />
    </PageLayout>
  );
};

export default Access;
