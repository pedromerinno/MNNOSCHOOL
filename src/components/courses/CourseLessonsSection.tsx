
import React from 'react';
import { Button } from "@/components/ui/button";
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { CourseLessonList } from './CourseLessonList';

interface CourseLessonsSectionProps {
  isAdmin: boolean;
  showLessonManager: boolean;
  setShowLessonManager: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  lessons: any[];
  startLesson: (lessonId: string) => Promise<void>;
}

export const CourseLessonsSection: React.FC<CourseLessonsSectionProps> = ({
  isAdmin,
  showLessonManager,
  setShowLessonManager,
  courseId,
  courseTitle,
  lessons,
  startLesson,
}) => (
  <div className="w-full md:w-4/12 mt-8 md:mt-0 relative">
    <div className="space-y-4 mt-4">
      {/* TÍTULO UNIFICADO AQUI */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Aulas do Curso</h3>
        {isAdmin && (
          <Button 
            className="bg-primary text-white gap-2 rounded-xl font-bold text-base py-3 shadow-none"
            onClick={() => setShowLessonManager(true)}
            variant="default"
            size="sm"
            aria-label="Gerenciar aulas"
          >
            Gerenciar aulas
          </Button>
        )}
      </div>
      <LessonManager
        courseId={courseId}
        courseTitle={courseTitle}
        open={showLessonManager}
        onClose={() => setShowLessonManager(false)}
      />
      <CourseLessonList 
        lessons={lessons} 
        courseId={courseId}
        onStartLesson={startLesson}
      />
    </div>
  </div>
);
