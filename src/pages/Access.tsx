
import { useNavigate } from 'react-router-dom';
import { useCompanies } from "@/hooks/useCompanies";
import { useAccessItems } from "@/hooks/useAccessItems";
import { LoadingState } from "@/components/access/LoadingState";
import { EmptyState } from "@/components/access/EmptyState";
import { AccessDescription } from "@/components/access/AccessDescription";
import { AccessTabs } from "@/components/access/AccessTabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";
import { PagePreloader } from "@/components/ui/PagePreloader";

const Access = () => {
  const navigate = useNavigate();
  const { selectedCompany, user, isLoading } = useCompanies();
  const { accessItems, isLoading: isLoadingAccess, hasPermission, refetch } = useAccessItems({
    companyId: selectedCompany?.id,
    userId: user?.id
  });

  if (isLoading || isLoadingAccess) {
    return <PagePreloader />;
  }

  if (!selectedCompany) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
          <main className="container mx-auto px-6 py-12">
            <div className="flex items-center mb-12 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold dark:text-white">
                  Senhas e Acessos
                </h1>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
              <EmptyState 
                title="Selecione uma empresa"
                description="Selecione uma empresa no menu superior para visualizar os acessos cadastrados."
              />
            </div>
          </main>
          <AdminFloatingActionButton />
        </div>
      </>
    );
  }

  if (!hasPermission) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
          <main className="container mx-auto px-6 py-12">
            <div className="flex items-center mb-12 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold dark:text-white">
                  Senhas e Acessos
                </h1>
                <CompanyThemedBadge variant="beta">
                  {selectedCompany.nome}
                </CompanyThemedBadge>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
              <EmptyState 
                title="Acesso não autorizado"
                description={`Você não tem permissão para visualizar os acessos da empresa ${selectedCompany.nome}. Entre em contato com o administrador.`}
              />
            </div>
          </main>
          <AdminFloatingActionButton />
        </div>
      </>
    );
  }

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <main className="container mx-auto px-6 py-12">
          <div className="flex items-center mb-12 gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold dark:text-white">
                Senhas e Acessos
              </h1>
              <CompanyThemedBadge variant="beta">
                {selectedCompany.nome}
              </CompanyThemedBadge>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
            <AccessDescription companyName={selectedCompany.nome} />
            <AccessTabs 
              companyAccessItems={accessItems}
              companyColor={selectedCompany.cor_principal}
              onAccessUpdated={refetch}
            />
          </div>
        </main>
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

export default Access;
