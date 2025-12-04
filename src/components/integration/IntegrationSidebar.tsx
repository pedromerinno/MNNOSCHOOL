import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useCompanies } from '@/hooks/useCompanies';
import { cn, getSafeTextColor } from '@/lib/utils';
import { BookOpen, PlayCircle, BriefcaseBusiness, GraduationCap, Users, Home } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface IntegrationSidebarProps {
  sections: Section[];
  companyColor?: string;
  onSectionClick?: (sectionId: string) => void;
}

export const IntegrationSidebar: React.FC<IntegrationSidebarProps> = ({
  sections,
  companyColor = '#1EAEDB',
  onSectionClick,
}) => {
  const { selectedCompany } = useCompanies();
  const [activeSection, setActiveSection] = useState<string>('hero');
  const finalCompanyColor = selectedCompany?.cor_principal || companyColor;

  // Detectar seção ativa baseada no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset para ativação
      
      // Verificar todas as seções
      const allSections = [{ id: 'hero', label: 'Início', icon: Home }, ...sections];
      
      for (let i = allSections.length - 1; i >= 0; i--) {
        const section = allSections[i];
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Verificar posição inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    // Encontrar o container que tem scroll (SidebarInset)
    let scrollContainer: HTMLElement | null = null;
    let parent: HTMLElement | null = element;
    
    while (parent && parent !== document.body && parent !== document.documentElement) {
      const style = window.getComputedStyle(parent);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && parent.tagName === 'MAIN') {
        scrollContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }
    
    if (!scrollContainer) {
      scrollContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
    }
    
    const offset = 100;
    
    if (scrollContainer) {
      // Usar scrollIntoView suave primeiro para garantir que o elemento esteja visível
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      
      // Depois ajustar o scroll do container com o offset de forma suave
      // Usar um pequeno delay para que o scrollIntoView comece primeiro
      setTimeout(() => {
        const containerRect = scrollContainer!.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const currentScrollTop = scrollContainer!.scrollTop;
        const elementTopRelativeToContainer = elementRect.top - containerRect.top;
        const elementAbsoluteTop = currentScrollTop + elementTopRelativeToContainer;
        const targetScrollTop = elementAbsoluteTop - offset;
        
        // Só ajustar se ainda não estiver na posição correta
        if (Math.abs(scrollContainer!.scrollTop - targetScrollTop) > 10) {
          scrollContainer!.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
          });
        }
      }, 50);
    } else {
      // Fallback
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        window.scrollBy({ top: -offset, behavior: 'smooth' });
      }, 100);
    }

    setActiveSection(sectionId);
    onSectionClick?.(sectionId);
  };

  const allSections = [
    { id: 'hero', label: 'Início', icon: Home },
    ...sections
  ];

  return (
    <>
      <style>{`
        [data-sidebar="sidebar"] {
          background: transparent !important;
        }
      `}</style>
      <Sidebar 
        variant="inset" 
        className="border-r border-sidebar-border bg-transparent [&_[data-sidebar='sidebar']]:!bg-transparent"
      >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Navegação
          </h2>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent className="flex flex-col">
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupLabel className="px-4 mb-2">Seções</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {allSections.map((section) => {
                const isActive = activeSection === section.id;
                const Icon = section.icon;
                return (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton 
                      onClick={() => handleSectionClick(section.id)}
                      isActive={isActive}
                      className={cn(
                        "w-full justify-start h-10 px-3 rounded-md",
                        "transition-all duration-200 ease-in-out",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "group relative",
                        isActive && "bg-sidebar-accent font-medium"
                      )}
                      style={isActive ? {
                        backgroundColor: `${finalCompanyColor}15`,
                        color: getSafeTextColor(finalCompanyColor, false),
                      } : {}}
                    >
                      <Icon 
                        className={cn(
                          "w-5 h-5 mr-3 flex-shrink-0 transition-all duration-200",
                          isActive ? "" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground/70"
                        )}
                        style={isActive ? { color: finalCompanyColor } : {}}
                      />
                      <span className="text-sm truncate">{section.label}</span>
                      {isActive && (
                        <div 
                          className="ml-auto w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: finalCompanyColor }}
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    </>
  );
};

