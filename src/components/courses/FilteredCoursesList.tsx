
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle } from "lucide-react";
import { NewCourseDialog } from "@/components/admin/dialogs/NewCourseDialog";

type FilterOption = 'all' | 'favorites' | 'completed' | 'in-progress';

interface FilteredCoursesListProps {
  courses: any[];
  loading: boolean;
  activeFilter: FilterOption;
  companyColor: string;
}

export const FilteredCoursesList: React.FC<FilteredCoursesListProps> = ({
  courses,
  loading,
  activeFilter,
  companyColor
}) => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = React.useState(false);
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  
  // Filter title mapping
  const filterTitles = {
    'all': 'Todos os cursos',
    'favorites': 'Cursos favoritos',
    'completed': 'Cursos concluídos',
    'in-progress': 'Cursos iniciados'
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {filterTitles[activeFilter]}
      </h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="relative aspect-video">
                <img 
                  src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {course.tags && course.tags.slice(0, 3).map((tag: string, i: number) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="bg-gray-100 dark:bg-gray-800 text-xs font-normal text-gray-700 dark:text-gray-300 rounded-full px-3"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="font-medium mb-2 line-clamp-2 text-lg">
                  {course.title}
                </h3>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4 mb-1">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${course.progress}%`,
                      backgroundColor: companyColor
                    }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    {course.completed 
                      ? "100% concluído" 
                      : course.progress > 0 
                        ? `${course.progress}% concluído` 
                        : "0% concluído"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {activeFilter === 'all' 
              ? `Nenhum curso disponível para ${selectedCompany?.nome || 'sua empresa'}.` 
              : activeFilter === 'favorites'
                ? 'Você ainda não tem cursos favoritos.'
                : activeFilter === 'completed'
                  ? 'Você ainda não concluiu nenhum curso.'
                  : 'Você ainda não iniciou nenhum curso.'}
          </p>
          
          {isAdmin && activeFilter === 'all' && (
            <Button
              onClick={() => setIsNewCourseDialogOpen(true)}
              className="flex items-center gap-2 rounded-full px-6"
              style={{ backgroundColor: companyColor }}
            >
              <PlusCircle className="h-4 w-4" />
              Adicionar curso
            </Button>
          )}
        </div>
      )}

      <NewCourseDialog 
        open={isNewCourseDialogOpen}
        onOpenChange={setIsNewCourseDialogOpen}
      />
    </div>
  );
};
