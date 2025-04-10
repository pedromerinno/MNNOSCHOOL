
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from './CourseList';
import { Heart, ChevronRight, UserRound } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { id, title, description, image_url, instructor, progress = 0, completed = false, tags = [], favorite = false } = course;
  const [isFavorite, setIsFavorite] = useState<boolean>(favorite);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the Link from being activated
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para favoritar um curso",
          variant: "destructive",
        });
        return;
      }
      
      // Check if there's an existing progress record
      const { data: existingProgress } = await supabase
        .from('user_course_progress')
        .select()
        .eq('user_id', user.id)
        .eq('course_id', id)
        .maybeSingle();
      
      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('user_course_progress')
          .update({ favorite: !isFavorite, last_accessed: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('course_id', id);
        
        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: user.id,
            course_id: id,
            favorite: true,
            progress: 0,
            completed: false,
            last_accessed: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setIsFavorite(!isFavorite);
      
      // Show success toast
      toast({
        title: !isFavorite ? "Curso favoritado" : "Curso removido dos favoritos",
        description: !isFavorite ? "O curso foi adicionado aos seus favoritos" : "O curso foi removido dos seus favoritos",
      });
      
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro ao favoritar curso",
        description: error.message || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="group h-full overflow-hidden rounded-[20px] border border-gray-200 dark:border-gray-700">
      <Link to={`/courses/${id}`} className="block h-full">
        <div className="flex flex-col h-full">
          {/* Hero Image with reduced height */}
          <div className="relative">
            <div className="aspect-[16/6] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {image_url ? (
                <img 
                  src={image_url} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
              )}
            </div>
            
            {/* Like button */}
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "absolute top-2 right-2 rounded-full h-8 w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-colors",
                isFavorite 
                  ? "hover:bg-red-100 dark:hover:bg-red-950/30" 
                  : "hover:bg-white dark:hover:bg-gray-800"
              )}
              onClick={handleToggleFavorite}
              disabled={isSubmitting}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-colors", 
                  isFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-gray-600 dark:text-gray-400"
                )} 
              />
            </Button>
            
            {/* Progress Bar */}
            {progress > 0 && !completed && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-600" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
          
          {/* Content - better organized */}
          <div className="p-5 space-y-3 flex-grow flex flex-col">
            {/* Tags - moved to top for better organization */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 2).map((tag, index) => (
                  <CompanyThemedBadge key={index} variant="beta" className="text-xs font-normal">
                    {tag}
                  </CompanyThemedBadge>
                ))}
                {tags.length > 2 && (
                  <CompanyThemedBadge variant="beta" className="text-xs font-normal">
                    +{tags.length - 2}
                  </CompanyThemedBadge>
                )}
              </div>
            )}
            
            {/* Title - made slightly more prominent */}
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            
            {/* Description - with slightly better formatting */}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {description}
              </p>
            )}
            
            {/* Push metadata to bottom with flex-grow */}
            <div className="flex-grow"></div>
            
            {/* Metadata & Actions Row - better arranged */}
            <div className="flex items-center justify-between pt-2 mt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                {instructor ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7 border border-gray-200 dark:border-gray-700">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${instructor}`} alt={instructor} />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                        {getInitials(instructor)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 max-w-[100px]">
                      {instructor}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <UserRound className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Instrutor</span>
                  </div>
                )}
              </div>
              
              <div
                onClick={(e) => e.preventDefault()} 
                className="flex items-center space-x-2"
              >
                {completed ? (
                  <CompanyThemedBadge variant="outline" className="px-3 py-1">
                    Concluído
                  </CompanyThemedBadge>
                ) : progress > 0 ? (
                  <CompanyThemedBadge variant="outline" className="px-3 py-1">
                    {progress}% concluído
                  </CompanyThemedBadge>
                ) : null}
                
                <div className="rounded-full h-8 w-8 p-0 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
