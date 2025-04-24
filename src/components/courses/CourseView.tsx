
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonNavigation } from './useLessonNavigation';
import { CourseHeader } from './CourseHeader';
import { CourseHero } from './CourseHero';
import { CourseNotFound } from './CourseNotFound';
import { CourseStatsBar } from './CourseStatsBar';
import { CourseProgressBox } from './CourseProgressBox';
import { CourseLessonsSection } from './CourseLessonsSection';
import { CourseViewSkeleton } from './CourseViewSkeleton';
import { CourseContent } from './CourseContent';
import { EditCourseDialog } from './EditCourseDialog';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { useCourseEdit } from '@/hooks/course/useCourseEdit';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error, refreshCourseData } = useCourseData(courseId);
  const { startLesson } = useLessonNavigation(courseId);
  const [activeTab, setActiveTab] = useState<string>("description");
  const { selectedCompany, userCompanies } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  const [showLessonManager, setShowLessonManager] = useState(false);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSubmitting,
    courseCompanyIds,
    handleEditCourse,
    handleCourseUpdate
  } = useCourseEdit(courseId);
  
  // Setup real-time course updates subscription
  useEffect(() => {
    if (!courseId) return;
    
    console.log(`Setting up realtime subscription for course: ${courseId}`);
    
    const channel = supabase
      .channel(`course-details-${courseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses',
        filter: `id=eq.${courseId}`
      }, (payload) => {
        console.log('Course update detected:', payload);
        toast.info("Curso atualizado", {
          description: "As informações do curso foram atualizadas."
        });
        refreshCourseData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `course_id=eq.${courseId}`
      }, (payload) => {
        console.log('Lesson update for course detected:', payload);
        
        // Show different messages based on the event type
        if (payload.eventType === 'INSERT') {
          toast.info("Nova aula adicionada", {
            description: "Uma nova aula foi adicionada ao curso."
          });
        } else if (payload.eventType === 'UPDATE') {
          toast.info("Aula atualizada", {
            description: "Uma aula do curso foi atualizada."
          });
        } else if (payload.eventType === 'DELETE') {
          toast.info("Aula removida", {
            description: "Uma aula foi removida do curso."
          });
        }
        
        refreshCourseData();
      })
      .subscribe();
    
    return () => {
      console.log("Cleaning up course real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [courseId, refreshCourseData]);
  
  // Ensure data is refreshed once dialog closes (after an update)
  useEffect(() => {
    const handleCourseUpdated = (event: CustomEvent) => {
      if (event.detail?.courseId === courseId) {
        refreshCourseData();
      }
    };

    window.addEventListener('course-updated', handleCourseUpdated as EventListener);
    
    return () => {
      window.removeEventListener('course-updated', handleCourseUpdated as EventListener);
    };
  }, [courseId, refreshCourseData]);
  
  // Pre-load data when on course page to prevent any flickering
  useEffect(() => {
    if (courseId && !loading && !error) {
      // Keep data fresh by polling occasionally
      const refreshInterval = setInterval(() => {
        refreshCourseData();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [courseId, refreshCourseData, loading, error]);
  
  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!course || error) {
    return <CourseNotFound />;
  }

  const initialFormData = {
    id: course.id,
    title: course.title,
    description: course.description || "",
    image_url: course.image_url || "",
    instructor: course.instructor || "",
    tags: course.tags || [],
    companyIds: courseCompanyIds,
  };

  const totalDuration = course.lessons?.reduce((total, lesson) => {
    const minutes = lesson.duration 
      ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) 
      : 0;
    return total + minutes;
  }, 0) || 0;
  
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
          firstLessonId={course.lessons?.[0]?.id}
          showEditButton={isAdmin}
          onEditCourse={handleEditCourse}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-8/12 space-y-8">
          <CourseStatsBar
            duration={formattedDuration}
            lessonCount={course.lessons?.length || 0}
            tags={course.tags}
          />

          <CourseProgressBox progress={course.progress} />

          <CourseContent 
            description={course.description}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            companyColor={companyColor}
          />
        </div>
        
        <CourseLessonsSection
          isAdmin={isAdmin}
          showLessonManager={showLessonManager}
          setShowLessonManager={setShowLessonManager}
          courseId={course.id}
          courseTitle={course.title}
          lessons={course.lessons}
          startLesson={startLesson}
        />
      </div>

      {/* EditCourseDialog */}
      <EditCourseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={initialFormData}
        onSubmit={handleCourseUpdate}
        isSubmitting={isSubmitting}
        userCompanies={userCompanies}
      />

      <LessonManager
        courseId={course.id}
        courseTitle={course.title}
        open={showLessonManager}
        onClose={() => setShowLessonManager(false)}
      />
    </div>
  );
};
