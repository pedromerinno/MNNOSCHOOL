
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/ui/EditableText";
import { Lesson } from '@/components/courses/CourseLessonList';
import { useLessonEdit } from '@/hooks/lesson/useLessonEdit';
import { useAuth } from '@/contexts/AuthContext';

interface LessonHeaderProps {
  lesson: Lesson;
  courseId: string | undefined;
  hideBackButton?: boolean;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  lesson, 
  courseId,
  hideBackButton = false 
}) => {
  const [currentTitle, setCurrentTitle] = useState(lesson?.title || '');
  const { updateLessonField } = useLessonEdit(lesson?.id);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  // Update local title when lesson changes
  useEffect(() => {
    if (lesson?.title) {
      setCurrentTitle(lesson.title);
    }
  }, [lesson?.title]);

  if (!lesson) return null;

  const handleTitleUpdate = async (newTitle: string) => {
    // Update local state immediately
    setCurrentTitle(newTitle);
    
    // Update in database
    await updateLessonField('title', newTitle);
    
    // Dispatch event for other components to update
    window.dispatchEvent(new CustomEvent('lesson-field-updated', {
      detail: {
        lessonId: lesson.id,
        field: 'title',
        value: newTitle
      }
    }));
  };

  return (
    <>
      {!hideBackButton && (
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o curso
          </Link>
        </Button>
      )}
      
      <EditableText
        value={currentTitle}
        onSave={handleTitleUpdate}
        className="text-3xl font-bold mb-4"
        canEdit={isAdmin}
      />
    </>
  );
};
