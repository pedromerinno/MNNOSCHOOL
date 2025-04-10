
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

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
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        {activeFilter === 'all' ? 'Todos os cursos' : 
         activeFilter === 'favorites' ? 'Cursos favoritos' :
         activeFilter === 'completed' ? 'Cursos concluídos' : 'Cursos iniciados'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => navigate(`/courses/${course.id}`)}>
              <div className="relative h-40">
                <img 
                  src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2 mb-2">
                  {course.tags && course.tags.length > 0 ? (
                    course.tags.slice(0, 2).map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">{tag}</Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">Curso</Badge>
                    </>
                  )}
                </div>
                
                <h3 className="font-medium mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${course.progress}%`,
                      backgroundColor: companyColor
                    }}
                  ></div>
                </div>
                
                <div className="flex items-center mt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                        <img 
                          src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                          alt="User" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">+8</span>
                  <Button variant="ghost" size="sm" className="ml-auto p-0 h-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 col-span-3">Nenhum curso encontrado para este filtro.</p>
        )}
      </div>
    </div>
  );
};
