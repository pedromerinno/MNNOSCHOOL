
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trash2, User, Calendar, Star, PlayCircle } from "lucide-react";
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
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg bg-white dark:bg-gray-800">
      {/* Course Image with Overlay */}
      <div className="relative overflow-hidden">
        <img
          src={suggestion.course.image_url || "/placeholder.svg"}
          alt={suggestion.course.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        
        {/* Overlay with suggestion badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Suggestion Badge */}
        <div className="absolute top-4 right-4">
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: companyColor }}
          >
            <Star className="w-3 h-3 inline mr-1" />
            Sugerido
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-sm"
            style={{ backgroundColor: `${companyColor}90` }}
          >
            <PlayCircle className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white line-clamp-2 group-hover:text-opacity-80 transition-colors">
            {suggestion.course.title}
          </h3>
          {suggestion.course.instructor && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {suggestion.course.instructor}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Course Description */}
        {suggestion.course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {suggestion.course.description}
          </p>
        )}
        
        {/* Suggestion Reason */}
        {suggestion.reason && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-l-4" style={{ borderLeftColor: companyColor }}>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              💡 Por que foi sugerido:
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{suggestion.reason}"
            </p>
          </div>
        )}
        
        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${companyColor}20` }}>
              <User className="w-3 h-3" style={{ color: companyColor }} />
            </div>
            <span>Sugerido por <strong>{suggestion.suggested_by_profile.display_name}</strong></span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${companyColor}20` }}>
              <Calendar className="w-3 h-3" style={{ color: companyColor }} />
            </div>
            <span>
              {format(new Date(suggestion.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>
        
        {/* Tags */}
        {suggestion.course.tags && suggestion.course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestion.course.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {suggestion.course.tags.length > 3 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700"
              >
                +{suggestion.course.tags.length - 3} mais
              </Badge>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={handleViewCourse}
            className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            style={{ backgroundColor: companyColor }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Começar Curso
          </Button>
          
          {canRemove && (
            <Button 
              onClick={() => onRemove(suggestion.id)}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
