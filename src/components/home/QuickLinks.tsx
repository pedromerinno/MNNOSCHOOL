
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export const QuickLinks = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  const quickLinks = [
    {
      title: "Cursos",
      description: "Explore cursos disponíveis",
      icon: BookOpen,
      path: "/courses",
      color: companyColor
    },
    {
      title: "Equipe",
      description: "Veja sua equipe",
      icon: Users,
      path: "/team",
      color: companyColor
    },
    {
      title: "Documentos",
      description: "Gerencie documentos",
      icon: FileText,
      path: "/documents",
      color: companyColor
    },
    {
      title: "Integração",
      description: "Central de integração",
      icon: BarChart3,
      path: "/integration",
      color: companyColor
    },
    {
      title: "Comunidade",
      description: "Participe das discussões",
      icon: MessageSquare,
      path: "/community",
      color: companyColor
    }
  ];

  // Adicionar link para admin se for admin ou super admin
  if (userProfile?.is_admin || userProfile?.super_admin) {
    quickLinks.push({
      title: "Admin",
      description: "Painel administrativo",
      icon: Settings,
      path: "/admin",
      color: companyColor
    });
  }

  return (
    <Card className="mb-4 sm:mb-8 border-0 shadow-sm bg-white/80 dark:bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          Acesso Rápido
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {quickLinks.map((link) => (
            <Button
              key={link.path}
              variant="ghost"
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
              onClick={() => navigate(link.path)}
            >
              <div 
                className="p-2 sm:p-3 rounded-xl transition-all duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${link.color}15` }}
              >
                <link.icon 
                  className="h-4 w-4 sm:h-5 sm:w-5" 
                  style={{ color: link.color }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {link.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {link.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
