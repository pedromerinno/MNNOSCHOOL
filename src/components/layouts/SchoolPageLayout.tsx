import React, { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";

interface SchoolPageLayoutProps {
  /**
   * Conteúdo do sidebar (componente de sidebar customizado)
   */
  sidebar: ReactNode;
  
  /**
   * Conteúdo principal da página
   */
  children: ReactNode;
  
  /**
   * Se o sidebar deve estar aberto por padrão
   * @default true
   */
  defaultSidebarOpen?: boolean;
  
  /**
   * Padding customizado para a área de conteúdo
   * @default "p-4 lg:p-8"
   */
  contentPadding?: string;
  
  /**
   * Margin customizada para a área de conteúdo
   * @default "!m-4 lg:!m-8"
   */
  contentMargin?: string;
  
  /**
   * Classe CSS adicional para a área de conteúdo
   */
  contentClassName?: string;
  
  /**
   * Se deve incluir o MainNavigationMenu no topo
   * @default true
   */
  showNavigation?: boolean;
}

/**
 * Layout padrão para páginas da escola com sidebar e área de conteúdo
 * 
 * Este componente fornece uma estrutura consistente para páginas que precisam
 * de um sidebar e uma área de conteúdo principal. Ele inclui:
 * - MainNavigationMenu no topo (opcional)
 * - SidebarProvider para gerenciar estado do sidebar
 * - SidebarInset para a área de conteúdo com scroll
 * - ErrorBoundary para tratamento de erros
 * 
 * @example
 * ```tsx
 * // Exemplo básico com sidebar customizado
 * import { SchoolPageLayout, SchoolPageContent } from '@/components/layouts/SchoolPageLayout';
 * import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
 * 
 * const MyPage = () => {
 *   const sidebar = (
 *     <Sidebar variant="inset">
 *       <SidebarContent>
 *         <div>Menu do sidebar</div>
 *       </SidebarContent>
 *     </Sidebar>
 *   );
 * 
 *   return (
 *     <SchoolPageLayout sidebar={sidebar}>
 *       <SchoolPageContent>
 *         <h1>Conteúdo da página</h1>
 *       </SchoolPageContent>
 *     </SchoolPageLayout>
 *   );
 * };
 * ```
 * 
 * @example
 * ```tsx
 * // Exemplo com configurações customizadas
 * <SchoolPageLayout
 *   sidebar={<MyCustomSidebar />}
 *   contentPadding="p-6"
 *   contentMargin="!m-2"
 *   defaultSidebarOpen={false}
 *   showNavigation={false}
 * >
 *   <SchoolPageContent maxWidth="max-w-[1200px]">
 *     <div>Conteúdo customizado</div>
 *   </SchoolPageContent>
 * </SchoolPageLayout>
 * ```
 */
export const SchoolPageLayout: React.FC<SchoolPageLayoutProps> = ({
  sidebar,
  children,
  defaultSidebarOpen = true,
  contentPadding = "p-4 lg:p-8",
  contentMargin = "!m-4 lg:!m-8",
  contentClassName = "",
  showNavigation = true,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
      {showNavigation && <MainNavigationMenu />}
      <div className="flex-1 flex overflow-hidden">
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          <div className="flex w-full h-full">
            {sidebar}
            <SidebarInset 
              className={`flex-1 bg-background min-h-0 overflow-y-auto ${contentMargin} ${contentPadding} ${contentClassName}`}
            >
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

/**
 * Componente wrapper padrão para conteúdo de páginas
 * Fornece um container consistente com largura máxima e centralização
 */
export const SchoolPageContent: React.FC<{ 
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}> = ({ 
  children, 
  maxWidth = "max-w-[1600px]",
  className = "" 
}) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto ${className}`}>
      {children}
    </div>
  );
};

