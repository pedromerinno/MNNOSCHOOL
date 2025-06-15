
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trash2, User, Calendar } from "lucide-react";
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={suggestion.course.image_url || "/placeholder.svg"}
          alt={suggestion.course.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div 
          className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: companyColor }}
        >
          Sugerido
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-2">{suggestion.course.title}</h3>
        {suggestion.course.instructor && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            por {suggestion.course.instructor}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {suggestion.course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {suggestion.course.description}
          </p>
        )}
        
        {suggestion.reason && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium mb-1">Motivo da sugestão:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User className="h-3 w-3" />
          <span>Sugerido por {suggestion.suggested_by_profile.display_name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(suggestion.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
          </span>
        </div>
        
        {suggestion.course.tags && suggestion.course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestion.course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {suggestion.course.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{suggestion.course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleViewCourse}
            className="flex-1"
            style={{ backgroundColor: companyColor }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Ver Curso
          </Button>
          
          {canRemove && (
            <Button 
              onClick={() => onRemove(suggestion.id)}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
