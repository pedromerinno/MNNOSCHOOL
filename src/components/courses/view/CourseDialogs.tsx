
import React from 'react';
import { EditCourseDialog } from '../EditCourseDialog';
import { LessonManager } from '@/components/admin/courses/LessonManager';

interface CourseDialogsProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  initialFormData: any;
  handleCourseUpdate: (data: any) => Promise<any>;
  isSubmitting: boolean;
  userCompanies: Array<{ id: string; nome: string }>;
  showLessonManager: boolean;
  setShowLessonManager: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

export const CourseDialogs: React.FC<CourseDialogsProps> = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  initialFormData,
  handleCourseUpdate,
  isSubmitting,
  userCompanies,
  showLessonManager,
  setShowLessonManager,
  courseId,
  courseTitle
}) => {
  return (
    <>
      <EditCourseDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={initialFormData}
        onSubmit={handleCourseUpdate}
        isSubmitting={isSubmitting}
        availableCompanies={userCompanies}
      />

      <LessonManager
        courseId={courseId}
        courseTitle={courseTitle}
        open={showLessonManager}
        onClose={() => setShowLessonManager(false)}
      />
    </>
  );
};
