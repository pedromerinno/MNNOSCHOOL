
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
        <Button 
          variant="outline" 
          onClick={() => onNavigate(previousLesson.id)} 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <div>
            <span className="block text-xs text-muted-foreground">Anterior</span>
            <span className="block text-sm truncate max-w-[150px]">{previousLesson.title}</span>
          </div>
        </Button>
      ) : (
        <div></div>
      )}
      
      {nextLesson ? (
        <Button 
          onClick={() => onNavigate(nextLesson.id)}
          className="flex items-center gap-2"
        >
          <div className="text-right">
            <span className="block text-xs text-primary-foreground">Próxima</span>
            <span className="block text-sm truncate max-w-[150px]">{nextLesson.title}</span>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <div></div>
      )}
    </div>
  );
};
