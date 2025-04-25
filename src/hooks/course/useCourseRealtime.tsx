
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCourseRealtime = (courseId: string | undefined, refreshCourseData: () => void) => {
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
      .subscribe((status) => {
        console.log('Course view subscription status:', status);
      });
    
    return () => {
      console.log("Cleaning up course real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [courseId, refreshCourseData]);
};
