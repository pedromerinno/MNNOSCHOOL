
import { Lesson } from '@/components/courses/CourseLessonList';

export interface ExtendedLesson extends Omit<Lesson, 'content'> {
  content?: string;
}
