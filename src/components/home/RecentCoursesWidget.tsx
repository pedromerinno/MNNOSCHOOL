import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Play, Building2 } from "lucide-react";
import { useMyCourses } from "@/hooks/my-courses";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { EmptyState } from "@/components/ui/empty-state";

export const RecentCoursesWidget = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const { recentCourses, loading, companyColor } = useMyCourses();
  
  // Mostrar apenas os 2 cursos mais recentes
  const displayCourses = recentCourses.slice(0, 2);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleViewAll = () => {
    navigate("/my-courses");
  };

  return (
    <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-medium dark:text-white text-left">Cursos Recentes</h3>
          </div>
          {recentCourses.length > 2 && (
            <Badge variant="outline" className="text-xs px-2 py-1">
              +{recentCourses.length - 2}
            </Badge>
          )}
        </div>
        
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            </div>
          ) : !selectedCompany ? (
            <div className="flex justify-center py-8">
              <EmptyState
                title="Selecione uma empresa"
                description=""
                icons={[Building2]}
                className="border-0 bg-transparent hover:bg-transparent p-8 max-w-none"
              />
            </div>
          ) : displayCourses.length === 0 ? (
            <div className="flex justify-center py-8">
              <EmptyState
                title="Nenhum curso em progresso"
                description=""
                icons={[BookOpen]}
                className="border-0 bg-transparent hover:bg-transparent p-8 max-w-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {displayCourses.map((course) => (
                <div
                  key={course.id}
                  className="group p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                        alt={course.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                        <div className="rounded-full bg-white/90 p-2">
                          <Play className="h-4 w-4 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-left leading-tight">
                        {course.title}
                      </h4>
                      
                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${course.progress || 0}%`,
                            backgroundColor: companyColor
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {course.progress || 0}% concluído
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {recentCourses.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 py-3 text-center mb-4">
            <button 
              onClick={handleViewAll}
              className="text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors px-6 py-2 rounded-full bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {recentCourses.length > 2 ? `ver todos (${recentCourses.length})` : 'ver cursos'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

