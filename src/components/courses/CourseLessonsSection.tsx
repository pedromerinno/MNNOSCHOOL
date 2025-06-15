
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { CourseLessonList } from './CourseLessonList';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CourseLessonsSectionProps {
  isAdmin: boolean;
  showLessonManager: boolean;
  setShowLessonManager: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  lessons: any[];
  startLesson: (lessonId: string) => Promise<void>;
  refreshCourseData: () => void;
}

export const CourseLessonsSection: React.FC<CourseLessonsSectionProps> = ({
  isAdmin,
  showLessonManager,
  setShowLessonManager,
  courseId,
  courseTitle,
  lessons,
  startLesson,
  refreshCourseData
}) => {
  // Setup real-time subscription for lessons - with proper cleanup
  useEffect(() => {
    if (!courseId) return;

    // Use a unique channel name to prevent duplicate subscriptions
    const channelName = `course-lessons-${courseId}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Setting up real-time subscription for course lessons: ${courseId} (${channelName})`);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `course_id=eq.${courseId}`
      }, (payload) => {
        console.log('Lesson update detected:', payload);
        
        // Don't show toast here - let parent component handle that
        refreshCourseData();
      })
      .subscribe((status) => {
        console.log(`Course lessons subscription status (${channelName}): ${status}`);
      });
    
    return () => {
      console.log(`Cleaning up course lessons subscription (${channelName})`);
      supabase.removeChannel(channel);
    };
  }, [courseId, refreshCourseData]);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Aulas do Curso
          </CardTitle>
          
          {isAdmin && (
            <Button 
              className="gap-1 rounded-lg font-normal text-sm shadow-none"
              onClick={() => setShowLessonManager(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Gerenciar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <LessonManager
          courseId={courseId}
          courseTitle={courseTitle}
          open={showLessonManager}
          onClose={() => setShowLessonManager(false)}
        />
        
        <div className="max-h-[60vh] overflow-y-auto">
          <CourseLessonList 
            lessons={lessons} 
            courseId={courseId}
            onStartLesson={startLesson}
          />
        </div>
      </CardContent>
    </Card>
  );
};
