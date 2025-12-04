import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PlayCircle, BriefcaseBusiness, GraduationCap, ChevronUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface IntegrationNavigationProps {
  sections: Section[];
  companyColor?: string;
  onSectionClick?: (sectionId: string) => void;
}

/**
 * Navegação flutuante para seções da página de integração
 */
export const IntegrationNavigation: React.FC<IntegrationNavigationProps> = ({
  sections,
  companyColor = '#1EAEDB',
  onSectionClick,
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Detectar seção ativa baseada no scroll
  useEffect(() => {
    let lastScrollY = 0;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset para ativação
      
      // Encontrar seção ativa
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }

      // Mostrar/ocultar navegação baseado na direção do scroll
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsVisible(false);
      }
      lastScrollY = currentScrollY;
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Verificar posição inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Offset do header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSection(sectionId);
      onSectionClick?.(sectionId);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 hidden lg:block"
        >
          <div className="flex flex-col gap-2">
            {/* Botão de voltar ao topo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={scrollToTop}
                className={cn(
                  "relative rounded-lg bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-800",
                  "overflow-hidden group transition-all duration-300",
                  "hover:border-opacity-60 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50"
                )}
                style={{
                  color: companyColor,
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${companyColor}15, ${companyColor}05)`,
                  }}
                />
                <ChevronUp className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </Button>
            </motion.div>

            {/* Botões de navegação */}
            <div className="flex flex-col gap-1.5 bg-white dark:bg-[#222222] rounded-lg p-2 border border-gray-200 dark:border-gray-800 shadow-sm">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <motion.div
                    key={section.id}
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSectionClick(section.id)}
                      className={cn(
                        "relative rounded-lg transition-all duration-300 group overflow-hidden",
                        "hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50",
                        isActive 
                          ? "shadow-sm" 
                          : "hover:bg-opacity-50"
                      )}
                      style={{
                        color: isActive ? companyColor : undefined,
                        backgroundColor: isActive ? `${companyColor}12` : undefined,
                      }}
                      title={section.label}
                    >
                      {/* Background animado no hover */}
                      <motion.div
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${companyColor}20, ${companyColor}08)`,
                        }}
                        initial={false}
                      />
                      
                      {/* Borda animada no hover */}
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          borderColor: `${companyColor}40`,
                        }}
                        initial={false}
                      />
                      
                      {/* Indicador ativo */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSectionIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                          style={{
                            backgroundColor: companyColor,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      
                      {/* Ícone com animação */}
                      <Icon className="h-4 w-4 relative z-10 transition-all duration-300 group-hover:scale-110" 
                        style={{
                          color: isActive ? companyColor : undefined,
                        }}
                      />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

