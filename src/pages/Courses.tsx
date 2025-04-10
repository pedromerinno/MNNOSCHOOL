
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { Book, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterOption = 'all' | 'newest' | 'popular';

const Courses = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  // Get company color for styling
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const getTitle = () => {
    return selectedCompany 
      ? `Todos os Cursos - ${selectedCompany.nome}` 
      : "Todos os Cursos";
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore todos os cursos disponíveis para sua empresa
          </p>
        </div>
        
        {/* Header with filter */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Catálogo de Cursos</h2>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setActiveFilter('all')}>
                Todos os Cursos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('newest')}>
                Mais Recentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('popular')}>
                Mais Populares
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Course List */}
        <CourseList 
          title="" 
          filter="all" 
        />
      </div>
    </DashboardLayout>
  );
};

export default Courses;
