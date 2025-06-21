
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsWidget } from "./NotificationsWidget";
import { FeedbackWidget } from "./FeedbackWidget";
import { CalendarWidget } from "./CalendarWidget";
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  BookOpen,
  Users,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardWidgets = () => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const stats = [
    {
      title: "Cursos Concluídos",
      value: "12",
      change: "+2 este mês",
      icon: Award,
      color: companyColor
    },
    {
      title: "Horas de Estudo",
      value: "48h",
      change: "+8h esta semana",
      icon: Clock,
      color: companyColor
    },
    {
      title: "Progresso Geral",
      value: "85%",
      change: "+12% este mês",
      icon: TrendingUp,
      color: companyColor
    },
    {
      title: "Metas Atingidas",
      value: "3/4",
      change: "1 pendente",
      icon: Target,
      color: companyColor
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="p-1.5 sm:p-2 rounded-lg"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon 
                    className="h-3 w-3 sm:h-4 sm:w-4" 
                    style={{ color: stat.color }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Atividade Recente */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 dark:bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Atividade Recente</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs sm:text-sm"
                onClick={() => navigate('/courses')}
              >
                Ver todos
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {[
              {
                type: "Curso concluído",
                title: "Fundamentos de React",
                time: "2 horas atrás",
                icon: BookOpen
              },
              {
                type: "Nova discussão",
                title: "Dúvidas sobre TypeScript",
                time: "1 dia atrás",
                icon: Users
              },
              {
                type: "Progresso atualizado",
                title: "JavaScript Avançado - 75%",
                time: "2 dias atrás",
                icon: TrendingUp
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div 
                  className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <activity.icon 
                    className="h-3 w-3 sm:h-4 sm:w-4" 
                    style={{ color: companyColor }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar com widgets */}
        <div className="space-y-4 sm:space-y-6">
          <NotificationsWidget />
          <FeedbackWidget />
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
};
