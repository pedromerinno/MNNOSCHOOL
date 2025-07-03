
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link, FileText, Users, School, Globe, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";

export const QuickLinks = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [isVisible, setIsVisible] = useState(false);
  
  const links = [
    { 
      icon: Link, 
      label: "Integração", 
      path: "/integration", 
      description: "Processo de integração" 
    },
    { 
      icon: Settings, 
      label: "Senhas", 
      path: "/access",
      description: "Gerencie suas senhas" 
    },
    { 
      icon: FileText, 
      label: "Documentos", 
      path: "/documents",
      description: "Seus documentos" 
    },
    { 
      icon: School, 
      label: "Escola", 
      path: "/courses", 
      hasDropdown: true,
      description: "Acesso aos cursos"
    },
    { 
      icon: Users, 
      label: "Fórum", 
      path: "/community", 
      description: "Discussões e compartilhamento"
    }
  ];

  // Trigger animation on mount - timing suave
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 text-left">
      {links.map((link, index) => {
        return (
          <Card 
            key={index} 
            className={`border-0 shadow-none bg-white dark:bg-[#222222] rounded-[30px] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-700 ease-out hover:scale-105 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{
              transitionDelay: `${index * 100 + 300}ms` // Delay sequencial suave
            }}
            onClick={() => handleNavigate(link.path)}
          >
            <CardContent className="p-6 flex flex-col text-left">
              <div className="flex items-center mb-2">
                <span className="mr-3 bg-gray-100 dark:bg-[#1F1F1F] p-2 rounded-lg">
                  <link.icon className="h-5 w-5 text-gray-700 dark:text-gray-300 stroke-current" strokeWidth={1.5} />
                </span>
                <span className="font-medium dark:text-white">{link.label}</span>
                {link.hasDropdown && (
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                  </svg>
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
