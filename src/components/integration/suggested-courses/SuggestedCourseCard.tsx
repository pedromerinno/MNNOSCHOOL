
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, User, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    instructor: string;
    tags: string[];
  };
  suggested_by_profile: {
    display_name: string;
  };
}

interface SuggestedCourseCardProps {
  suggestion: SuggestedCourse;
  companyColor: string;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const SuggestedCourseCard: React.FC<SuggestedCourseCardProps> = ({
  suggestion,
  companyColor,
  onRemove,
  canRemove
}) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/courses/${suggestion.course.id}`);
  };

  return (
    <Card className="group border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={suggestion.course.image_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format"}
          alt={suggestion.course.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format";
          }}
        />
        
        {/* Badge mais sutil */}
        <div className="absolute top-3 right-3">
          <div 
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-white backdrop-blur-sm"
            style={{ backgroundColor: `${companyColor}90` }}
          >
            Sugerido
          </div>
        </div>

        {/* Remove button - só aparece no hover se puder remover */}
        {canRemove && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(suggestion.id);
              }}
              size="sm"
              variant="outline"
              className="w-7 h-7 p-0 rounded-lg bg-white/90 backdrop-blur-sm border-white/20 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="h-3 w-3 text-gray-600 hover:text-red-600" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Content */}
      <CardContent className="p-5 space-y-4">
        {/* Title and instructor */}
        <div className="space-y-1">
          <h3 className="font-medium text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
            {suggestion.course.title}
          </h3>
          {suggestion.course.instructor && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {suggestion.course.instructor}
            </p>
          )}
        </div>
        
        {/* Description */}
        {suggestion.course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {suggestion.course.description}
          </p>
        )}
        
        {/* Reason - design mais limpo */}
        {suggestion.reason && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-2" style={{ borderLeftColor: companyColor }}>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{suggestion.reason}"
            </p>
          </div>
        )}
        
        {/* Meta info mais discreta */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{suggestion.suggested_by_profile.display_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {format(new Date(suggestion.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>
        
        {/* Action button mais elegante */}
        <Button 
          onClick={handleViewCourse}
          className="w-full mt-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2.5 font-medium transition-colors duration-200 shadow-sm"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Ver Curso
        </Button>
      </CardContent>
    </Card>
  );
};
