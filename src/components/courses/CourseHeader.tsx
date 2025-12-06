
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, ChevronRight } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  instructor: string | null;
}

export const CourseHeader: React.FC<CourseHeaderProps> = React.memo(({ 
  title,
  instructor
}) => {
  const navigate = useNavigate();
  
  const handleHomeClick = useCallback(() => navigate('/'), [navigate]);
  const handleCoursesClick = useCallback(() => navigate('/courses'), [navigate]);
  
  return (
    <div className="mb-8">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto hover:bg-transparent hover:text-foreground"
          onClick={handleHomeClick}
        >
          <Home className="h-3.5 w-3.5 mr-1" />
          <span>Home</span>
        </Button>
        
        <ChevronRight className="h-3 w-3 mx-2" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto hover:bg-transparent hover:text-foreground"
          onClick={handleCoursesClick}
        >
          <span>Cursos</span>
        </Button>
        
        <ChevronRight className="h-3 w-3 mx-2" />
        
        <span className="text-foreground truncate max-w-[200px]">{title}</span>
      </div>
    </div>
  );
});
