
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeaturedCourseProps {
  course: any;
}

export const FeaturedCourse: React.FC<FeaturedCourseProps> = ({ course }) => {
  const navigate = useNavigate();
  
  if (!course) return null;
  
  return (
    <div className="rounded-2xl overflow-hidden mb-8 bg-[#1A1F2C] h-[350px]">
      <div className="relative h-full">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {course.title}
              </h1>
              
              <div className="flex gap-2 mb-8">
                <Badge variant="outline" className="bg-black/30 text-white border-none">
                  IA
                </Badge>
                <Badge variant="outline" className="bg-black/30 text-white border-none">
                  Ilustração
                </Badge>
                <Badge variant="outline" className="bg-black/30 text-white border-none">
                  Conceitos
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-lg font-medium overflow-hidden">
                  {course.instructor ? (
                    <img 
                      src={`https://i.pravatar.cc/100?u=${course.instructor}`} 
                      alt={course.instructor}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>P</span>
                  )}
                </div>
                <span className="text-white">{course.instructor || "Pedro"}</span>
              </div>
              
              <Button 
                className="bg-white text-black hover:bg-gray-100 rounded-full gap-2 px-6"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                Assistir agora
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1F2C] via-transparent to-transparent z-10 md:block hidden"></div>
            <img 
              src={course.image_url || "https://images.unsplash.com/photo-1617096199719-18e5acee65f8?auto=format&fit=crop&w=1200&q=80"} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
