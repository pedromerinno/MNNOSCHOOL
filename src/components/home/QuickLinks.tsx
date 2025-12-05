
import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Puzzle, 
  LockKeyhole, 
  FolderOpen, 
  MessageCircle, 
  BookOpen,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { Badge } from "@/components/ui/badge";

interface QuickLink {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  path: string | null;
  description: string;
  hasDropdown?: boolean;
  isLocked?: boolean;
}

interface QuickLinksProps {
  hasNoCompanies?: boolean;
}

export const QuickLinks = ({ hasNoCompanies = false }: QuickLinksProps) => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [isVisible, setIsVisible] = useState(false);
  
  const links: QuickLink[] = [
    { 
      icon: Puzzle, 
      label: "Integração", 
      path: "/integration", 
      description: "Processo de integração" 
    },
    { 
      icon: LockKeyhole, 
      label: "Senhas", 
      path: "/access",
      description: "Gerencie suas senhas" 
    },
    { 
      icon: FolderOpen, 
      label: "Documentos", 
      path: "/documents",
      description: "Seus documentos" 
    },
    { 
      icon: BookOpen, 
      label: "Escola", 
      path: "/my-courses", 
      hasDropdown: true,
      description: "Acesso aos cursos"
    },
    { 
      icon: MessageCircle, 
      label: "Feed", 
      path: null, 
      description: "Feed de conteúdo",
      isLocked: true
    }
  ];

  // Trigger animation on mount - reduzir delay para melhor percepção
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleNavigate = (path: string | null) => {
    if (path && !hasNoCompanies) {
      navigate(path);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 text-left">
      {links.map((link, index) => {
        return (
          <Card 
            key={index} 
            className={`border-0 shadow-none rounded-[30px] ${
              link.isLocked || hasNoCompanies
                ? 'bg-gray-100 dark:bg-[#1A1A1A] cursor-not-allowed opacity-75' 
                : 'bg-white dark:bg-[#222222] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2C] hover:scale-105'
            } transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{
              transitionDelay: `${index * 50 + 100}ms` // Delay sequencial otimizado
            }}
            onClick={() => link.path && handleNavigate(link.path)}
          >
            <CardContent className="p-6 flex flex-col text-left">
              <div className="flex items-center mb-2">
                <span className="mr-3 bg-gray-100 dark:bg-[#1F1F1F] p-2 rounded-lg">
                  {React.createElement(link.icon, { 
                    className: "h-5 w-5 text-gray-700 dark:text-gray-300", 
                    strokeWidth: 1.5 
                  })}
                </span>
                <span className="font-medium dark:text-white">{link.label}</span>
                {(link.isLocked || hasNoCompanies) && (
                  <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-[#757576] text-left">
                {link.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
