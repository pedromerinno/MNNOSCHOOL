import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useAccessItems } from "@/hooks/useAccessItems";
import { usePersonalAccessCount } from "@/hooks/usePersonalAccessCount";
import { EmptyState } from "@/components/access/EmptyState";
import { AccessDescription } from "@/components/access/AccessDescription";
import { AccessContent } from "@/components/access/AccessContent";
import { UserAccessManagement } from "@/components/access/UserAccessManagement";
import { AccessStatsCards } from "@/components/access/AccessStatsCards";
import { IntegrationStylePage, IntegrationSection } from "@/components/integration/layout/IntegrationStylePage";
import { InteractiveCard } from "@/components/integration/InteractiveCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Table as TableIcon, ArrowLeft } from "lucide-react";
import { Share2, User } from "lucide-react";
import { Preloader } from "@/components/ui/Preloader";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Access = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedCompany, isLoading } = useCompanies();
  const { accessItems, isLoading: isLoadingAccess, hasPermission, refetch } = useAccessItems({
    companyId: selectedCompany?.id,
    userId: user?.id
  });
  const { count: personalAccessCount, isLoading: isLoadingPersonalCount } = usePersonalAccessCount();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Mostrar preloader apenas durante carregamento crítico (auth e empresa)
  // Não bloquear por queries de dados que podem ser carregados progressivamente
  if (authLoading || !user || !userProfile || isLoading) {
    return <Preloader />;
  }

  const companyColor = selectedCompany?.cor_principal || '#1EAEDB';

  // Caso: Sem empresa selecionada
  if (!selectedCompany) {
    return (
      <IntegrationStylePage
        title="Senhas e Acessos"
        sections={[]}
        showSidebar={false}
        backPath="/"
      >
        <IntegrationSection
          id="empty"
          withCard={true}
          delay={0.1}
        >
          <EmptyState 
            title="Selecione uma empresa"
            description="Selecione uma empresa no menu superior para visualizar os acessos cadastrados."
          />
        </IntegrationSection>
      </IntegrationStylePage>
    );
  }

  // Caso: Com empresa - Página completa (sempre permitir acesso, mesmo sem permissão para compartilhadas)
  // Seções para a sidebar - sempre mostrar as duas seções, mesmo sem permissão
  const sections = [
    { id: 'shared', label: 'Senhas Compartilhadas', icon: Share2 },
    { id: 'personal', label: 'Minhas Senhas', icon: User },
  ];

  const heroSection = (
    <>
      <InteractiveCard 
        companyColor={companyColor}
        hoverEffect={false}
        borderBeam={false}
        className="p-6 lg:p-8 mb-6"
      >
        <AccessDescription companyName={selectedCompany.nome} />
      </InteractiveCard>
      <AccessStatsCards
        sharedCount={accessItems.length}
        personalCount={personalAccessCount}
        companyColor={companyColor}
        isLoadingShared={isLoadingAccess}
        isLoadingPersonal={isLoadingPersonalCount}
      />
    </>
  );

  return (
    <IntegrationStylePage
      title="Senhas e Acessos"
      sections={sections}
      backPath="/"
      showSidebar={true}
      showCompanyBadge={true}
      customHeader={
        <>
          <div className="flex items-center justify-between w-full mb-8 lg:mb-12">
            <div className="flex items-center gap-3 lg:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-5 lg:h-5 lg:w-5 text-gray-500 dark:text-gray-400" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white tracking-tight">
                Senhas e Acessos
              </h1>
              {selectedCompany && (
                <CompanyThemedBadge variant="beta">
                  {selectedCompany.nome}
                </CompanyThemedBadge>
              )}
            </div>
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as 'card' | 'table')}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-1"
            >
              <ToggleGroupItem 
                value="card" 
                aria-label="Visualização em cards"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cards
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="table" 
                aria-label="Visualização em tabela"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Tabela
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {heroSection}
        </>
      }
      heroSection={heroSection}
    >
      {/* Seção: Senhas Compartilhadas - apenas se tiver permissão */}
      {hasPermission && (
        <IntegrationSection
          id="shared"
          companyColor={companyColor}
          direction="up"
          delay={0.1}
          withCard={true}
          cardBorderBeam={false}
        >
          {isLoadingAccess ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <AccessContent 
              items={accessItems}
              companyColor={companyColor}
              onAccessUpdated={refetch}
              viewMode={viewMode}
            />
          )}
        </IntegrationSection>
      )}

      {/* Mensagem quando não há senhas compartilhadas (sem revelar se é por falta de permissão) */}
      {!hasPermission && (
        <IntegrationSection
          id="shared"
          companyColor={companyColor}
          direction="up"
          delay={0.1}
          withCard={true}
          cardBorderBeam={false}
        >
          <EmptyState 
            title="Nenhum acesso compartilhado"
            description="Nenhum acesso compartilhado foi cadastrado pela empresa ainda."
          />
        </IntegrationSection>
      )}

      {/* Seção: Minhas Senhas - sempre disponível */}
      <IntegrationSection
        id="personal"
        companyColor={companyColor}
        direction="up"
        delay={0.15}
        withCard={true}
        cardBorderBeam={false}
      >
        <UserAccessManagement companyColor={companyColor} viewMode={viewMode} />
      </IntegrationSection>
    </IntegrationStylePage>
  );
};

export default Access;
