
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, FileText, Play, Users } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: "video" | "text" | "quiz";
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseViewProps {
  id: string;
  title: string;
  instructor: string;
  description: string;
  image: string;
  progress: number;
  modules: Module[];
}

export const CourseView = ({
  id,
  title,
  instructor,
  description,
  image,
  progress,
  modules,
}: CourseViewProps) => {
  const [currentModule, setCurrentModule] = useState(modules[0]);
  const [currentLesson, setCurrentLesson] = useState(modules[0].lessons[0]);

  const totalLessons = modules.reduce(
    (count, module) => count + module.lessons.length,
    0
  );
  
  const completedLessons = modules.reduce(
    (count, module) =>
      count + module.lessons.filter((lesson) => lesson.completed).length,
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Button
            className="w-16 h-16 rounded-full bg-merinno-blue hover:bg-merinno-blue/90"
            size="icon"
          >
            <Play className="h-6 w-6" fill="white" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 mb-4">{instructor}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>
                {completedLessons} de {totalLessons} aulas completas ({progress}%)
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>10h 30m total</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>{totalLessons} aulas</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>158 alunos</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="discussion">Discussões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            <div className="mt-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className={`p-4 flex justify-between items-center cursor-pointer ${
                      currentModule.id === module.id
                        ? "bg-merinno-blue/10"
                        : "bg-gray-50"
                    }`}
                    onClick={() => setCurrentModule(module)}
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <span className="text-sm text-gray-500">
                      {module.lessons.filter((l) => l.completed).length}/
                      {module.lessons.length} aulas
                    </span>
                  </div>
                  
                  {currentModule.id === module.id && (
                    <div className="border-t border-gray-200">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`p-4 flex justify-between items-center border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                            currentLesson.id === lesson.id
                              ? "bg-merinno-blue/5"
                              : ""
                          }`}
                          onClick={() => setCurrentLesson(lesson)}
                        >
                          <div className="flex items-center">
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            ) : (
                              <div className="h-5 w-5 border border-gray-300 rounded-full mr-3" />
                            )}
                            <div>
                              <h4 className="font-medium text-sm">
                                {lesson.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            {lesson.type === "video" && (
                              <Play className="h-4 w-4 text-gray-500" />
                            )}
                            {lesson.type === "text" && (
                              <FileText className="h-4 w-4 text-gray-500" />
                            )}
                            {lesson.type === "quiz" && (
                              <div className="text-xs font-medium bg-merinno-blue/10 text-merinno-blue px-2 py-1 rounded">
                                Quiz
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="about">
            <div className="mt-4 prose max-w-none">
              <p>{description}</p>
              <h3>O que você vai aprender</h3>
              <ul>
                <li>Entender os conceitos fundamentais de marketing digital</li>
                <li>Criar e gerenciar campanhas em redes sociais</li>
                <li>Analisar métricas e otimizar resultados</li>
                <li>Implementar estratégias de SEO e conteúdo</li>
              </ul>
              <h3>Requisitos</h3>
              <ul>
                <li>Não é necessário experiência prévia</li>
                <li>Computador com acesso à internet</li>
                <li>Vontade de aprender e praticar</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="mt-4">
              <p className="text-gray-500 mb-4">
                Materiais complementares para o curso
              </p>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center text-gray-900">
                    <FileText className="h-5 w-5 mr-3 text-merinno-blue" />
                    <span>Guia completo de Marketing Digital.pdf</span>
                  </div>
                </a>
                <a
                  href="#"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center text-gray-900">
                    <FileText className="h-5 w-5 mr-3 text-merinno-blue" />
                    <span>Planilha de métricas.xlsx</span>
                  </div>
                </a>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="discussion">
            <div className="mt-4">
              <p className="text-gray-500 mb-4">
                Participe da discussão com outros alunos
              </p>
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  Nenhuma discussão iniciada. Seja o primeiro a perguntar!
                </p>
                <Button className="mt-4 bg-merinno-blue hover:bg-merinno-blue/90">
                  Nova discussão
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
