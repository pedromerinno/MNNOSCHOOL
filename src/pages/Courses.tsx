
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies } from "@/hooks/useCompanies";
import { Book, Clock, CheckCircle, PlayCircle } from "lucide-react";

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
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-4 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="all"
                className="flex items-center justify-center py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-300"
              >
                <Book className="h-4 w-4 mr-2" />
                <span>Todos</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="in-progress"
                className="flex items-center justify-center py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-300"
              >
                <Clock className="h-4 w-4 mr-2" />
                <span>Em Andamento</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="completed"
                className="flex items-center justify-center py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-300"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Concluídos</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="not-started"
                className="flex items-center justify-center py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-300"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                <span>Não Iniciados</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-4">
              <CourseList title={getTitle("Todos os Cursos")} filter="all" />
            </TabsContent>
            
            <TabsContent value="in-progress" className="pt-4">
              <CourseList title={getTitle("Cursos em Andamento")} filter="in-progress" />
            </TabsContent>
            
            <TabsContent value="completed" className="pt-4">
              <CourseList title={getTitle("Cursos Concluídos")} filter="completed" />
            </TabsContent>
            
            <TabsContent value="not-started" className="pt-4">
              <CourseList title={getTitle("Cursos Não Iniciados")} filter="not-started" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
