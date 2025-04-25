
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useLessonRealtime = (courseId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!courseId) return;

    const hookInstanceId = Math.random().toString(36).substring(2, 9);
    const channelId = `lessons-hook-${courseId}-${hookInstanceId}`;
    console.log(`Creating channel: ${channelId}`);
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          console.log(`Received real-time update in lessons hook (${channelId}):`, payload);
          onUpdate();
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelId}: ${status}`);
      });

    return () => {
      console.log(`Cleaning up real-time subscription for lessons hook: ${channelId}`);
      supabase.removeChannel(channel);
    };
  }, [courseId, onUpdate]);
};
