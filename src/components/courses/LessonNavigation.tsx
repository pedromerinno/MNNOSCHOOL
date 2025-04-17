
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface LessonNavigationProps {
  previousLesson: { id: string; title: string; type: string } | null;
  nextLesson: { id: string; title: string; type: string } | null;
  onNavigate: (lessonId: string) => void;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  previousLesson,
  nextLesson,
  onNavigate
}) => {
  return (
    <div className="flex justify-between items-center border-t border-border mt-8 pt-6">
      {previousLesson ? (
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onNavigate(previousLesson.id)} 
            className="rounded-full h-10 w-10 flex items-center justify-center shadow-sm"
            aria-label="Aula anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => onNavigate(previousLesson.id)} 
            className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
          >
            <div>
              <span className="block text-xs text-muted-foreground">Anterior</span>
              <span className="block text-sm truncate max-w-[150px] text-foreground font-medium">{previousLesson.title}</span>
            </div>
          </Button>
        </div>
      ) : (
        <div></div>
      )}
      
      {nextLesson ? (
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate(nextLesson.id)}
            className="flex items-center gap-2 text-right p-0 h-auto hover:bg-transparent"
          >
            <div className="text-right">
              <span className="block text-xs text-muted-foreground">Próxima</span>
              <span className="block text-sm truncate max-w-[150px] text-foreground font-medium">{nextLesson.title}</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onNavigate(nextLesson.id)} 
            className="rounded-full h-10 w-10 flex items-center justify-center shadow-sm"
            aria-label="Próxima aula"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};
