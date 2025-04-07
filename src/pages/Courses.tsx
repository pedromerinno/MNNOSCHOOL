
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies } from "@/hooks/useCompanies";
import { Book, Clock, CheckCircle, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const Courses = () => {
  const { selectedCompany } = useCompanies();

  const getTitle = (baseTitle: string) => {
    return selectedCompany ? `${baseTitle} - ${selectedCompany.nome}` : baseTitle;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedCompany ? `Cursos da ${selectedCompany.nome}` : "Meus Cursos"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore os cursos disponíveis e acompanhe seu progresso
          </p>
        </div>
        
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b border-gray-100 dark:border-gray-800">
              <TabsList className="bg-gray-50 dark:bg-gray-900 grid grid-cols-4 gap-0 rounded-none p-0 h-auto w-full">
                <TabsTrigger 
                  value="all"
                  className="flex items-center justify-center py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300"
                >
                  <Book className="h-4 w-4 mr-2" />
                  <span>Todos</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="in-progress"
                  className="flex items-center justify-center py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Em Andamento</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="completed"
                  className="flex items-center justify-center py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Concluídos</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="not-started"
                  className="flex items-center justify-center py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  <span>Não Iniciados</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="all" className="m-0">
                <CourseList title={getTitle("Todos os Cursos")} filter="all" />
              </TabsContent>
              
              <TabsContent value="in-progress" className="m-0">
                <CourseList title={getTitle("Cursos em Andamento")} filter="in-progress" />
              </TabsContent>
              
              <TabsContent value="completed" className="m-0">
                <CourseList title={getTitle("Cursos Concluídos")} filter="completed" />
              </TabsContent>
              
              <TabsContent value="not-started" className="m-0">
                <CourseList title={getTitle("Cursos Não Iniciados")} filter="not-started" />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
