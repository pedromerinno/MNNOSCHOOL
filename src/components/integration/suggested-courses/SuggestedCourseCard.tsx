
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
    <Card className="group border-0 shadow-none bg-white dark:bg-gray-900 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30 transition-all duration-300">
      {/* Image container mais clean */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={suggestion.course.image_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format"}
          alt={suggestion.course.title}
          className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format";
          }}
        />
        
        {/* Badge minimalista */}
        <div className="absolute top-4 right-4">
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-medium text-white bg-black/20 backdrop-blur-md border border-white/10"
          >
            Sugerido
          </div>
        </div>

        {/* Remove button mais sutil */}
        {canRemove && (
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(suggestion.id);
              }}
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 rounded-full bg-white/90 backdrop-blur-sm border-white/20 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="h-3.5 w-3.5 text-gray-600 hover:text-red-600" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Content mais espaçado e limpo */}
      <CardContent className="p-6 space-y-4">
        {/* Title section mais clean */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {suggestion.course.title}
          </h3>
          {suggestion.course.instructor && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {suggestion.course.instructor}
            </p>
          )}
        </div>
        
        {/* Description mais sutil */}
        {suggestion.course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {suggestion.course.description}
          </p>
        )}
        
        {/* Reason com design mais clean */}
        {suggestion.reason && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{suggestion.reason}"
            </p>
          </div>
        )}
        
        {/* Meta info mais discreta e organizada */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User className="h-3 w-3" />
            <span className="font-medium">{suggestion.suggested_by_profile.display_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              {format(new Date(suggestion.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>
        
        {/* Action button mais elegante e minimal */}
        <Button 
          onClick={handleViewCourse}
          className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Ver Curso
        </Button>
      </CardContent>
    </Card>
  );
};
