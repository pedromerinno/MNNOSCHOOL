import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LessonPageHeaderProps {
  courseTitle?: string;
  lessonTitle?: string;
  courseId?: string;
  isAdmin?: boolean;
  onManageCourse?: () => void;
  onManageLessons?: () => void;
}

export const LessonPageHeader: React.FC<LessonPageHeaderProps> = ({
  courseTitle,
  lessonTitle,
  courseId,
  isAdmin = false,
  onManageCourse,
  onManageLessons
}) => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  
  const handleCompanyClick = useCallback(() => navigate('/'), [navigate]);
  const handleCourseClick = useCallback(() => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    }
  }, [navigate, courseId]);
  
  const companyName = selectedCompany?.nome || 'Home';
  
  return (
    <div className="mb-8 pt-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto hover:bg-transparent hover:text-foreground"
            onClick={handleCompanyClick}
          >
            <Home className="h-3.5 w-3.5 mr-1" />
            <span>{companyName}</span>
          </Button>
          
          {courseTitle && (
            <>
              <ChevronRight className="h-3 w-3 mx-2" />
              {courseId ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto hover:bg-transparent hover:text-foreground"
                  onClick={handleCourseClick}
                >
                  <span className="truncate max-w-[200px]">{courseTitle}</span>
                </Button>
              ) : (
                <span className="truncate max-w-[200px]">{courseTitle}</span>
              )}
            </>
          )}
          
          {lessonTitle && (
            <>
              <ChevronRight className="h-3 w-3 mx-2" />
              <span className="text-foreground truncate max-w-[200px]">{lessonTitle}</span>
            </>
          )}
        </div>
        
        {isAdmin && courseId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onManageCourse && (
                <DropdownMenuItem onClick={onManageCourse}>
                  Editar Curso
                </DropdownMenuItem>
              )}
              {onManageLessons && (
                <DropdownMenuItem onClick={onManageLessons}>
                  Gerenciar Aulas
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

