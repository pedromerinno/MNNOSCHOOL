
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface RecentCoursesProps {
  courses: any[];
  loading: boolean;
  companyColor: string;
}

export const RecentCourses: React.FC<RecentCoursesProps> = ({ 
  courses, 
  loading,
  companyColor
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Continue assistindo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group" 
                onClick={() => navigate(`/courses/${course.id}`)}>
              <div className="relative h-40">
                <img 
                  src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                {/* Progress overlay */}
                {course.progress > 0 && !course.completed && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${course.progress}%`,
                        backgroundColor: companyColor
                      }}
                    ></div>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2 mb-2">
                  {course.tags && course.tags.length > 0 ? (
                    course.tags.slice(0, 2).map((tag: string, i: number) => (
                      <CompanyThemedBadge key={i} variant="beta" className="text-xs font-normal">
                        {tag}
                      </CompanyThemedBadge>
                    ))
                  ) : (
                    <CompanyThemedBadge variant="beta" className="text-xs font-normal">
                      Curso
                    </CompanyThemedBadge>
                  )}
                </div>
                
                <h3 className="font-medium mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    {course.completed 
                      ? "Concluído" 
                      : course.progress > 0 
                        ? `${course.progress}% concluído` 
                        : "Não iniciado"}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 col-span-3">Nenhum curso em progresso encontrado.</p>
        )}
      </div>
    </div>
  );
};
