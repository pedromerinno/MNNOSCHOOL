
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { Book, Clock, CheckCircle, Play, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterOption = 'all' | 'in-progress' | 'completed' | 'not-started';

const filterOptions = [
  { id: 'all', label: 'Todos', icon: Book },
  { id: 'in-progress', label: 'Em Andamento', icon: Clock },
  { id: 'completed', label: 'Concluídos', icon: CheckCircle },
  { id: 'not-started', label: 'Não Iniciados', icon: Play },
];

const Courses = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const getTitle = (baseTitle: string) => {
    return selectedCompany ? `${baseTitle} - ${selectedCompany.nome}` : baseTitle;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedCompany ? `Cursos da ${selectedCompany.nome}` : "Meus Cursos"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore os cursos disponíveis e acompanhe seu progresso
          </p>
        </div>
        
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id as FilterOption)}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full border text-sm transition-colors",
                  activeFilter === option.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {option.label}
              </button>
            );
          })}
          
          {/* Additional filters could go here */}
          <button
            className="inline-flex items-center px-4 py-2 rounded-full border text-sm transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar - similar to reference */}
        <div className="relative h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-600 rounded-full"
            style={{ width: activeFilter === 'all' ? '25%' : 
                    activeFilter === 'in-progress' ? '50%' : 
                    activeFilter === 'completed' ? '75%' : '100%' }}
          />
        </div>
        
        {/* Course List */}
        <CourseList 
          title={getTitle(activeFilter === 'all' ? "Todos os Cursos" : 
                  activeFilter === 'in-progress' ? "Cursos em Andamento" : 
                  activeFilter === 'completed' ? "Cursos Concluídos" : "Cursos Não Iniciados")} 
          filter={activeFilter} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Courses;
