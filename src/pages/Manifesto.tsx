
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Video, Users, FileText } from "lucide-react";

const Manifesto = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Manifesto do Grupo</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Video className="h-16 w-16 text-gray-400" />
              <span className="ml-2 text-gray-500">Vídeo do Manifesto</span>
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Assista ao nosso vídeo institucional para conhecer mais sobre nossa visão.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold dark:text-white">Nossa Missão</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nosso propósito é capacitar empresas através da inovação digital, criando soluções tecnológicas que transformam processos e impulsionam negócios.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold dark:text-white">Nossa História</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Fundada com a visão de transformar o cenário digital brasileiro, a MNNO nasceu da união de profissionais apaixonados por tecnologia e inovação. Nossa jornada começou com o desafio de criar soluções que realmente fizessem diferença no mercado corporativo.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Ao longo dos anos, desenvolvemos uma metodologia única que combina design thinking, agilidade e estratégia de negócios, permitindo que empresas de todos os portes possam se beneficiar da transformação digital.
          </p>
        </div>
        
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold dark:text-white">Nossos Valores</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Manifesto;
