
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
    console.log('🎯 FeaturedCourse: Navigating to course', { 
      courseId: course.id, 
      courseTitle: course.title 
    });
    navigate(`/courses/${course.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 FeaturedCourse: Button clicked, navigating to course', { 
      courseId: course.id, 
      courseTitle: course.title 
    });
    navigate(`/courses/${course.id}`);
  };

  // Sempre usar imagem padrão se não houver image_url válido
  const defaultImage = "https://5cae13a1-92c0-4c6b-93bc-bb999597eb98.lovableproject.com/placeholder.svg";
  
  // Verificar se existe uma imagem válida, caso contrário usar a padrão
  let imageUrl = defaultImage;
  if (course.image_url && typeof course.image_url === 'string' && course.image_url.trim() !== '') {
    imageUrl = course.image_url;
  }
  
  return (
    <div 
      className="rounded-2xl overflow-hidden mb-8 bg-[#1A1F2C] h-[350px] relative cursor-pointer"
      onClick={handleCourseClick}
    >
      {/* Background image - sempre mostrar */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={imageUrl}
          alt={course.title || "Curso"}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Fallback para uma segunda imagem se a primeira falhar
            if (target.src === imageUrl && imageUrl !== defaultImage) {
              target.src = defaultImage;
            } else if (target.src === defaultImage) {
              // Se até a imagem padrão falhar, usar uma segunda opção
              target.src = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80";
            }
          }}
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full p-8 md:p-12 flex flex-col">
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
            onClick={handleButtonClick}
          >
            Assistir agora
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
