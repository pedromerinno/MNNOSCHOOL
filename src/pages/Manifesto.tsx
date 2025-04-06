
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Video, Users, FileText, Quote, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Manifesto = () => {
  const { user } = useAuth();
  const { getUserCompanies, selectedCompany, isLoading } = useCompanies();

  // Initial fetch of user company
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (user?.id) {
        try {
          await getUserCompanies(user.id, false);
        } catch (error) {
          console.error('Erro ao buscar empresa para o manifesto:', error);
          toast.error("Não foi possível carregar os dados da empresa.");
        }
      }
    };

    fetchUserCompany();
  }, [user, getUserCompanies]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          {selectedCompany ? `Sobre a ${selectedCompany.nome}` : 'Manifesto do Grupo'}
        </h1>
        
        {selectedCompany?.frase_institucional && (
          <div className="bg-merinno-blue/10 rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <Quote className="h-8 w-8 text-merinno-blue flex-shrink-0" />
              <blockquote className="text-xl italic font-medium text-gray-800 dark:text-white">
                "{selectedCompany.frase_institucional}"
              </blockquote>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="overflow-hidden">
              {selectedCompany?.video_institucional ? (
                <div className="aspect-video">
                  <iframe 
                    className="w-full h-full" 
                    src={selectedCompany.video_institucional} 
                    title="Vídeo Institucional" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Video className="h-16 w-16 text-gray-400" />
                  <span className="ml-2 text-gray-500">Vídeo do Manifesto</span>
                </div>
              )}
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">
                  {selectedCompany?.descricao_video || "Assista ao nosso vídeo institucional para conhecer mais sobre nossa visão."}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-primary mr-2" />
                  <h2 className="text-xl font-semibold dark:text-white">Nossa Missão</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {selectedCompany?.missao || "Nosso propósito é capacitar empresas através da inovação digital, criando soluções tecnológicas que transformam processos e impulsionam negócios."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold dark:text-white">Nossa História</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {selectedCompany?.historia || "Fundada com a visão de transformar o cenário digital brasileiro, a MNNO nasceu da união de profissionais apaixonados por tecnologia e inovação. Nossa jornada começou com o desafio de criar soluções que realmente fizessem diferença no mercado corporativo."}
              </p>
              {!selectedCompany?.historia && (
                <p className="text-gray-700 dark:text-gray-300">
                  Ao longo dos anos, desenvolvemos uma metodologia única que combina design thinking, agilidade e estratégia de negócios, permitindo que empresas de todos os portes possam se beneficiar da transformação digital.
                </p>
              )}
            </>
          )}
        </div>
        
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold dark:text-white">Nossos Valores</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {selectedCompany?.valores ? (
                <div className="md:col-span-3">
                  <p className="text-gray-700 dark:text-gray-300">{selectedCompany.valores}</p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">Inovação</h3>
                    <p className="text-gray-600 dark:text-gray-400">Buscamos constantemente novas soluções e abordagens criativas.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">Colaboração</h3>
                    <p className="text-gray-600 dark:text-gray-400">Acreditamos no poder do trabalho em equipe e da troca de conhecimentos.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">Excelência</h3>
                    <p className="text-gray-600 dark:text-gray-400">Comprometimento com a qualidade em tudo o que entregamos.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Manifesto;
