
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonNavigation } from './useLessonNavigation';
import { CourseHeader } from './CourseHeader';
import { CourseHero } from './CourseHero';
import { CourseLessonList } from './CourseLessonList';
import { CourseViewSkeleton } from './CourseViewSkeleton';
import { CourseNotFound } from './CourseNotFound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseDescription } from './CourseDescription';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Star } from 'lucide-react';

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading } = useCourseData(courseId);
  const { startLesson } = useLessonNavigation(courseId);
  const [activeTab, setActiveTab] = useState<string>("description");

  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  const firstLessonId = course.lessons && course.lessons.length > 0 ? course.lessons[0].id : undefined;

  // Calculate total duration of the course
  const totalDuration = course.lessons && course.lessons.length > 0 
    ? course.lessons.reduce((total, lesson) => {
        // Extract minutes from duration string (e.g., "15 min" -> 15)
        const minutes = lesson.duration 
          ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) 
          : 0;
        return total + minutes;
      }, 0)
    : 0;
  
  // Format total duration as hours and minutes
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const formattedDuration = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes} min` : ''}` 
    : `${minutes} min`;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <CourseHeader 
        title={course.title} 
        instructor={course.instructor} 
      />
      
      <div className="mb-8">
        <CourseHero 
          imageUrl={course.image_url} 
          title={course.title}
          instructor={course.instructor || ""}
          favorite={course.favorite || false}
          courseId={course.id}
          firstLessonId={firstLessonId}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-8/12 space-y-8">
          {/* Course stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formattedDuration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{course.lessons?.length || 0} lições</span>
            </div>
            {course.tags && course.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Course progress if started */}
          {course.progress > 0 && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Seu progresso</h3>
                <span className="text-sm">{course.progress}% concluído</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Tabs for content */}
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <CourseDescription description={course.description} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="text-center py-8">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">Sem avaliações ainda</h3>
                <p className="text-muted-foreground">
                  Seja o primeiro a avaliar este curso
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-full md:w-4/12 mt-8 md:mt-0">
          <CourseLessonList 
            lessons={course.lessons} 
            courseId={course.id}  
            onStartLesson={startLesson} 
          />
        </div>
      </div>
    </div>
  );
};
