
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const School = () => {
  const courses = [
    { 
      title: "Introdução à empresa", 
      description: "Aprenda sobre nossa história, valores e processos",
      duration: "2 horas",
      progress: 75
    },
    { 
      title: "Desenvolvimento Profissional", 
      description: "Habilidades essenciais para sua carreira",
      duration: "4 horas",
      progress: 30
    },
    { 
      title: "Ferramentas Internas", 
      description: "Conheça as ferramentas que usamos no dia a dia",
      duration: "3 horas",
      progress: 0
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Escola</h1>
          <Button>Ver todos os cursos</Button>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Continue Aprendendo</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {courses.map((course, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="dark:text-white">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration}</span>
                </div>
                
                {course.progress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{course.progress}% completo</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={course.progress === 0 ? "default" : "outline"}>
                  <Play className="h-4 w-4 mr-2" />
                  {course.progress === 0 ? "Começar" : "Continuar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Recomendados para Você</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="dark:text-white">Curso Recomendado {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Descrição do curso recomendado para o seu perfil.</p>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>3-5 horas</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Ver detalhes</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default School;
