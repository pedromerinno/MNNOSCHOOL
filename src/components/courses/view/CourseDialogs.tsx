
import React from 'react';
import { EditCourseDialog } from '../EditCourseDialog';
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { Company } from '@/types/company';
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';

interface CourseDialogsProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  initialFormData: CourseFormValues;
  handleCourseUpdate: (data: CourseFormValues) => Promise<void>;
  isSubmitting: boolean;
  userCompanies: Company[];
  showLessonManager: boolean;
  setShowLessonManager: (show: boolean) => void;
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
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={initialFormData}
        onSubmit={handleCourseUpdate}
        isSubmitting={isSubmitting}
        userCompanies={userCompanies}
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
