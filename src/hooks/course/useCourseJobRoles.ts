
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCourseJobRoles = (courseId?: string) => {
  const [jobRoleIds, setJobRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourseJobRoles = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_job_roles')
        .select('job_role_id')
        .eq('course_id', courseId);

      if (error) throw error;

      const roleIds = data?.map(item => item.job_role_id) || [];
      setJobRoleIds(roleIds);
    } catch (error: any) {
      console.error('Error fetching course job roles:', error);
      toast.error('Erro ao carregar cargos do curso');
    } finally {
      setLoading(false);
    }
  };

  const updateCourseJobRoles = async (courseId: string, newJobRoleIds: string[]) => {
    try {
      // Remove existing relations
      const { error: deleteError } = await supabase
        .from('course_job_roles')
        .delete()
        .eq('course_id', courseId);

      if (deleteError) throw deleteError;

      // Add new relations if any are selected
      if (newJobRoleIds && newJobRoleIds.length > 0) {
        const insertData = newJobRoleIds.map(roleId => ({
          course_id: courseId,
          job_role_id: roleId
        }));

        const { error: insertError } = await supabase
          .from('course_job_roles')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      setJobRoleIds(newJobRoleIds);
      return true;
    } catch (error: any) {
      console.error('Error updating course job roles:', error);
      toast.error('Erro ao atualizar controle de acesso por cargo');
      return false;
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseJobRoles();
    }
  }, [courseId]);

  return {
    jobRoleIds,
    loading,
    updateCourseJobRoles,
    refetch: fetchCourseJobRoles
  };
};
