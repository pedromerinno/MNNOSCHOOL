import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { CompanyThemedBadge } from '@/components/ui/badge';
import { MainNavigationMenu } from '@/components/navigation/MainNavigationMenu';
import { AdminFloatingActionButton } from '@/components/admin/AdminFloatingActionButton';
import { Footer } from '@/components/home/Footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { IntegrationSidebar } from '@/components/integration/IntegrationSidebar';
import { ScrollSection } from '@/components/integration/ScrollSection';
import { InteractiveCard } from '@/components/integration/InteractiveCard';
import { SectionTitle } from '@/components/integration/SectionTitle';
import { Preloader } from '@/components/ui/Preloader';
import { useAuth } from '@/contexts/AuthContext';

export interface PageSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface IntegrationStylePageProps {
  /**
   * Título da página
   */
  title: string;
  
  /**
   * Conteúdo principal da página
   */
  children: ReactNode;
  
  /**
   * Seções para navegação na sidebar
   */
  sections?: PageSection[];
  
  /**
   * Mostrar botão de voltar
   */
  showBackButton?: boolean;
  
  /**
   * Path para voltar (se não especificado, volta para '/')
   */
  backPath?: string;
  
  /**
   * Mostrar badge da empresa
   */
  showCompanyBadge?: boolean;
  
  /**
   * Mostrar sidebar
   */
  showSidebar?: boolean;
  
  /**
   * Mostrar footer
   */
  showFooter?: boolean;
  
  /**
   * Classe CSS adicional para o container principal
   */
  className?: string;
  
  /**
   * Conteúdo customizado do header
   */
  customHeader?: ReactNode;
  
  /**
   * Hero section customizada
   */
  heroSection?: ReactNode;
}

/**
 * Componente de página no estilo da página de integração
 * 
 * Fornece um layout completo e consistente com sidebar, navegação,
 * animações e estilos modernos.
 * 
 * @example
 * ```tsx
 * <IntegrationStylePage
 *   title="Minha Página"
 *   sections={[
 *     { id: 'secao1', label: 'Seção 1', icon: BookOpen },
 *     { id: 'secao2', label: 'Seção 2', icon: Users },
 *   ]}
 * >
 *   <ScrollSection id="secao1">
 *     <InteractiveCard>
 *       Conteúdo da seção 1
 *     </InteractiveCard>
 *   </ScrollSection>
 * </IntegrationStylePage>
 * ```
 */
export const IntegrationStylePage: React.FC<IntegrationStylePageProps> = ({
  title,
  children,
  sections = [],
  showBackButton = true,
  backPath = '/',
  showCompanyBadge = true,
  showSidebar = true,
  showFooter = true,
  className = '',
  customHeader,
  heroSection,
}) => {
  const navigate = useNavigate();
  const { selectedCompany, isLoading } = useCompanies();
  const { user, userProfile, loading: authLoading } = useAuth();

  const companyColor = selectedCompany?.cor_principal || '#1EAEDB';
  
  // Mostrar preloader durante carregamento inicial
  const showPreloader = authLoading || !user || !userProfile || isLoading;

  if (showPreloader) {
    return <Preloader />;
  }

  if (!user) {
    return <Preloader />;
  }

  return (
    <>
      <MainNavigationMenu />
      <div className={`min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col ${className}`}>
        <SidebarProvider 
          defaultOpen={true}
          className="has-[[data-variant=inset]]:!bg-transparent"
        >
          <div className="flex w-full h-full flex-1">
            {showSidebar && (
              <IntegrationSidebar 
                sections={sections || []}
                companyColor={companyColor}
              />
            )}
            <SidebarInset className="flex-1 overflow-y-auto !bg-[#F8F7F4] dark:!bg-[#191919]">
              <main className="w-full max-w-[1400px] mx-auto px-4 lg:px-6">
                {/* Hero Section - Header */}
                {(customHeader || showBackButton || heroSection) && (
                  <ScrollSection
                    id="hero"
                    withPadding={true}
                    className="pt-8 lg:pt-16"
                  >
                    {customHeader ? (
                      customHeader
                    ) : (
                      <>
                        {(showBackButton || title) && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center mb-8 lg:mb-12 gap-3 lg:gap-4"
                          >
                            {showBackButton && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-0 hover:bg-transparent" 
                                onClick={() => navigate(backPath)}
                              >
                                <ArrowLeft className="h-4 w-5 lg:h-5 lg:w-5 text-gray-500 dark:text-gray-400" />
                              </Button>
                            )}
                            {title && (
                              <div className="flex items-center gap-2 lg:gap-3">
                                <h1 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white tracking-tight">
                                  {title}
                                </h1>
                                {showCompanyBadge && selectedCompany && (
                                  <CompanyThemedBadge variant="beta">
                                    {selectedCompany.nome}
                                  </CompanyThemedBadge>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                        {heroSection}
                      </>
                    )}
                  </ScrollSection>
                )}

                {/* Conteúdo principal */}
                {children}
              </main>
              
              {showFooter && <Footer />}
            </SidebarInset>
          </div>
        </SidebarProvider>
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

/**
 * Componente auxiliar para criar seções consistentes
 */
export interface IntegrationSectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  companyColor?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  children: ReactNode;
  withCard?: boolean;
  cardBorderBeam?: boolean;
  className?: string;
}

export const IntegrationSection: React.FC<IntegrationSectionProps> = ({
  id,
  title,
  subtitle,
  companyColor,
  direction = 'up',
  delay = 0.05,
  children,
  withCard = false,
  cardBorderBeam = false,
  className = '',
}) => {
  const { selectedCompany } = useCompanies();
  const finalCompanyColor = companyColor || selectedCompany?.cor_principal || '#1EAEDB';

  return (
    <ScrollSection
      id={id}
      direction={direction}
      delay={delay}
      companyColor={finalCompanyColor}
      className={className}
    >
      {title && (
        <SectionTitle
          title={title}
          subtitle={subtitle}
          companyColor={finalCompanyColor}
        />
      )}
      {withCard ? (
        <InteractiveCard 
          companyColor={finalCompanyColor}
          hoverEffect={false}
          borderBeam={cardBorderBeam}
          delay={delay}
          className="p-6 lg:p-8"
        >
          {children}
        </InteractiveCard>
      ) : (
        children
      )}
    </ScrollSection>
  );
};

// Re-exportar componentes relacionados para facilitar o uso
export { ScrollSection, InteractiveCard, SectionTitle };

