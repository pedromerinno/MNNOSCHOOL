
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { NoCompaniesAvailable } from "@/components/home/NoCompaniesAvailable";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading, userCompanies } = useCompanies();
  const navigate = useNavigate();

  // Fetch user's companies
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        try {
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies]);

  // If user has no companies, show no companies screen
  if (!isLoading && user && userCompanies.length === 0) {
    return <NoCompaniesAvailable />;
  }

  return (
    <DashboardLayout>
      <WelcomeBanner company={selectedCompany} />
      
      {isLoading ? (
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <Skeleton className="h-7 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-xl mb-4" />
          <Skeleton className="h-9 w-28" />
        </div>
      ) : selectedCompany ? (
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">Sobre a {selectedCompany.nome}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {selectedCompany.frase_institucional || 
             selectedCompany.missao || 
             selectedCompany.historia || 
             "Entre na seção Manifesto para adicionar informações sobre a empresa."}
          </p>
          <Button
            onClick={() => navigate('/manifesto')}
            variant="outline" 
            className="border-black text-black hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/10 flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Saiba mais sobre a {selectedCompany.nome}
          </Button>
        </div>
      ) : (
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">Bem-vindo à plataforma</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Selecione uma empresa para começar a usar a plataforma.
          </p>
        </div>
      )}
      
      <CourseList title="Continue Aprendendo" filter="in-progress" />
      <CourseList title="Recomendados para Você" filter="all" />
    </DashboardLayout>
  );
};

export default Dashboard;
