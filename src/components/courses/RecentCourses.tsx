
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Play } from "lucide-react";

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
  
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Continue assistindo</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (courses.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Continue assistindo</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card 
            key={course.id} 
            className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div className="relative aspect-video">
              <img 
                src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <Button 
                  className="rounded-full h-12 w-12 flex items-center justify-center bg-white/90 hover:bg-white text-black"
                  variant="secondary"
                >
                  <Play className="h-5 w-5 ml-0.5" />
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full" 
                  style={{ 
                    width: `${course.progress}%`,
                    backgroundColor: companyColor
                  }}
                ></div>
              </div>
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
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500">
                  {course.completed 
                    ? "Concluído" 
                    : course.progress > 0 
                      ? `${course.progress}% concluído` 
                      : "Não iniciado"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
