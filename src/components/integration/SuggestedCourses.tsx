import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Plus, User, Clock, GraduationCap, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { SuggestCourseDialog } from './suggested-courses/SuggestCourseDialog';
import { SuggestedCourseCard } from './suggested-courses/SuggestedCourseCard';
import { PagePreloader } from '@/components/ui/PagePreloader';

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
  order_index?: number;
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    instructor: string;
    tags: string[];
  };
  suggested_by_profile: {
    display_name: string;
  };
}

interface SuggestedCoursesProps {
  companyColor: string;
}

export const SuggestedCourses: React.FC<SuggestedCoursesProps> = ({ companyColor }) => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [suggestedCourses, setSuggestedCourses] = useState<SuggestedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  const fetchSuggestedCourses = async () => {
    if (!userProfile?.id || !selectedCompany?.id) return;
    
    setIsLoading(true);
    try {
      console.log('[SuggestedCourses] Fetching suggestions for user:', userProfile.id, 'company:', selectedCompany.id);
      
      // Buscar as sugestões ordenadas pelo order_index definido pelo admin
      // Usar order_index primeiro, depois created_at como fallback
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('user_course_suggestions')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', userProfile.id)
        .eq('company_id', selectedCompany.id)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (suggestionsError) {
        console.error('Error fetching course suggestions:', suggestionsError);
        toast.error('Erro ao carregar cursos sugeridos');
        return;
      }

      if (!suggestions || suggestions.length === 0) {
        console.log('[SuggestedCourses] No suggestions found for this user/company');
        setSuggestedCourses([]);
        return;
      }

      console.log('[SuggestedCourses] Raw suggestions from DB (ordered):', suggestions.map(s => ({ 
        id: s.id, 
        order_index: s.order_index, 
        course_title: s.course?.title,
        created_at: s.created_at
      })));

      const suggesterIds = suggestions.map(s => s.suggested_by);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', suggesterIds);

      if (profilesError) {
        console.error('Error fetching suggester profiles:', profilesError);
        toast.error('Erro ao carregar informações dos sugestores');
        return;
      }

      // Enriquecer com perfis dos sugestores e manter a ordem do banco
      const enrichedSuggestions = suggestions.map(suggestion => {
        const suggesterProfile = profiles?.find(p => p.id === suggestion.suggested_by);
        return {
          ...suggestion,
          suggested_by_profile: {
            display_name: suggesterProfile?.display_name || 'Usuário desconhecido'
          }
        };
      });

      console.log('[SuggestedCourses] Final suggestions (maintaining DB order):', enrichedSuggestions.map(s => ({ 
        course_title: s.course?.title, 
        order_index: s.order_index,
        created_at: s.created_at
      })));
      
      setSuggestedCourses(enrichedSuggestions);
    } catch (error) {
      console.error('Error fetching suggested courses:', error);
      toast.error('Erro ao carregar cursos sugeridos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('user_course_suggestions')
        .delete()
        .eq('id', suggestionId);

      if (error) {
        console.error('Error removing suggestion:', error);
        toast.error('Erro ao remover sugestão');
        return;
      }

      toast.success('Sugestão removida com sucesso');
      fetchSuggestedCourses();
    } catch (error) {
      console.error('Error removing suggestion:', error);
      toast.error('Erro ao remover sugestão');
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchSuggestedCourses();
  }, [userProfile?.id, selectedCompany?.id]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  if (isLoading) {
    return <PagePreloader />;
  }

  return (
    <div className="bg-white dark:bg-[#222222] rounded-[30px] border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30">
      <div className="space-y-8">
        {/* Courses grid */}
        {suggestedCourses.length === 0 ? (
          <div className={`flex justify-center py-16 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}>
            <EmptyState
              title="Nenhum curso sugerido"
              description={
                isAdmin 
                  ? "Ainda não há cursos sugeridos para este usuário." 
                  : "Ainda não há cursos sugeridos para você. Quando houver, aparecerão aqui!"
              }
              icons={[BookOpen, GraduationCap, Star]}
              action={isAdmin ? {
                label: "Sugerir Curso",
                onClick: () => setIsSuggestDialogOpen(true)
              } : undefined}
            />
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}>
            {suggestedCourses.map((suggestion, index) => (
              <div
                key={suggestion.id}
                style={{ transitionDelay: `${index * 50 + 200}ms` }}
              >
                <SuggestedCourseCard
                  suggestion={suggestion}
                  companyColor={companyColor}
                  onRemove={handleRemoveSuggestion}
                  canRemove={isAdmin}
                />
              </div>
            ))}
          </div>
        )}

        <SuggestCourseDialog
          open={isSuggestDialogOpen}
          onOpenChange={setIsSuggestDialogOpen}
          companyId={selectedCompany?.id || ''}
          companyColor={companyColor}
          onCourseSuggested={fetchSuggestedCourses}
        />
      </div>
    </div>
  );
};
