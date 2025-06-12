
import { useState } from 'react';
import { useLessonsFetching } from './lesson/useLessonsFetching';
import { useLessonRealtime } from './lesson/useLessonRealtime';
import { useLessonMutations } from './lesson/useLessonMutations';
import type { ExtendedLesson } from './lesson/types';

export type { ExtendedLesson };

export const useLessons = (courseId: string) => {
  const [selectedLesson, setSelectedLesson] = useState<ExtendedLesson | undefined>(undefined);
  const { lessons, isLoading, fetchLessons } = useLessonsFetching(courseId);
  const { isSubmitting, handleCreateLesson, handleUpdateLesson, handleReorderLessons, handleDeleteLesson } = 
    useLessonMutations(courseId, fetchLessons);
  
  // Set up real-time subscription
  useLessonRealtime(courseId, () => fetchLessons(true));

  return {
    lessons,
    isLoading,
    selectedLesson,
    setSelectedLesson,
    isSubmitting,
    fetchLessons,
    handleCreateLesson,
    handleUpdateLesson,
    handleReorderLessons,
    handleDeleteLesson,
  };
};
