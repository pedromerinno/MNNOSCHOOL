
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

  const handleCourseClick = () => {
    navigate(`/courses/${course.id}`);
  };
  
  return (
    <div className="rounded-2xl overflow-hidden mb-8 bg-[#1A1F2C] h-[350px] relative">
      {/* Full-width background image with click handler */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer" 
        onClick={handleCourseClick}
      >
        <img 
          src={course.image_url || "https://images.unsplash.com/photo-1617096199719-18e5acee65f8?auto=format&fit=crop&w=1200&q=80"} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
        {/* Diagonal black shadow gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent"></div>
      </div>
      
      {/* Content positioned over the image */}
      <div className="relative h-full z-10">
        <div className="flex flex-col h-full p-8 md:p-12">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {course.title}
            </h1>
            
            {course.description && (
              <p className="text-white/80 mb-6 line-clamp-3">
                {course.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-8">
              {course.tags?.slice(0, 3).map((tag: string, index: number) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-transparent text-white border-white/40"
                >
                  {tag}
                </Badge>
              ))}
              {course.tags && course.tags.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="bg-transparent text-white border-white/40"
                >
                  +{course.tags.length - 3}
                </Badge>
              )}
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
              onClick={handleCourseClick}
            >
              Assistir agora
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
