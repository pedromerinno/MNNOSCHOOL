
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies } from "@/hooks/useCompanies";

const Courses = () => {
  const { selectedCompany } = useCompanies();

  const getTitle = (baseTitle: string) => {
    return selectedCompany ? `${baseTitle} - ${selectedCompany.nome}` : baseTitle;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          {selectedCompany ? `Cursos da ${selectedCompany.nome}` : "Meus Cursos"}
        </h1>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="not-started">Não Iniciados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="pt-6">
              <CourseList title={getTitle("Todos os Cursos")} filter="all" />
            </div>
          </TabsContent>
          
          <TabsContent value="in-progress">
            <div className="pt-6">
              <CourseList title={getTitle("Cursos em Andamento")} filter="in-progress" />
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="pt-6">
              <CourseList title={getTitle("Cursos Concluídos")} filter="completed" />
            </div>
          </TabsContent>
          
          <TabsContent value="not-started">
            <div className="pt-6">
              <CourseList title={getTitle("Cursos Não Iniciados")} filter="not-started" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
